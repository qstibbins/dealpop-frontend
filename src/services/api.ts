import { getAuth } from 'firebase/auth';
import { API_CONFIG } from '../config/api';

class ApiService {
  private async getAuthToken(): Promise<string> {
    const user = getAuth().currentUser;
    if (!user) throw new Error('User not authenticated');
    return await user.getIdToken();
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getAuthToken();
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'API request failed');
    }

    return data;
  }

  // Tracked Products API (DealPop backend endpoints)
  async getProducts(filters?: any) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return this.request(`/api/products?${params.toString()}`);
  }

  async createProduct(data: any) {
    // Transform frontend data to backend format
    const backendData = {
      url: data.product_url || data.url,
      title: data.product_name || data.title,
      price_goal: data.target_price || data.price_goal,
      site: data.vendor || data.site,
      variants: data.variants || {}
    };
    
    return this.request('/api/products', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });
  }

  async updateProduct(id: string, data: any) {
    // Transform frontend data to backend format for PATCH /api/products/:id/update
    const backendData: any = {};
    if (data.target_price !== undefined) backendData.price_goal = data.target_price;
    if (data.expires_at !== undefined) backendData.expires_at = data.expires_at;
    if (data.status !== undefined) backendData.active = data.status === 'tracking';
    
    return this.request(`/api/products/${id}/update`, {
      method: 'PATCH',
      body: JSON.stringify(backendData),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/api/products/${id}`, { method: 'DELETE' });
  }

  async stopTracking(id: string) {
    return this.request(`/api/products/${id}/stop`, { method: 'POST' });
  }

  async getPriceHistory(id: string, params?: { limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    return this.request(`/api/products/${id}/price-history?${queryParams.toString()}`);
  }

  // Alerts API
  async getAlerts(filters?: any) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return this.request(`/api/alerts?${params.toString()}`);
  }

  async createAlert(data: any) {
    return this.request('/api/alerts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAlert(id: string, data: any) {
    return this.request(`/api/alerts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAlert(id: string) {
    return this.request(`/api/alerts/${id}`, { method: 'DELETE' });
  }

  async dismissAlert(id: string) {
    return this.request(`/api/alerts/${id}/dismiss`, { method: 'PUT' });
  }

  async getAlertHistory(alertId: string) {
    return this.request(`/api/alerts/${alertId}/history`);
  }

  // User Profile API
  async getUserProfile() {
    return this.request('/api/users/profile');
  }

  // Notification Preferences API
  async getUserPreferences() {
    return this.request('/api/notifications/preferences');
  }

  async updateUserPreferences(data: any) {
    return this.request('/api/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getNotificationLogs(params?: { limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    return this.request(`/api/notifications/logs?${queryParams.toString()}`);
  }

  // A/B Testing API
  async recordABTestEvent(event: any) {
    return this.request('/api/ab-test/event', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  async getABTestAnalytics(filters?: any) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    return this.request(`/api/analytics/ab-test?${params.toString()}`);
  }

  // Search API
  async getSearchSuggestions(query: string) {
    return this.request(`/api/search/suggestions?query=${encodeURIComponent(query)}`);
  }

  async getVendors() {
    return this.request('/api/search/vendors');
  }

  async getSearchStats() {
    return this.request('/api/search/stats');
  }

  // Stats and Analytics API
  async getStats() {
    return this.request('/api/stats');
  }
}

export const apiService = new ApiService(); 