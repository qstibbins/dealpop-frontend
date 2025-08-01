import { Alert, AlertHistory, AlertPreferences } from '../types/alerts';

// Mock data for testing the UI
const MOCK_ALERTS_KEY = 'mockAlerts';
const MOCK_ALERT_HISTORY_KEY = 'mockAlertHistory';
const MOCK_ALERT_PREFERENCES_KEY = 'mockAlertPreferences';

export class MockAlertService {
  // Generate fake alerts for testing
  static generateMockAlerts(): Alert[] {
    // Mock products array commented out to fix linting errors
    // const mockProducts = [
    //   {
    //     id: 'laptop-1',
    //     name: 'MacBook Pro 14" M3',
    //     url: 'https://amazon.com/macbook-pro',
    //     image: `${import.meta.env.BASE_URL}img/laptop.png`,
    //     currentPrice: 1499.99,
    //   },
    //   {
    //     id: 'headphones-1',
    //     name: 'Sony WH-1000XM5 Wireless Headphones',
    //     url: 'https://amazon.com/sony-headphones',
    //     image: `${import.meta.env.BASE_URL}img/headphones.png`,
    //     currentPrice: 349.99,
    //   },
    //   {
    //     id: 'sofa-1',
    //     name: 'Modern L-Shaped Sectional Sofa',
    //     url: 'https://amazon.com/sectional-sofa',
    //     image: `${import.meta.env.BASE_URL}img/sofa.png`,
    //     currentPrice: 899.99,
    //   },
    //   {
    //     id: 'watch-1',
    //     name: 'Apple Watch Series 9',
    //     url: 'https://amazon.com/apple-watch',
    //     image: `${import.meta.env.BASE_URL}img/watch.png`,
    //     currentPrice: 399.99,
    //   },
    //   {
    //     id: 'mixer-1',
    //     name: 'KitchenAid Stand Mixer Professional',
    //     url: 'https://amazon.com/kitchenaid-mixer',
    //     image: `${import.meta.env.BASE_URL}img/mixer.png`,
    //     currentPrice: 449.99,
    //   },
    // ];

    const mockAlerts: Alert[] = [
      {
        id: 'alert-1',
        userId: 'mock-user-id',
        productId: 'laptop-1',
        productName: 'MacBook Pro 14" M3',
        productUrl: 'https://amazon.com/macbook-pro',
        productImage: `${import.meta.env.BASE_URL}img/laptop.png`,
        currentPrice: 1499.99,
        targetPrice: 1299.99,
        alertType: 'price_drop',
        status: 'active',
        notificationPreferences: {
          email: true,
          push: true,
          sms: false,
        },
        thresholds: {
          priceDropPercentage: 15,
          absolutePriceDrop: 200,
        },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        updatedAt: new Date().toISOString(),
        lastCheckedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        expiresAt: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(), // 23 days from now
      },
      {
        id: 'alert-2',
        userId: 'mock-user-id',
        productId: 'headphones-1',
        productName: 'Sony WH-1000XM5 Wireless Headphones',
        productUrl: 'https://amazon.com/sony-headphones',
        productImage: `${import.meta.env.BASE_URL}img/headphones.png`,
        currentPrice: 349.99,
        targetPrice: 299.99,
        alertType: 'price_drop',
        status: 'triggered',
        notificationPreferences: {
          email: true,
          push: false,
          sms: true,
        },
        thresholds: {
          priceDropPercentage: 10,
          absolutePriceDrop: 50,
        },
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        triggeredAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        lastCheckedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        expiresAt: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000).toISOString(), // 27 days from now
      },
      {
        id: 'alert-3',
        userId: 'mock-user-id',
        productId: 'sofa-1',
        productName: 'Modern L-Shaped Sectional Sofa',
        productUrl: 'https://amazon.com/sectional-sofa',
        productImage: `${import.meta.env.BASE_URL}img/sofa.png`,
        currentPrice: 899.99,
        targetPrice: 799.99,
        alertType: 'price_drop',
        status: 'dismissed',
        notificationPreferences: {
          email: false,
          push: true,
          sms: false,
        },
        thresholds: {
          priceDropPercentage: 12,
          absolutePriceDrop: 100,
        },
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        lastCheckedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        expiresAt: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(), // 16 days from now
      },
      {
        id: 'alert-4',
        userId: 'mock-user-id',
        productId: 'watch-1',
        productName: 'Apple Watch Series 9',
        productUrl: 'https://amazon.com/apple-watch',
        productImage: `${import.meta.env.BASE_URL}img/watch.png`,
        currentPrice: 399.99,
        targetPrice: 349.99,
        alertType: 'price_drop',
        status: 'active',
        notificationPreferences: {
          email: true,
          push: true,
          sms: true,
        },
        thresholds: {
          priceDropPercentage: 8,
          absolutePriceDrop: 50,
        },
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        updatedAt: new Date().toISOString(),
        lastCheckedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        expiresAt: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString(), // 29 days from now
      },
      {
        id: 'alert-5',
        userId: 'mock-user-id',
        productId: 'mixer-1',
        productName: 'KitchenAid Stand Mixer Professional',
        productUrl: 'https://amazon.com/kitchenaid-mixer',
        productImage: `${import.meta.env.BASE_URL}img/mixer.png`,
        currentPrice: 449.99,
        targetPrice: 399.99,
        alertType: 'price_drop',
        status: 'expired',
        notificationPreferences: {
          email: true,
          push: false,
          sms: false,
        },
        thresholds: {
          priceDropPercentage: 11,
          absolutePriceDrop: 50,
        },
        createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 days ago
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        lastCheckedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago (expired)
      },
    ];

