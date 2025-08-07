export interface MockUser {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    currency: string;
    timezone: string;
    language: string;
  };
  stats: {
    totalProducts: number;
    trackingProducts: number;
    completedProducts: number;
    totalSavings: number;
    alertsCreated: number;
    alertsTriggered: number;
  };
}

// Create a more realistic mock user based on real user info
export const createMockUser = (realUser?: any): MockUser => {
  const displayName = realUser?.displayName || 'Demo User';
  const email = realUser?.email || 'demo@dealpop.com';
  const photoURL = realUser?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D9488&color=fff`;
  
  return {
    id: realUser?.uid || 'demo-user-1',
    email,
    displayName,
    photoURL,
    preferences: {
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      currency: 'USD',
      timezone: 'America/New_York',
      language: 'en',
    },
    stats: {
      totalProducts: 12,
      trackingProducts: 8,
      completedProducts: 2,
      totalSavings: 920.00, // Updated to match the UI
      alertsCreated: 8,
      alertsTriggered: 2,
    },
  };
};

export const mockUser: MockUser = createMockUser();

export const mockVendors = [
  'Amazon',
  'Apple Store',
  'Best Buy',
  'Walmart',
  'Target',
  'IKEA',
  'Sephora',
  'Nike Store',
  'Dyson Store',
  'Anker Store',
  'B&H Photo',
  'Newegg',
  'Micro Center',
  'Costco',
  'Sam\'s Club',
  'Home Depot',
  'Lowe\'s',
  'Wayfair',
  'Overstock',
  'eBay',
];

export const mockCategories = [
  'Electronics',
  'Computers & Accessories',
  'Smartphones & Accessories',
  'Home & Garden',
  'Fashion & Apparel',
  'Beauty & Personal Care',
  'Sports & Outdoors',
  'Automotive',
  'Toys & Games',
  'Books & Media',
  'Health & Wellness',
  'Kitchen & Dining',
  'Office Products',
  'Pet Supplies',
  'Baby & Kids',
];

export const mockSearchSuggestions = [
  'MacBook Pro',
  'iPhone 15',
  'Sony Headphones',
  'DJI Drone',
  'Apple Watch',
  'Samsung TV',
  'Nike Shoes',
  'Instant Pot',
  'Dyson Vacuum',
  'Canon Camera',
  'Anker Power Bank',
  'La Roche-Posay',
  'IKEA Sofa',
  'Gaming Monitor',
  'Wireless Earbuds',
];

export const getMockUser = (realUser?: any): MockUser => {
  return createMockUser(realUser);
};

export const getMockVendors = (): string[] => {
  return mockVendors;
};

export const getMockCategories = (): string[] => {
  return mockCategories;
};

export const getMockSearchSuggestions = (): string[] => {
  return mockSearchSuggestions;
};
