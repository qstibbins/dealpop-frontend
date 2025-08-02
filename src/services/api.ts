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

  // Products API
  async getProducts(filters?: any) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object') {
            params.append(key, JSON.stringify(value));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }
    return this.request(`/products?${params.toString()}`);
  }

  async createProduct(data: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: any) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, { method: 'DELETE' });
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
    return this.request(`/alerts?${params.toString()}`);
  }

  async createAlert(data: any) {
    return this.request('/alerts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAlert(id: string, data: any) {
    return this.request(`/alerts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAlert(id: string) {
    return this.request(`/alerts/${id}`, { method: 'DELETE' });
  }

  async getAlertHistory(alertId: string) {
    return this.request(`/alerts/${alertId}/history`);
  }

  // User Preferences API
  async getUserPreferences() {
    return this.request('/user/preferences');
  }

  async updateUserPreferences(data: any) {
    return this.request('/user/preferences', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // A/B Testing API
  async recordABTestEvent(event: any) {
    return this.request('/ab-test/event', {
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
    return this.request(`/analytics/ab-test?${params.toString()}`);
  }

  // Search API
  async getSearchSuggestions(query: string) {
    return this.request(`/search/suggestions?query=${encodeURIComponent(query)}`);
  }

  async getVendors() {
    return this.request('/search/vendors');
  }

  async getSearchStats() {
    return this.request('/search/stats');
  }
}

export const apiService = new ApiService(); 