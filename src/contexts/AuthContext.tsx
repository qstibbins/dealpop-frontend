import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { authAdapter } from '../services/authAdapter';

// Get Chrome extension ID from environment
const EXTENSION_ID = import.meta.env.VITE_EXTENSION_ID;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ user: User | null; error: string | null }>;
  signInWithFacebook: () => Promise<{ user: User | null; error: string | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  createAccountWithEmail: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 AuthContext useEffect - setting up auth listener');
    let isInitialLoad = true;
    
    const unsubscribe = authAdapter.onAuthStateChanged((user) => {
      console.log('🔍 Auth state changed - user:', user ? user.email : 'null');
      console.log('🔍 Is initial load:', isInitialLoad);
      
      setUser(user);
      setLoading(false);
      
      if (user && !isInitialLoad) {
        console.log('🔍 User logged in (NEW session), checking extension auth');
        
        // Check if this is from the extension and send auth data back
        sendAuthToExtension(user);
      } else if (user && isInitialLoad) {
        console.log('🔍 User already logged in (EXISTING session)');
        
        // Check if we're in extension context
        const urlParams = new URLSearchParams(window.location.search);
        const isExtensionAuth = urlParams.get('extension') === 'true';
        
        console.log('🔍 URL params:', window.location.search);
        console.log('🔍 Extension param value:', urlParams.get('extension'));
        console.log('🔍 isExtensionAuth:', isExtensionAuth);
        
        if (isExtensionAuth) {
          console.log('🔍 Extension auth requested - sending existing session data');
          sendAuthToExtension(user);
        } else {
          console.log('🔍 No extension auth detected, not sending data');
        }
      }
      
      // After first auth state change, no longer initial load
      isInitialLoad = false;
    });

    // Listen for messages from extension (like logout events)
    const handleExtensionMessage = (event: MessageEvent) => {
      // Only listen to messages from the extension
      if (event.origin !== window.location.origin) return;
      
      const message = event.data;
      if (message.type === 'EXTENSION_LOGOUT') {
        console.log('🔍 Received logout message from extension');
        handleExtensionLogout();
      }
    };

    // Listen for Chrome extension messages
    const handleChromeMessage = (message: any, _sender: any, sendResponse: any) => {
      if (message.type === 'EXTENSION_LOGOUT') {
        console.log('🔍 Received logout message from extension via Chrome API');
        handleExtensionLogout();
        sendResponse({ success: true });
      }
    };

    // Add both message listeners
    window.addEventListener('message', handleExtensionMessage);
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener(handleChromeMessage);
    }

    return () => {
      unsubscribe();
      window.removeEventListener('message', handleExtensionMessage);
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.removeListener(handleChromeMessage);
      }
    };
  }, []);

  /**
   * Handle logout message from extension
   */
  const handleExtensionLogout = async () => {
    console.log('🔍 Extension requested logout - signing out dashboard user');
    try {
      await authAdapter.signOut();
      console.log('✅ Dashboard user signed out due to extension logout');
    } catch (error) {
      console.error('❌ Failed to sign out dashboard user:', error);
    }
  };

  /**
   * Sends authentication data to Chrome extension
   * Call this after successful Firebase authentication
   */
  const sendAuthToExtension = async (user: User) => {
    console.log('🔍 sendAuthToExtension called for user:', user.email);
    console.log('🔍 EXTENSION_ID from env:', EXTENSION_ID);
    
    // Check if this login came from the extension
    const fullUrl = window.location.href;
    const urlParams = new URLSearchParams(window.location.search);
    const isFromExtension = urlParams.get('extension') === 'true' || fullUrl.includes('extension=true');
    
    console.log('🔍 Full URL:', fullUrl);
    console.log('🔍 URL search:', window.location.search);
    console.log('🔍 URL params extension:', urlParams.get('extension'));
    console.log('🔍 URL includes extension=true:', fullUrl.includes('extension=true'));
    console.log('🔍 isFromExtension:', isFromExtension);
    console.log('🔍 EXTENSION_ID:', EXTENSION_ID);
    console.log('🔍 Chrome runtime available:', !!window.chrome?.runtime);
    
    if (!isFromExtension) {
      console.log('❌ Not from extension, skipping extension auth');
      return;
    }

    // Verify extension ID is configured
    if (!EXTENSION_ID) {
      console.error('VITE_EXTENSION_ID not configured in environment variables');
      return;
    }

    // Verify Chrome extension API is available
    if (typeof window.chrome === 'undefined' || !window.chrome.runtime || !window.chrome.runtime.sendMessage) {
      console.error('❌ Chrome runtime API not available');
      console.error('❌ This page must be opened from the Chrome extension to send auth messages');
      console.log('Chrome object:', window.chrome);
      console.log('Runtime object:', window.chrome?.runtime);
      alert('Error: Chrome extension API not available. Please open this page from the extension.');
      return;
    }

    try {
      // Get Firebase ID token and force refresh to ensure it's valid
      const token = await user.getIdToken(true);
      
      // Validate we have real user data and token
      if (!token || !user.uid || !user.email) {
        console.error('❌ Invalid user data or token, not sending to extension');
        return;
      }

      // Additional validation: check if token is not expired
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (tokenPayload.exp && tokenPayload.exp < currentTime) {
          console.error('❌ Token is expired, not sending to extension');
          return;
        }
        
        console.log('✅ Token validation passed, expires at:', new Date(tokenPayload.exp * 1000));
      } catch (tokenError) {
        console.warn('⚠️ Could not validate token expiry, proceeding anyway:', tokenError);
      }
      
      console.log('📤 Sending auth to extension:', EXTENSION_ID);
      console.log('📤 User data:', { uid: user.uid, email: user.email, token: token.substring(0, 20) + '...' });

      // Send message to extension
      chrome.runtime.sendMessage(
        EXTENSION_ID,
        {
          type: 'EXTENSION_AUTH_SUCCESS',
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          },
          token: token
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error('❌ Failed to send to extension:', chrome.runtime.lastError.message);
            console.log('❌ Extension may not be running or may not be responding');
          } else {
            console.log('✅ Auth successfully sent to extension');
          }
        }
      );

      // Always close window after sending auth (don't wait for extension response)
      console.log('🔄 Closing auth window in 3 seconds...');
      setTimeout(() => {
        console.log('🚪 Attempting to close auth window');
        
        // Try to close the window
        window.close();
        
        // Check if window is still open after attempting to close
        setTimeout(() => {
          if (!window.closed) {
            console.log('⚠️ Window could not be closed automatically (opened in regular tab)');
            // Show user message to close manually
            alert('Authentication complete! You can now close this tab and return to the extension.');
          }
        }, 100);
      }, 3000);
    } catch (error) {
      console.error('Error sending auth to extension:', error);
      
      // Send error to extension
      if (window.chrome?.runtime && EXTENSION_ID) {
        chrome.runtime.sendMessage(EXTENSION_ID, {
          type: 'EXTENSION_AUTH_ERROR',
          error: error instanceof Error ? error.message : 'Authentication failed'
        });
      }
    }
  };

  const signInWithGoogle = async () => {
    console.log('🔍 signInWithGoogle called');
    const result = await authAdapter.signInWithGoogle();
    console.log('🔍 signInWithGoogle result:', result);
    return result;
  };

  const signInWithFacebook = async () => {
    return await authAdapter.signInWithFacebook();
  };

  const signInWithEmail = async (email: string, password: string) => {
    return await authAdapter.signInWithEmail(email, password);
  };

  const createAccountWithEmail = async (email: string, password: string) => {
    return await authAdapter.createAccountWithEmail(email, password);
  };

  const signOut = async () => {
    return await authAdapter.signOut();
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithFacebook,
    signInWithEmail,
    createAccountWithEmail,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 