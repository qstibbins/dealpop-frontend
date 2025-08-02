// Chrome API types
declare global {
  interface Window {
    chrome: {
      storage: {
        sync: {
          get: (keys: string[], callback: (result: any) => void) => void;
          set: (items: any, callback?: () => void) => void;
        };
        onChanged: {
          addListener: (callback: (changes: any, namespace: string) => void) => void;
        };
      };
    };
  }
}

export interface ExtractedProduct {
  id: string;
  product_name: string;
  price: string;
  color?: string;
  brand: string;
  capacity?: string;
  vendor?: string;
  url: string;
  imageUrl?: string; // Add image URL field
  extractedAt: string;
  targetPrice?: string;
  expiresIn?: string;
  status: 'tracking' | 'paused' | 'completed';
  hasAlert?: boolean;
}

export class ChromeStorageService {
  /**
   * Check if Chrome extension API is available
   */
  private static isChromeExtension(): boolean {
    return typeof window !== 'undefined' && !!window.chrome && !!window.chrome.storage;
  }

  /**
   * Get all extracted products from Chrome storage
   */
  static async getProducts(): Promise<ExtractedProduct[]> {
    if (!this.isChromeExtension()) {
      console.warn('Chrome extension API not available, returning empty array');
      return [];
    }

    return new Promise((resolve) => {
      window.chrome.storage.sync.get(['extractedProducts'], (result: { extractedProducts?: ExtractedProduct[] }) => {
        const products = result.extractedProducts || [];
        resolve(products);
      });
    });
  }

  /**
   * Save a new extracted product
   */
  static async saveProduct(product: Omit<ExtractedProduct, 'id' | 'extractedAt'>): Promise<void> {
    if (!this.isChromeExtension()) {
      console.warn('Chrome extension API not available');
      return;
    }

    return new Promise((resolve) => {
      const newProduct: ExtractedProduct = {
        ...product,
        id: Date.now().toString(),
        extractedAt: new Date().toISOString(),
      };

      window.chrome.storage.sync.get(['extractedProducts'], (result: { extractedProducts?: ExtractedProduct[] }) => {
        const products = result.extractedProducts || [];
        products.unshift(newProduct); // Add to beginning
        
        window.chrome.storage.sync.set({ extractedProducts: products }, () => {
          resolve();
        });
      });
    });
  }

  /**
   * Update an existing product
   */
  static async updateProduct(id: string, updates: Partial<ExtractedProduct>): Promise<void> {
    if (!this.isChromeExtension()) {
      console.warn('Chrome extension API not available');
      return;
    }

    return new Promise((resolve) => {
      window.chrome.storage.sync.get(['extractedProducts'], (result: { extractedProducts?: ExtractedProduct[] }) => {
        const products = result.extractedProducts || [];
        const index = products.findIndex((p: ExtractedProduct) => p.id === id);
        
        if (index !== -1) {
          products[index] = { ...products[index], ...updates };
          window.chrome.storage.sync.set({ extractedProducts: products }, () => {
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Delete a product
   */
  static async deleteProduct(id: string): Promise<void> {
    if (!this.isChromeExtension()) {
      console.warn('Chrome extension API not available');
      return;
    }

    return new Promise((resolve) => {
      window.chrome.storage.sync.get(['extractedProducts'], (result: { extractedProducts?: ExtractedProduct[] }) => {
        const products = result.extractedProducts || [];
        const filteredProducts = products.filter((p: ExtractedProduct) => p.id !== id);
        
        window.chrome.storage.sync.set({ extractedProducts: filteredProducts }, () => {
          resolve();
        });
      });
    });
  }

  /**
   * Listen for changes in storage (when extension adds new products)
   */
  static onStorageChange(callback: (products: ExtractedProduct[]) => void): void {
    if (!this.isChromeExtension()) {
      console.warn('Chrome extension API not available');
      return;
    }

    window.chrome.storage.onChanged.addListener((changes: any, namespace: string) => {
      if (namespace === 'sync' && changes.extractedProducts) {
        const products = changes.extractedProducts.newValue || [];
        callback(products);
      }
    });
  }

  /**
   * Get product statistics
   */
  static async getStats(): Promise<{
    totalProducts: number;
    trackingProducts: number;
    completedProducts: number;
    totalSavings: number;
  }> {
    const products = await this.getProducts();
    
    const trackingProducts = products.filter(p => p.status === 'tracking');
    const completedProducts = products.filter(p => p.status === 'completed');
    
    const totalSavings = products.reduce((sum, product) => {
      if (product.targetPrice && product.price) {
        const currentPrice = parseFloat(product.price.replace(/[^0-9.]/g, ''));
        const targetPrice = parseFloat(product.targetPrice.replace(/[^0-9.]/g, ''));
        if (currentPrice > targetPrice) {
          return sum + (currentPrice - targetPrice);
        }
      }
      return sum;
    }, 0);

    return {
      totalProducts: products.length,
      trackingProducts: trackingProducts.length,
      completedProducts: completedProducts.length,
      totalSavings: Math.round(totalSavings * 100) / 100,
    };
  }
} 