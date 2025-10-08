import { getMockProducts } from '../data/mockProducts';
import { getMockAlerts, getMockAlertHistory } from '../data/mockAlerts';
import { getMockVendors, getMockSearchSuggestions, getMockUser } from '../data/mockUserData';

class MockApiService {
  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Products API
  async getProducts(filters?: any) {
    await this.delay(300);
    const products = getMockProducts();
    
    // Transform ExtractedProduct to expected API format
    const transformedProducts = products.map(product => ({
      id: product.id,
      productName: product.product_name, // Map product_name to productName
      title: product.product_name, // Also provide as title for compatibility
      currentPrice: product.originalPrice || parseFloat(product.price.replace(/[^0-9.]/g, '')),
      price: product.price,
      vendor: product.vendor,
      store: product.vendor, // Provide as store for compatibility
      retailer: product.vendor, // Provide as retailer for compatibility
      seller: product.vendor, // Provide as seller for compatibility
      targetPrice: product.targetPrice,
      expiresIn: product.expiresIn,
      status: product.status,
      productUrl: product.url,
      url: product.url,
      imageUrl: product.imageUrl,
      productImage: product.imageUrl,
      extractedAt: product.extractedAt,
      createdAt: product.extractedAt,
      brand: product.brand,
      color: product.color,
      capacity: product.capacity,
    }));
    
    // Apply basic filtering if provided
    if (filters) {
      let filtered = transformedProducts;
      
      if (filters.status && filters.status !== 'all') {
        filtered = filtered.filter(p => p.status === filters.status);
      }
      
      if (filters.vendor) {
        filtered = filtered.filter(p => 
          p.vendor?.toLowerCase().includes(filters.vendor.toLowerCase())
        );
      }
      
      if (filters.search) {
        filtered = filtered.filter(p => 
          p.productName.toLowerCase().includes(filters.search.toLowerCase()) ||
          p.brand?.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      return { products: filtered };
    }
    
    return { products: transformedProducts };
  }

  async createProduct(data: any) {
    await this.delay(400);
    console.log('Mock: Creating product', data);
    return { success: true, message: 'Product created successfully (mock)' };
  }

  async updateProduct(id: string, data: any) {
    await this.delay(400);
    console.log('Mock: Updating product', id, data);
    return { success: true, message: 'Product updated successfully (mock)' };
  }

  async deleteProduct(id: string) {
    await this.delay(300);
    console.log('Mock: Deleting product', id);
    return { success: true, message: 'Product deleted successfully (mock)' };
  }

  // Alerts API
  async getAlerts(filters?: any) {
    await this.delay(300);
    const alerts = getMockAlerts();
    
    if (filters) {
      let filtered = alerts;
      
      if (filters.status && filters.status !== 'all') {
        filtered = filtered.filter(a => a.status === filters.status);
      }
      
      if (filters.productId) {
        filtered = filtered.filter(a => a.productId === filters.productId);
      }
      
      return { alerts: filtered };
    }
    
    return { alerts };
  }

  async createAlert(data: any) {
    await this.delay(500);
    console.log('Mock: Creating alert', data);
    return { 
      success: true, 
      message: 'Alert created successfully (mock)',
      alertId: `mock-alert-${Date.now()}`
    };
  }

  async updateAlert(id: string, data: any) {
    await this.delay(400);
    console.log('Mock: Updating alert', id, data);
    return { success: true, message: 'Alert updated successfully (mock)' };
  }

  async deleteAlert(id: string) {
    await this.delay(300);
    console.log('Mock: Deleting alert', id);
    return { success: true, message: 'Alert deleted successfully (mock)' };
  }

  async getAlertHistory(alertId: string) {
    await this.delay(200);
    const history = getMockAlertHistory(alertId);
    return { history };
  }

  // User Preferences API
  async getUserPreferences(realUser?: any) {
    await this.delay(200);
    const user = getMockUser(realUser);
    return { preferences: user.preferences };
  }

  async updateUserPreferences(data: any) {
    await this.delay(400);
    console.log('Mock: Updating user preferences', data);
    return { success: true, message: 'Preferences updated successfully (mock)' };
  }

  // A/B Testing API
  async recordABTestEvent(event: any) {
    await this.delay(100);
    console.log('Mock: Recording A/B test event', event);
    return { success: true };
  }

  async getABTestAnalytics() {
    await this.delay(300);
    return {
      totalEvents: 1250,
      conversionRate: 0.15,
      variantA: {
        impressions: 600,
        conversions: 95,
        conversionRate: 0.158
      },
      variantB: {
        impressions: 650,
        conversions: 93,
        conversionRate: 0.143
      }
    };
  }

  // Search API
  async getSearchSuggestions(query: string) {
    await this.delay(200);
    const suggestions = getMockSearchSuggestions();
    const filtered = suggestions.filter(s => 
      s.toLowerCase().includes(query.toLowerCase())
    );
    return { suggestions: filtered.slice(0, 5) };
  }

  async getVendors() {
    await this.delay(200);
    return { vendors: getMockVendors() };
  }

  async getSearchStats() {
    await this.delay(300);
    return {
      totalSearches: 1250,
      popularSearches: [
        'MacBook Pro',
        'iPhone 15',
        'Sony Headphones',
        'DJI Drone',
        'Apple Watch'
      ],
      searchTrends: {
        electronics: 45,
        fashion: 25,
        home: 20,
        sports: 10
      }
    };
  }

  // Stats and Analytics
  async getStats() {
    await this.delay(200);
    const products = getMockProducts();
    const alerts = getMockAlerts();
    
    const totalProducts = products.length;
    const trackingProducts = products.filter(p => p.status === 'tracking').length;
    const completedProducts = products.filter(p => p.status === 'completed').length;
    const activeAlerts = alerts.filter(a => a.status === 'active').length;
    const triggeredAlerts = alerts.filter(a => a.status === 'triggered').length;
    
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
      totalProducts,
      trackingProducts,
      completedProducts,
      activeAlerts,
      triggeredAlerts,
      totalSavings: Math.round(totalSavings * 100) / 100,
    };
  }
}

export const mockApiService = new MockApiService();
