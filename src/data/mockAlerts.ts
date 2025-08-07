import { Alert, AlertHistory, AlertPreferences } from '../types/alerts';

export const mockAlerts: Alert[] = [
  {
    id: '1',
    userId: 'demo-user-1',
    productId: '1',
    productName: 'MacBook Pro 14-inch M3 Pro',
    productUrl: 'https://www.apple.com/macbook-pro-14-and-16/',
    productImage: '/img/laptop.png',
    currentPrice: 1999.00,
    targetPrice: 1799.00,
    alertType: 'price_drop',
    status: 'active',
    notificationPreferences: {
      email: true,
      push: true,
      sms: false,
    },
    thresholds: {
      priceDropPercentage: 10,
      absolutePriceDrop: 200,
    },
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastCheckedAt: '2024-01-20T09:00:00Z',
  },
  {
    id: '2',
    userId: 'demo-user-1',
    productId: '3',
    productName: 'DJI Mini 3 Pro Drone',
    productUrl: 'https://www.bestbuy.com/site/dji-mini-3-pro-drone-with-dji-rc-gray/6501944.p',
    productImage: '/img/mixer.png',
    currentPrice: 759.00,
    targetPrice: 699.00,
    alertType: 'price_drop',
    status: 'active',
    notificationPreferences: {
      email: true,
      push: false,
      sms: true,
    },
    thresholds: {
      priceDropPercentage: 8,
      absolutePriceDrop: 60,
    },
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T09:15:00Z',
    lastCheckedAt: '2024-01-20T09:00:00Z',
  },
  {
    id: '3',
    userId: 'demo-user-1',
    productId: '5',
    productName: 'La Roche-Posay Effaclar Duo+',
    productUrl: 'https://www.sephora.com/product/effaclar-duo-acne-treatment-P378121',
    productImage: '/img/skincare.png',
    currentPrice: 39.99,
    targetPrice: 29.99,
    alertType: 'price_drop',
    status: 'active',
    notificationPreferences: {
      email: false,
      push: true,
      sms: false,
    },
    thresholds: {
      priceDropPercentage: 25,
      absolutePriceDrop: 10,
    },
    createdAt: '2024-01-11T11:30:00Z',
    updatedAt: '2024-01-11T11:30:00Z',
    lastCheckedAt: '2024-01-20T09:00:00Z',
  },
  {
    id: '4',
    userId: 'demo-user-1',
    productId: '7',
    productName: 'Apple Watch Series 9',
    productUrl: 'https://www.apple.com/apple-watch-series-9/',
    productImage: '/img/watch.png',
    currentPrice: 399.00,
    targetPrice: 349.00,
    alertType: 'price_drop',
    status: 'active',
    notificationPreferences: {
      email: true,
      push: true,
      sms: false,
    },
    thresholds: {
      priceDropPercentage: 12.5,
      absolutePriceDrop: 50,
    },
    createdAt: '2024-01-09T08:45:00Z',
    updatedAt: '2024-01-09T08:45:00Z',
    lastCheckedAt: '2024-01-20T09:00:00Z',
  },
  {
    id: '5',
    userId: 'demo-user-1',
    productId: '10',
    productName: 'Instant Pot Duo 7-in-1',
    productUrl: 'https://www.amazon.com/Instant-Pot-Duo-Evo-Plus/dp/B075CWJ3T8',
    productImage: '/img/mixer.png',
    currentPrice: 89.99,
    targetPrice: 79.99,
    alertType: 'price_drop',
    status: 'active',
    notificationPreferences: {
      email: true,
      push: false,
      sms: true,
    },
    thresholds: {
      priceDropPercentage: 11,
      absolutePriceDrop: 10,
    },
    createdAt: '2024-01-06T10:15:00Z',
    updatedAt: '2024-01-06T10:15:00Z',
    lastCheckedAt: '2024-01-20T09:00:00Z',
  },
  {
    id: '6',
    userId: 'demo-user-1',
    productId: '12',
    productName: 'Dyson V15 Detect Absolute',
    productUrl: 'https://www.dyson.com/vacuum-cleaners/cord-free/v15-detect-absolute-extra',
    productImage: '/img/skincare.png',
    currentPrice: 699.99,
    targetPrice: 599.99,
    alertType: 'price_drop',
    status: 'active',
    notificationPreferences: {
      email: true,
      push: true,
      sms: false,
    },
    thresholds: {
      priceDropPercentage: 14,
      absolutePriceDrop: 100,
    },
    createdAt: '2024-01-04T09:20:00Z',
    updatedAt: '2024-01-04T09:20:00Z',
    lastCheckedAt: '2024-01-20T09:00:00Z',
  },
  {
    id: '7',
    userId: 'demo-user-1',
    productId: '4',
    productName: 'Anker PowerCore 26800 Power Bank',
    productUrl: 'https://www.anker.com/products/a1275',
    productImage: '/img/powerbank.png',
    currentPrice: 49.99,
    targetPrice: 49.99,
    alertType: 'price_drop',
    status: 'triggered',
    notificationPreferences: {
      email: true,
      push: true,
      sms: false,
    },
    thresholds: {
      priceDropPercentage: 17,
      absolutePriceDrop: 10,
    },
    createdAt: '2024-01-12T16:45:00Z',
    updatedAt: '2024-01-18T14:30:00Z',
    triggeredAt: '2024-01-18T14:30:00Z',
    lastCheckedAt: '2024-01-20T09:00:00Z',
  },
  {
    id: '8',
    userId: 'demo-user-1',
    productId: '9',
    productName: 'Nike Air Max 270',
    productUrl: 'https://www.nike.com/t/air-max-270-shoes-KkLcGR',
    productImage: '/img/headphones.png',
    currentPrice: 120.00,
    targetPrice: 120.00,
    alertType: 'price_drop',
    status: 'triggered',
    notificationPreferences: {
      email: true,
      push: false,
      sms: true,
    },
    thresholds: {
      priceDropPercentage: 20,
      absolutePriceDrop: 30,
    },
    createdAt: '2024-01-07T12:30:00Z',
    updatedAt: '2024-01-16T11:15:00Z',
    triggeredAt: '2024-01-16T11:15:00Z',
    lastCheckedAt: '2024-01-20T09:00:00Z',
  }
];