    return mockAlerts;
  }

  // Generate mock alert history
  static generateMockAlertHistory(): AlertHistory[] {
    return [
      {
        id: 'history-1',
        alertId: 'alert-2',
        eventType: 'created',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        message: 'Price alert created for Sony WH-1000XM5 Wireless Headphones',
      },
      {
        id: 'history-2',
        alertId: 'alert-2',
        eventType: 'updated',
        oldPrice: 349.99,
        newPrice: 349.99,
        priceChange: 0,
        priceChangePercentage: 0,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        message: 'Price checked - no change detected',
      },
      {
        id: 'history-3',
        alertId: 'alert-2',
        eventType: 'triggered',
        oldPrice: 349.99,
        newPrice: 299.99,
        priceChange: -50,
        priceChangePercentage: -14.29,
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        message: 'Price dropped by $50 (14.29%) - Alert triggered!',
      },
      {
        id: 'history-4',
        alertId: 'alert-3',
        eventType: 'created',
        timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        message: 'Price alert created for Modern L-Shaped Sectional Sofa',
      },
      {
        id: 'history-5',
        alertId: 'alert-3',
        eventType: 'dismissed',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        message: 'Alert dismissed by user',
      },
    ];
  }

  // Generate mock alert preferences
  static generateMockAlertPreferences(): AlertPreferences {
    return {
      userId: 'mock-user-id',
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      defaultPriceDropPercentage: 10,
      defaultAbsolutePriceDrop: 50,
      checkFrequency: 'daily',
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00',
      },
      timezone: 'America/New_York',
    };
  }

  // Initialize mock data in localStorage
  static initializeMockData(): void {
    if (!localStorage.getItem(MOCK_ALERTS_KEY)) {
      localStorage.setItem(MOCK_ALERTS_KEY, JSON.stringify(this.generateMockAlerts()));
    }
    if (!localStorage.getItem(MOCK_ALERT_HISTORY_KEY)) {
      localStorage.setItem(MOCK_ALERT_HISTORY_KEY, JSON.stringify(this.generateMockAlertHistory()));
    }
    if (!localStorage.getItem(MOCK_ALERT_PREFERENCES_KEY)) {
      localStorage.setItem(MOCK_ALERT_PREFERENCES_KEY, JSON.stringify(this.generateMockAlertPreferences()));
    }
  }

  // Get alerts from localStorage
  static getAlerts(): Alert[] {
    const alertsData = localStorage.getItem(MOCK_ALERTS_KEY);
    return alertsData ? JSON.parse(alertsData) : [];
  }

  // Get alert history from localStorage
  static getAlertHistory(alertId: string): AlertHistory[] {
    const historyData = localStorage.getItem(MOCK_ALERT_HISTORY_KEY);
    const allHistory = historyData ? JSON.parse(historyData) : [];
    return allHistory.filter((entry: AlertHistory) => entry.alertId === alertId);
  }

  // Get alert preferences from localStorage
  static getAlertPreferences(): AlertPreferences | null {
    const preferencesData = localStorage.getItem(MOCK_ALERT_PREFERENCES_KEY);
    return preferencesData ? JSON.parse(preferencesData) : null;
  }

  // Save alerts to localStorage
  static saveAlerts(alerts: Alert[]): void {
    localStorage.setItem(MOCK_ALERTS_KEY, JSON.stringify(alerts));
  }

  // Save alert history to localStorage
  static saveAlertHistory(history: AlertHistory[]): void {
    localStorage.setItem(MOCK_ALERT_HISTORY_KEY, JSON.stringify(history));
  }

  // Save alert preferences to localStorage
  static saveAlertPreferences(preferences: AlertPreferences): void {
    localStorage.setItem(MOCK_ALERT_PREFERENCES_KEY, JSON.stringify(preferences));
  }

  // Clear all mock data
  static clearMockData(): void {
    localStorage.removeItem(MOCK_ALERTS_KEY);
    localStorage.removeItem(MOCK_ALERT_HISTORY_KEY);
    localStorage.removeItem(MOCK_ALERT_PREFERENCES_KEY);
  }
} 