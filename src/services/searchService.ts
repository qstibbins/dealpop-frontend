import { ExtractedProduct } from './chromeStorage';
import { apiService } from './api';

export interface SearchFilters {
  query: string;
  status: 'all' | 'tracking' | 'paused' | 'completed';
  vendor: string;
  priceRange: {
    min: number;
    max: number;
  };
  sortBy: 'name' | 'price' | 'vendor' | 'smart';
  sortOrder: 'asc' | 'desc';
}

export class SearchService {
  /**
   * Get products from API with optional filters
   */
  static async getProducts(filters?: SearchFilters) {
    return await apiService.getProducts(filters);
  }

  /**
   * Get vendors from API
   */
  static async getVendors() {
    return await apiService.getVendors();
  }

  /**
   * Get search suggestions from API
   */
  static async getSearchSuggestions(query: string) {
    return await apiService.getSearchSuggestions(query);
  }

  /**
   * Get search stats from API
   */
  static async getStats() {
    return await apiService.getSearchStats();
  }

  /**
   * Filter products based on search criteria (client-side filtering)
   */
  static filterProducts(products: ExtractedProduct[], filters: SearchFilters): ExtractedProduct[] {
    let filtered = [...products];

    // Text search across multiple fields
    if (filters.query.trim()) {
      const query = filters.query.toLowerCase().trim();
      filtered = filtered.filter(product => 
        product.product_name.toLowerCase().includes(query) ||
        product.vendor?.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query) ||
        product.color?.toLowerCase().includes(query) ||
        product.capacity?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(product => product.status === filters.status);
    }

    // Vendor filter
    if (filters.vendor) {
      filtered = filtered.filter(product => 
        product.vendor?.toLowerCase().includes(filters.vendor.toLowerCase())
      );
    }

    // Price range filter
    if (filters.priceRange.min > 0 || filters.priceRange.max < Infinity) {
      filtered = filtered.filter(product => {
        const price = parseFloat(product.price.replace(/[^0-9.]/g, ''));
        return price >= filters.priceRange.min && price <= filters.priceRange.max;
      });
    }

    // Sort products
    if (filters.sortBy === 'smart') {
      filtered = this.smartSortProducts(filtered);
    } else {
      filtered = this.sortProducts(filtered, filters.sortBy, filters.sortOrder);
    }

    return filtered;
  }

  /**
   * Smart sorting that prioritizes deals ready for purchase first, then by expiration date
   */
  private static smartSortProducts(products: ExtractedProduct[]): ExtractedProduct[] {
    return [...products].sort((a, b) => {
      // Helper function to check if a product is a deal (current price <= target price)
      const isDeal = (product: ExtractedProduct): boolean => {
        if (!product.targetPrice) return false;
        const currentPrice = parseFloat(product.price.replace(/[^0-9.]/g, ''));
        const targetPrice = parseFloat(product.targetPrice.replace(/[^0-9.]/g, ''));
        return currentPrice <= targetPrice;
      };

      // Helper function to extract days from expiresIn string
      const getExpirationDays = (expiresIn: string | undefined): number => {
        if (!expiresIn) return Infinity;
        const match = expiresIn.match(/(\d+)\s*days?/i);
        return match ? parseInt(match[1]) : Infinity;
      };

      const aIsDeal = isDeal(a);
      const bIsDeal = isDeal(b);

      // First priority: Deals come before non-deals
      if (aIsDeal && !bIsDeal) return -1;
      if (!aIsDeal && bIsDeal) return 1;

      // Second priority: Among deals, sort by expiration date (earliest first)
      if (aIsDeal && bIsDeal) {
        const aExpirationDays = getExpirationDays(a.expiresIn);
        const bExpirationDays = getExpirationDays(b.expiresIn);
        
        if (aExpirationDays !== bExpirationDays) {
          return aExpirationDays - bExpirationDays;
        }
      }

      // Third priority: Among non-deals, sort by expiration date (earliest first)
      if (!aIsDeal && !bIsDeal) {
        const aExpirationDays = getExpirationDays(a.expiresIn);
        const bExpirationDays = getExpirationDays(b.expiresIn);
        
        if (aExpirationDays !== bExpirationDays) {
          return aExpirationDays - bExpirationDays;
        }
      }

      // Fourth priority: If expiration dates are the same, sort by name
      return a.product_name.toLowerCase().localeCompare(b.product_name.toLowerCase());
    });
  }

  /**
   * Sort products by specified criteria
   */
  private static sortProducts(
    products: ExtractedProduct[], 
    sortBy: string, 
    sortOrder: 'asc' | 'desc'
  ): ExtractedProduct[] {
    return [...products].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.product_name.toLowerCase();
          bValue = b.product_name.toLowerCase();
          break;
        case 'price':
          aValue = parseFloat(a.price.replace(/[^0-9.]/g, ''));
          bValue = parseFloat(b.price.replace(/[^0-9.]/g, ''));
          break;

        case 'vendor':
          aValue = (a.vendor || '').toLowerCase();
          bValue = (b.vendor || '').toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }

  /**
   * Get unique vendors from products
   */
  static getUniqueVendors(products: ExtractedProduct[]): string[] {
    const vendors = products
      .map(product => product.vendor)
      .filter((vendor): vendor is string => !!vendor);
    
    return [...new Set(vendors)].sort();
  }

  /**
   * Get price range from products
   */
  static getPriceRange(products: ExtractedProduct[]): { min: number; max: number } {
    if (products.length === 0) {
      return { min: 0, max: 1000 };
    }

    const prices = products.map(product => 
      parseFloat(product.price.replace(/[^0-9.]/g, ''))
    ).filter(price => !isNaN(price));

    if (prices.length === 0) {
      return { min: 0, max: 1000 };
    }

    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices))
    };
  }

  /**
   * Get default search filters
   */
  static getDefaultFilters(): SearchFilters {
    return {
      query: '',
      status: 'all',
      vendor: '',
      priceRange: { min: 0, max: Infinity },
      sortBy: 'smart',
      sortOrder: 'desc'
    };
  }

  /**
   * Test function to verify smart sorting functionality
   * This can be used for debugging and testing
   */
  static testSmartSorting(products: ExtractedProduct[]): ExtractedProduct[] {
    return this.smartSortProducts(products);
  }
} 