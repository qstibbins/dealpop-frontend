import { Alert, AlertHistory, AlertPreferences, PriceCheckResult } from '../types/alerts';
import { MockAlertService } from './mockAlertService';

export class MockAlertServiceAdapter {
  // Create a new alert
  static async createAlert(alertData: Omit<Alert, 'id' | 'createdAt' | 'updatedAt' | 'lastCheckedAt'>): Promise<Alert> {
    const alert: Alert = {
      ...alertData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastCheckedAt: new Date().toISOString(),
    };

    const alerts = MockAlertService.getAlerts();
    alerts.unshift(alert);
    MockAlertService.saveAlerts(alerts);
    
    return alert;
  }

  // Get all alerts for current user
  static async getUserAlerts(): Promise<Alert[]> {
    return MockAlertService.getAlerts();
  }

  // Get active alerts
  static async getActiveAlerts(): Promise<Alert[]> {
    const alerts = MockAlertService.getAlerts();
    return alerts.filter(alert => alert.status === 'active');
  }

  // Update alert
  static async updateAlert(alertId: string, updates: Partial<Alert>): Promise<void> {
    const alerts = MockAlertService.getAlerts();
    const alertIndex = alerts.findIndex(alert => alert.id === alertId);
    
    if (alertIndex === -1) throw new Error('Alert not found');
    
    alerts[alertIndex] = {
      ...alerts[alertIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    MockAlertService.saveAlerts(alerts);
  }

  // Delete alert
  static async deleteAlert(alertId: string): Promise<void> {
    const alerts = MockAlertService.getAlerts();
    const filteredAlerts = alerts.filter(alert => alert.id !== alertId);
    MockAlertService.saveAlerts(filteredAlerts);
  }

  // Get alert history
  static async getAlertHistory(alertId: string): Promise<AlertHistory[]> {
    return MockAlertService.getAlertHistory(alertId);
  }

  // Add alert history entry
  static async addAlertHistory(historyEntry: Omit<AlertHistory, 'id'>): Promise<void> {
    const history: AlertHistory = {
      ...historyEntry,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    const allHistory = MockAlertService.getAlertHistory('all'); // Get all history
    allHistory.push(history);
    MockAlertService.saveAlertHistory(allHistory);
  }

  // Get user alert preferences
  static async getAlertPreferences(): Promise<AlertPreferences | null> {
    return MockAlertService.getAlertPreferences();
  }

  // Update alert preferences
  static async updateAlertPreferences(preferences: Partial<AlertPreferences>): Promise<void> {
    const currentPreferences = MockAlertService.getAlertPreferences();
    const updatedPreferences = {
      ...currentPreferences,
      ...preferences,
    };
    MockAlertService.saveAlertPreferences(updatedPreferences as AlertPreferences);
  }

  // Real-time listener for alerts (simulated with polling)
  static subscribeToAlerts(callback: (alerts: Alert[]) => void): () => void {
    // Simulate real-time updates with polling every 5 seconds
    const interval = setInterval(() => {
      const alerts = MockAlertService.getAlerts();
      callback(alerts);
    }, 5000);

    // Return unsubscribe function
    return () => clearInterval(interval);
  }

  // Check if price drop threshold is met
  static checkPriceDropThreshold(alert: Alert, currentPrice: number): boolean {
    const priceChange = alert.currentPrice - currentPrice;
    const priceChangePercentage = (priceChange / alert.currentPrice) * 100;

    return (
      priceChange >= alert.thresholds.absolutePriceDrop ||
      priceChangePercentage >= alert.thresholds.priceDropPercentage
    );
  }

  // Simulate price check
  static async checkProductPrice(productUrl: string): Promise<PriceCheckResult> {
    // This is a mock implementation
    const mockPrice = Math.random() * 1000 + 100;
    const mockPreviousPrice = mockPrice + (Math.random() * 50 - 25);
    
    return {
      productId: 'mock-product-id',
      currentPrice: mockPrice,
      previousPrice: mockPreviousPrice,
      priceChange: mockPrice - mockPreviousPrice,
      priceChangePercentage: ((mockPrice - mockPreviousPrice) / mockPreviousPrice) * 100,
      inStock: Math.random() > 0.1,
      lastChecked: new Date().toISOString(),
    };
  }
} 