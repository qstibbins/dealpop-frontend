// Chrome Storage types for extension integration
type ChromeStorage = {
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

export interface ExtractedProduct {
  id: string;
  product_name: string;
  price: string;
  vendor?: string;
  url: string;
  imageUrl?: string; // Add image URL field
  extractedAt: string;
  targetPrice?: string;
  previousPrice?: string;
  originalPrice?: string;
  expiresIn?: string;
  status: 'tracking' | 'paused' | 'completed';
  hasAlert?: boolean;
}

export class ChromeStorageService {
  /**
   * Check if Chrome extension API is available
   */
  private static isChromeExtension(): boolean {
    return typeof window !== 'undefined' && !!(window as any).chrome && !!(window as any).chrome.storage;
  }
  
  private static getChrome(): ChromeStorage | null {
    if (this.isChromeExtension()) {
      return (window as any).chrome;
    }
    return null;
  }

  /**
   * Get all extracted products from Chrome storage
   */
  static async getProducts(): Promise<ExtractedProduct[]> {
    const chrome = this.getChrome();
    if (!chrome) {
      console.warn('Chrome extension API not available, returning empty array');
      return [];
    }

    return new Promise((resolve) => {
      chrome.storage.sync.get(['extractedProducts'], (result: { extractedProducts?: ExtractedProduct[] }) => {
        const products = result.extractedProducts || [];
        resolve(products);
      });
    });
  }

  /**
   * Save a new extracted product
   */
  static async saveProduct(product: Omit<ExtractedProduct, 'id' | 'extractedAt'>): Promise<void> {
    const chrome = this.getChrome();
    if (!chrome) {
      console.warn('Chrome extension API not available');
      return;
    }

    return new Promise((resolve) => {
      const newProduct: ExtractedProduct = {
        ...product,
        id: Date.now().toString(),
        extractedAt: new Date().toISOString(),
      };

      chrome.storage.sync.get(['extractedProducts'], (result: { extractedProducts?: ExtractedProduct[] }) => {
        const products = result.extractedProducts || [];
        products.unshift(newProduct); // Add to beginning
        
        chrome.storage.sync.set({ extractedProducts: products }, () => {
          resolve();
        });
      });
    });
  }

  /**
   * Update an existing product
   */
  static async updateProduct(id: string, updates: Partial<ExtractedProduct>): Promise<void> {
    const chrome = this.getChrome();
    if (!chrome) {
      console.warn('Chrome extension API not available');
      return;
    }

    return new Promise((resolve) => {
      chrome.storage.sync.get(['extractedProducts'], (result: { extractedProducts?: ExtractedProduct[] }) => {
        const products = result.extractedProducts || [];
        const index = products.findIndex((p: ExtractedProduct) => p.id === id);
        
        if (index !== -1) {
          products[index] = { ...products[index], ...updates };
          chrome.storage.sync.set({ extractedProducts: products }, () => {
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
    const chrome = this.getChrome();
    if (!chrome) {
      console.warn('Chrome extension API not available');
      return;
    }

    return new Promise((resolve) => {
      chrome.storage.sync.get(['extractedProducts'], (result: { extractedProducts?: ExtractedProduct[] }) => {
        const products = result.extractedProducts || [];
        const filteredProducts = products.filter((p: ExtractedProduct) => p.id !== id);
        
        chrome.storage.sync.set({ extractedProducts: filteredProducts }, () => {
          resolve();
        });
      });
    });
  }

  /**
   * Listen for changes in storage (when extension adds new products)
   */
  static onStorageChange(callback: (products: ExtractedProduct[]) => void): void {
    const chrome = this.getChrome();
    if (!chrome) {
      console.warn('Chrome extension API not available');
      return;
    }

    chrome.storage.onChanged.addListener((changes: any, namespace: string) => {
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