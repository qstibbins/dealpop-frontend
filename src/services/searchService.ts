import { ExtractedProduct } from './chromeStorage';

export interface SearchFilters {
  query: string;
  status: 'all' | 'tracking' | 'paused' | 'completed';
  vendor: string;
  priceRange: {
    min: number;
    max: number;
  };
  sortBy: 'name' | 'price' | 'vendor';
  sortOrder: 'asc' | 'desc';
}

export class SearchService {
  /**
   * Filter products based on search criteria
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
    filtered = this.sortProducts(filtered, filters.sortBy, filters.sortOrder);

    return filtered;
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
      sortBy: 'name',
      sortOrder: 'desc'
    };
  }
} 