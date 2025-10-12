import { apiService } from './api';

class ApiAdapter {
  constructor() {
    console.log('API Adapter initialized - REAL API CALLS ONLY, NO FALLBACKS, NO MOCK DATA EVER');
  }

  private getService() {
    return apiService; // ONLY REAL API SERVICE, NO MOCK DATA EVER
  }

  // Products API - Call the real backend API
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

  async stopTracking(id: string) {
    return this.getService().stopTracking(id);
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

  // Price history removed for MVP - not needed for launch

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
    // ALWAYS use the service determined by useMockData - NO EXCEPTIONS
    return this.getService().getStats();
  }


}

export const apiAdapter = new ApiAdapter();
