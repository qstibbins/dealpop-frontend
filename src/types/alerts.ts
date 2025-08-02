export interface Alert {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  productUrl: string;
  productImage: string;
  currentPrice: number;
  targetPrice: number;
  alertType: 'price_drop' | 'price_increase' | 'stock_alert' | 'expiry_alert';
  status: 'active' | 'triggered' | 'dismissed' | 'expired';
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  thresholds: {
    priceDropPercentage: number;
    absolutePriceDrop: number;
  };
  createdAt: string;
  updatedAt: string;
  triggeredAt?: string;
  lastCheckedAt: string;
  expiresAt?: string;
}

export interface AlertHistory {
  id: string;
  alertId: string;
  eventType: 'created' | 'triggered' | 'dismissed' | 'updated' | 'expired';
  oldPrice?: number;
  newPrice?: number;
  priceChange?: number;
  priceChangePercentage?: number;
  timestamp: string;
  message: string;
}

export interface AlertPreferences {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  defaultPriceDropPercentage: number;
  defaultAbsolutePriceDrop: number;
  checkFrequency: 'hourly' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
  };
  timezone: string;
}

export interface PriceCheckResult {
  productId: string;
  currentPrice: number;
  previousPrice: number;
  priceChange: number;
  priceChangePercentage: number;
  inStock: boolean;
  lastChecked: string;
} 