import { apiService } from './api';
import { mockApiService } from './mockApiService';
import { shouldForceMockData } from '../config/staticMode';

class ApiAdapter {
  private useMockData: boolean = false;

  constructor() {
    // Check if we should use mock data
    this.checkApiAvailability();
  }

  private async checkApiAvailability(): Promise<void> {
    // Check if we should force mock data mode
    if (shouldForceMockData()) {
      this.useMockData = true;
      console.log('Static mode enabled, using mock data');
      return;
    }

    try {
      // Try to make a simple API call to check if backend is available
      const response = await fetch('http://localhost:3000/users/profile', { 
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test' // This will fail but tells us if backend is running
        },
        signal: AbortSignal.timeout(3000) // 3 second timeout
      });
      
      // If we get any response (even 401), backend is running
      if (response.status === 401 || response.ok) {
        this.useMockData = false;
        console.log('Backend API available, using real data');
      } else {
        this.useMockData = true;
        console.log('Backend API not available, using mock data');
      }
    } catch (error) {
      this.useMockData = true;
      console.log('Backend API not available, using mock data:', error);
    }
  }

  private getService() {
    return this.useMockData ? mockApiService : apiService;
  }

  // Products API
  async getProducts(filters?: any) {
    return this.getService().getProducts(filters);
  }

  async createProduct(data: any) {
    return this.getService().createProduct(data);
  }

  async updateProduct(id: string, data: any) {
    return this.getService().updateProduct(id, data);
  }

  async deleteProduct(id: string) {
    return this.getService().deleteProduct(id);
  }

  // Alerts API
  async getAlerts(filters?: any) {
    return this.getService().getAlerts(filters);
  }

  async createAlert(data: any) {
    return this.getService().createAlert(data);
  }

  async updateAlert(id: string, data: any) {
    return this.getService().updateAlert(id, data);
  }

  async deleteAlert(id: string) {
    return this.getService().deleteAlert(id);
  }

  async dismissAlert(id: string) {
    return this.getService().dismissAlert(id);
  }

  async getAlertHistory(alertId: string) {
    return this.getService().getAlertHistory(alertId);
  }

  // User Profile API
  async getUserProfile() {
    return this.getService().getUserProfile();
  }

  // User Preferences API
  async getUserPreferences() {
    return this.getService().getUserPreferences();
  }

  async getNotificationLogs(params?: { limit?: number }) {
    return this.getService().getNotificationLogs(params);
  }

  async getPriceHistory(id: string, params?: { limit?: number }) {
    return this.getService().getPriceHistory(id, params);
  }

  async updateUserPreferences(data: any) {
    return this.getService().updateUserPreferences(data);
  }

  // A/B Testing API
  async recordABTestEvent(event: any) {
    return this.getService().recordABTestEvent(event);
  }

  async getABTestAnalytics(filters?: any) {
    return this.getService().getABTestAnalytics(filters);
  }

  // Search API
  async getSearchSuggestions(query: string) {
    return this.getService().getSearchSuggestions(query);
  }

  async getVendors() {
    return this.getService().getVendors();
  }

  async getSearchStats() {
    return this.getService().getSearchStats();
  }

  // Stats and Analytics
  async getStats() {
    // Only available in mock service
    if (this.useMockData) {
      return (this.getService() as any).getStats();
    }
    // For real API, return basic stats
    return {
      totalProducts: 0,
      trackingProducts: 0,
      completedProducts: 0,
      activeAlerts: 0,
      triggeredAlerts: 0,
      totalSavings: 0,
    };
  }

  // Force mock data mode (for testing)
  forceMockMode(enabled: boolean) {
    this.useMockData = enabled;
    console.log(`Mock data mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Check if currently using mock data
  isUsingMockData(): boolean {
    return this.useMockData;
  }

  // Get real user info if available
  private getRealUser(): any {
    try {
      // Try to get real user from Firebase auth
      const { getAuth } = require('firebase/auth');
      const auth = getAuth();
      return auth.currentUser;
    } catch (error) {
      return null;
    }
  }
}

export const apiAdapter = new ApiAdapter();
