import { ExtractedProduct } from '../services/chromeStorage';

// Only 3 hardcoded products as requested
export const mockProducts: ExtractedProduct[] = [
  {
    id: '1',
    product_name: 'MacBook Pro 14-inch M3 Pro',
    price: '1,999.00',
    originalPrice: 1999.00,
    color: 'Space Gray',
    brand: 'Apple',
    capacity: '512GB SSD',
    vendor: 'Apple Store',
    url: 'https://www.apple.com/macbook-pro-14-and-16/',
    imageUrl: '/img/laptop.png',
    extractedAt: '2024-01-15T10:30:00Z',
    targetPrice: '1,799.00',
    expiresIn: '30 days',
    status: 'tracking',
    hasAlert: true,
  },
  {
    id: '2',
    product_name: 'Sony WH-1000XM5 Wireless Headphones',
    price: '349.99',
    originalPrice: 349.99,
    color: 'Black',
    brand: 'Sony',
    capacity: '',
    vendor: 'Amazon',
    url: 'https://www.amazon.com/Sony-WH-1000XM5-Canceling-Headphones-phone-call/dp/B09Y2MYL5C',
    imageUrl: '/img/headphones.png',
    extractedAt: '2024-01-14T14:20:00Z',
    targetPrice: '299.99',
    expiresIn: '15 days',
    status: 'tracking',
    hasAlert: false,
  },
  {
    id: '3',
    product_name: 'DJI Mini 3 Pro Drone',
    price: '759.00',
    originalPrice: 759.00,
    color: 'Gray',
    brand: 'DJI',
    capacity: '',
    vendor: 'Best Buy',
    url: 'https://www.bestbuy.com/site/dji-mini-3-pro-drone-with-dji-rc-gray/6501944.p',
    imageUrl: '/img/mixer.png',
    extractedAt: '2024-01-13T09:15:00Z',
    targetPrice: '699.00',
    expiresIn: '45 days',
    status: 'paused',
    hasAlert: true,
  }
];

export const getMockProducts = (): ExtractedProduct[] => {
  return mockProducts;
};

export const getMockProductById = (id: string): ExtractedProduct | undefined => {
  return mockProducts.find(product => product.id === id);
};