export const mockAlertHistory: AlertHistory[] = [
  {
    id: '1',
    alertId: '7',
    eventType: 'created',
    timestamp: '2024-01-12T16:45:00Z',
    message: 'Price alert created for Anker PowerCore 26800 Power Bank',
  },
  {
    id: '2',
    alertId: '7',
    eventType: 'triggered',
    oldPrice: 59.99,
    newPrice: 49.99,
    priceChange: -10,
    priceChangePercentage: -16.7,
    timestamp: '2024-01-18T14:30:00Z',
    message: 'Price dropped to $49.99 (16.7% decrease) - Target reached!',
  },
  {
    id: '3',
    alertId: '8',
    eventType: 'created',
    timestamp: '2024-01-07T12:30:00Z',
    message: 'Price alert created for Nike Air Max 270',
  },
  {
    id: '4',
    alertId: '8',
    eventType: 'triggered',
    oldPrice: 150.00,
    newPrice: 120.00,
    priceChange: -30,
    priceChangePercentage: -20,
    timestamp: '2024-01-16T11:15:00Z',
    message: 'Price dropped to $120.00 (20% decrease) - Target reached!',
  },
  {
    id: '5',
    alertId: '1',
    eventType: 'created',
    timestamp: '2024-01-15T10:30:00Z',
    message: 'Price alert created for MacBook Pro 14-inch M3 Pro',
  },
  {
    id: '6',
    alertId: '3',
    eventType: 'created',
    timestamp: '2024-01-11T11:30:00Z',
    message: 'Price alert created for La Roche-Posay Effaclar Duo+',
  },
  {
    id: '7',
    alertId: '4',
    eventType: 'created',
    timestamp: '2024-01-09T08:45:00Z',
    message: 'Price alert created for Apple Watch Series 9',
  },
  {
    id: '8',
    alertId: '5',
    eventType: 'created',
    timestamp: '2024-01-06T10:15:00Z',
    message: 'Price alert created for Instant Pot Duo 7-in-1',
  },
  {
    id: '9',
    alertId: '6',
    eventType: 'created',
    timestamp: '2024-01-04T09:20:00Z',
    message: 'Price alert created for Dyson V15 Detect Absolute',
  },
  {
    id: '10',
    alertId: '2',
    eventType: 'created',
    timestamp: '2024-01-13T09:15:00Z',
    message: 'Price alert created for DJI Mini 3 Pro Drone',
  }
];

export const mockAlertPreferences: AlertPreferences = {
  userId: 'demo-user-1',
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

export const getMockAlerts = (): Alert[] => {
  return mockAlerts;
};

export const getMockAlertById = (id: string): Alert | undefined => {
  return mockAlerts.find(alert => alert.id === id);
};

export const getMockAlertHistory = (alertId: string): AlertHistory[] => {
  return mockAlertHistory.filter(history => history.alertId === alertId);
};

export const getMockAlertPreferences = (): AlertPreferences => {
  return mockAlertPreferences;
};
