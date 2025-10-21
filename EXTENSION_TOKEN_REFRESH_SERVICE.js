/**
 * Chrome Extension Token Refresh Service
 * 
 * This service handles token refresh for Chrome extensions that have removed Firebase SDK.
 * It communicates with the DealPop dashboard to get fresh Firebase JWT tokens.
 * 
 * Usage in your Chrome extension:
 * 1. Import this service
 * 2. Call refreshToken() when you get 401 errors
 * 3. Update your stored token with the fresh one
 */

class ExtensionTokenRefreshService {
  constructor(dashboardUrl, extensionId) {
    this.dashboardUrl = dashboardUrl;
    this.extensionId = extensionId;
    this.refreshPromise = null; // Prevent multiple simultaneous refresh requests
  }

  /**
   * Request a fresh token from the dashboard
   * @returns {Promise<{success: boolean, token?: string, expiresAt?: number, error?: string, requiresReauth?: boolean}>}
   */
  async refreshToken() {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this._performTokenRefresh();
    
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  async _performTokenRefresh() {
    console.log('🔄 Extension requesting token refresh from dashboard');
    
    try {
      // Method 1: Try Chrome runtime messaging (if dashboard tab is open)
      const chromeResult = await this._tryChromeRuntimeRefresh();
      if (chromeResult.success) {
        return chromeResult;
      }

      // Method 2: Try opening dashboard in new tab for refresh
      const tabResult = await this._tryTabRefresh();
      if (tabResult.success) {
        return tabResult;
      }

      // Method 3: Try direct API call (if CORS allows)
      const apiResult = await this._tryDirectApiRefresh();
      if (apiResult.success) {
        return apiResult;
      }

      return {
        success: false,
        error: 'All token refresh methods failed',
        requiresReauth: true
      };

    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      return {
        success: false,
        error: error.message,
        requiresReauth: true
      };
    }
  }

  /**
   * Try to refresh token via Chrome runtime messaging
   */
  async _tryChromeRuntimeRefresh() {
    return new Promise((resolve) => {
      // Send message to all tabs with dashboard URL
      chrome.tabs.query({ url: `${this.dashboardUrl}/*` }, (tabs) => {
        if (tabs.length === 0) {
          resolve({ success: false, error: 'No dashboard tabs open' });
          return;
        }

        // Send refresh request to the first dashboard tab
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'EXTENSION_TOKEN_REFRESH_REQUEST'
        }, (response) => {
          if (chrome.runtime.lastError) {
            resolve({ success: false, error: chrome.runtime.lastError.message });
          } else if (response && response.success) {
            resolve(response);
          } else {
            resolve({ success: false, error: response?.error || 'Unknown error' });
          }
        });
      });
    });
  }

  /**
   * Try to refresh token by opening dashboard tab
   */
  async _tryTabRefresh() {
    return new Promise((resolve) => {
      // Open dashboard with extension auth parameter
      chrome.tabs.create({
        url: `${this.dashboardUrl}?extension=true&refresh=true`,
        active: false
      }, (tab) => {
        if (chrome.runtime.lastError) {
          resolve({ success: false, error: chrome.runtime.lastError.message });
          return;
        }

        // Listen for messages from the new tab
        const messageListener = (message, sender, sendResponse) => {
          if (sender.tab?.id === tab.id && message.type === 'EXTENSION_TOKEN_REFRESH_RESPONSE') {
            chrome.runtime.onMessage.removeListener(messageListener);
            chrome.tabs.remove(tab.id); // Close the tab
            resolve(message);
          }
        };

        chrome.runtime.onMessage.addListener(messageListener);

        // Timeout after 30 seconds
        setTimeout(() => {
          chrome.runtime.onMessage.removeListener(messageListener);
          chrome.tabs.remove(tab.id);
          resolve({ success: false, error: 'Token refresh timeout' });
        }, 30000);
      });
    });
  }

  /**
   * Try direct API call (may fail due to CORS)
   */
  async _tryDirectApiRefresh() {
    try {
      // This will likely fail due to CORS, but worth trying
      const response = await fetch(`${this.dashboardUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ extensionId: this.extensionId })
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, ...data };
      } else {
        return { success: false, error: 'API refresh failed' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if token is expired or will expire soon
   * @param {string} token - JWT token
   * @param {number} bufferMinutes - Minutes before expiry to consider token "expired"
   */
  isTokenExpired(token, bufferMinutes = 5) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const bufferTime = bufferMinutes * 60;
      
      return payload.exp < (currentTime + bufferTime);
    } catch (error) {
      console.warn('⚠️ Could not parse token, considering expired');
      return true;
    }
  }

  /**
   * Get token expiration time
   * @param {string} token - JWT token
   */
  getTokenExpiration(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return new Date(payload.exp * 1000);
    } catch (error) {
      return null;
    }
  }
}

// Example usage in your Chrome extension:
/*
// Initialize the service
const tokenService = new ExtensionTokenRefreshService(
  'https://www.dealpop.co/beta', // Your dashboard URL - USE WWW VERSION WITH BETA PATH
  chrome.runtime.id // Your extension ID
);

// In your API request handler:
async function makeAuthenticatedRequest(url, options = {}) {
  let token = await chrome.storage.local.get(['authToken']);
  token = token.authToken;

  // Check if token is expired
  if (tokenService.isTokenExpired(token)) {
    console.log('🔄 Token expired, refreshing...');
    const refreshResult = await tokenService.refreshToken();
    
    if (refreshResult.success) {
      token = refreshResult.token;
      // Store the new token
      await chrome.storage.local.set({ authToken: token });
      console.log('✅ Token refreshed successfully');
    } else {
      console.error('❌ Token refresh failed:', refreshResult.error);
      // Handle authentication failure
      if (refreshResult.requiresReauth) {
        // Redirect to login or show login prompt
        await redirectToLogin();
        return;
      }
    }
  }

  // Make the request with the token
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });

  // If still getting 401, try one more refresh
  if (response.status === 401) {
    console.log('🔄 Got 401, trying token refresh...');
    const refreshResult = await tokenService.refreshToken();
    
    if (refreshResult.success) {
      token = refreshResult.token;
      await chrome.storage.local.set({ authToken: token });
      
      // Retry the request
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`
        }
      });
    }
  }

  return response;
}
*/

export default ExtensionTokenRefreshService;
