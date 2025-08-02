import { useState, useEffect, useMemo, useCallback } from 'react';
import { apiService } from '../services/api';
import { SearchService } from '../services/searchService';
import { ImageService } from '../services/imageService';
import SearchFiltersComponent from '../components/SearchFilters';
import SearchResults from '../components/SearchResults';
import CreateAlertModal from '../components/CreateAlertModal';
import AlertHistoryModal from '../components/AlertHistoryModal';
import { useSearch } from '../hooks/useSearch';
import { useAlerts } from '../contexts/AlertContext';
import AlertDebugInfo from '../components/AlertDebugInfo';

interface Product {
  id: string;
  imageUrl: string;
  title: string;
  price: string;
  vendor: string;
  targetPrice?: string;
  expiresIn?: string;
  status: 'tracking' | 'paused' | 'completed';
  url: string;
  extractedAt: string;
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { filters, debouncedFilters, updateFilters } = useSearch(SearchService.getDefaultFilters());
  const [stats, setStats] = useState({
    totalProducts: 0,
    trackingProducts: 0,
    completedProducts: 0,
    totalSavings: 0,
  });
  const [showCreateAlertModal, setShowCreateAlertModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'tracking' | 'paused' | 'completed' | 'deals'>('all');
  const [showAlertModal, setShowAlertModal] = useState(false);
  
  const { alerts, getAlertStats } = useAlerts();
  const alertStats = getAlertStats();
  
  // Helper function to check if product has an alert
  const productHasAlert = useCallback((productId: string) => {
    // Convert productId to number for comparison since API returns numbers
    const productIdNum = parseInt(productId, 10);
    
    const hasAlert = alerts.some(alert => {
      // Check if alert has a valid productId and matches the product
      const alertProductId = alert.productId ? parseInt(alert.productId.toString(), 10) : null;
      const matches = alertProductId === productIdNum && alert.status === 'active';
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 Alert ${alert.id}: productId=${alert.productId}, status=${alert.status}, matches=${matches}`);
      }
      
      return matches;
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Product ${productId} (${productIdNum}) has alert: ${hasAlert}`);
    }
    
    return hasAlert;
  }, [alerts]);

  // Helper function to get existing alert for a product
  const getExistingAlert = useCallback((productId: string) => {
    // Convert productId to number for comparison since API returns numbers
    const productIdNum = parseInt(productId, 10);
    
    const foundAlert = alerts.find(alert => {
      const alertProductId = alert.productId ? parseInt(alert.productId.toString(), 10) : null;
      return alertProductId === productIdNum && alert.status === 'active';
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 getExistingAlert for product ${productId}:`, foundAlert);
    }
    
    return foundAlert;
  }, [alerts]);

  // Dummy products fallback
  const dummyProducts: Product[] = [
    {
      id: '1',
      imageUrl: ImageService.getFallbackImage('Sample Laptop'),
      title: 'Sample Laptop',
      price: '999.99',
      vendor: 'TechStore',
      targetPrice: '899.99',
      expiresIn: '10 days',
      status: 'tracking',
      url: 'https://example.com/laptop',
      extractedAt: new Date().toISOString(),
    },
    {
      id: '2',
      imageUrl: ImageService.getFallbackImage('Wireless Headphones'),
      title: 'Wireless Headphones',
      price: '199.99',
      vendor: 'AudioShop',
      targetPrice: '149.99',
      expiresIn: '5 days',
      status: 'paused',
      url: 'https://example.com/headphones',
      extractedAt: new Date().toISOString(),
    },
    {
      id: '3',
      imageUrl: ImageService.getFallbackImage('Modern Sofa'),
      title: 'Modern Sofa',
      price: '499.99',
      vendor: 'HomeStore',
      targetPrice: '399.99',
      expiresIn: '20 days',
      status: 'completed',
      url: 'https://example.com/sofa',
      extractedAt: new Date().toISOString(),
    },
    {
      id: '4',
      imageUrl: ImageService.getFallbackImage('Gaming Monitor'),
      title: 'Gaming Monitor',
      price: '299.99',
      vendor: 'GameStore',
      targetPrice: '349.99',
      expiresIn: '15 days',
      status: 'tracking',
      url: 'https://example.com/monitor',
      extractedAt: new Date().toISOString(),
    },
  ];

  // Load products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await apiService.getProducts();
        const productsData = (response as any).products || response;
        
        // Convert API response to Product format
        let convertedProducts: Product[] = [];
        if (Array.isArray(productsData)) {
          convertedProducts = productsData.map(product => {
            // Debug vendor and price information
            if (process.env.NODE_ENV === 'development') {
              console.log('🔍 Product data debugging:', {
                productId: product.id,
                productTitle: product.productName || product.title,
                originalCurrentPrice: product.currentPrice,
                originalPrice: product.price,
                vendor: product.vendor,
                store: product.store,
                retailer: product.retailer,
                seller: product.seller,
                allKeys: Object.keys(product)
              });
            }
            
            const finalPrice = product.currentPrice?.toString() || product.price;
            
            return {
              id: product.id,
              imageUrl: product.imageUrl || product.productImage || ImageService.getFallbackImage(product.productName || product.title),
              title: product.productName || product.title,
              price: finalPrice,
              vendor: product.vendor || product.store || product.retailer || product.seller || 'Unknown',
              targetPrice: product.targetPrice?.toString(),
              expiresIn: product.expiresIn,
              status: product.status || 'tracking',
              url: product.productUrl || product.url,
              extractedAt: product.extractedAt || product.createdAt,
            };
          });
        }
        
        // Fallback to dummy products if no data from API
        if (convertedProducts.length === 0) {
          console.log('No products from API, using dummy data');
          convertedProducts = dummyProducts;
        }
        
        setProducts(convertedProducts);
        
        // Calculate stats
        const totalProducts = convertedProducts.length;
        const trackingProducts = convertedProducts.filter(p => p.status === 'tracking').length;
        const completedProducts = convertedProducts.filter(p => p.status === 'completed').length;
        const totalSavings = convertedProducts.reduce((sum, p) => {
          if (p.targetPrice && p.price) {
            const currentPrice = parseFloat(p.price.replace(/[^0-9.]/g, ''));
            const targetPrice = parseFloat(p.targetPrice.replace(/[^0-9.]/g, ''));
            return sum + Math.max(0, currentPrice - targetPrice);
          }
          return sum;
        }, 0);
        
        setStats({ totalProducts, trackingProducts, completedProducts, totalSavings });
      } catch (error) {
        console.error('Failed to load products from API:', error);
        // Fallback to dummy products on error
        setProducts(dummyProducts);
        setStats({
          totalProducts: dummyProducts.length,
          trackingProducts: dummyProducts.filter(p => p.status === 'tracking').length,
          completedProducts: dummyProducts.filter(p => p.status === 'completed').length,
          totalSavings: 150,
        });
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Filter products based on status and deal status
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Apply status filter
    if (filter !== 'all' && filter !== 'deals') {
      filtered = filtered.filter(product => product.status === filter);
    }

    // Apply deals filter (products where current price <= target price)
    if (filter === 'deals') {
      filtered = filtered.filter(product => {
        try {
          if (!product.targetPrice || !product.price) return false;
          const currentPrice = parseFloat(product.price.replace(/[^0-9.]/g, ''));
          const targetPrice = parseFloat(product.targetPrice.replace(/[^0-9.]/g, ''));
          return !isNaN(currentPrice) && !isNaN(targetPrice) && currentPrice <= targetPrice;
        } catch (error) {
          console.error('Error parsing prices for deals filter in useMemo:', error);
          return false;
        }
      });
    }

    // Convert Product[] to ExtractedProduct[] for the search service
    const extractedProducts = filtered.map(product => {
      try {
        // Validate product has required fields
        if (!product || !product.id) {
          console.warn('Invalid product data:', product);
          return null;
        }
        
        const existingAlert = getExistingAlert(product.id);
        const hasAlert = productHasAlert(product.id);
        
        return {
          id: product.id,
          product_name: product.title || 'Unknown Product',
          price: product.price || '0',
          vendor: product.vendor || 'Unknown',
          targetPrice: existingAlert ? existingAlert.targetPrice?.toString() : product.targetPrice,
          expiresIn: product.expiresIn,
          status: product.status || 'tracking',
          url: product.url || '#',
          extractedAt: product.extractedAt || new Date().toISOString(),
          brand: '', // Add default values for missing fields
          color: '',
          capacity: '',
          hasAlert: hasAlert, // Add hasAlert property
        };
      } catch (error) {
        console.error('Error processing product:', product.id, error);
        // Return a safe fallback
        return {
          id: product.id,
          product_name: product.title || 'Unknown Product',
          price: product.price || '0',
          vendor: product.vendor || 'Unknown',
          targetPrice: product.targetPrice,
          expiresIn: product.expiresIn,
          status: product.status || 'tracking',
          url: product.url || '#',
          extractedAt: product.extractedAt || new Date().toISOString(),
          brand: '',
          color: '',
          capacity: '',
          hasAlert: false,
        };
      }
    });

    // Filter out null values and pass to search service
    const validProducts = extractedProducts.filter(product => product !== null) as any[];
    return SearchService.filterProducts(validProducts, debouncedFilters);
  }, [products, debouncedFilters, filter, alerts]); // Add alerts to dependencies

  // Check if smart sorting is active
  const isSmartSortingActive = debouncedFilters.sortBy === 'smart';

  const handleCreateAlert = (product: any) => {
    setSelectedProduct(product);
    setShowCreateAlertModal(true);
  };

  const handleViewProduct = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getFilterButtonClass = (filterValue: typeof filter) => {
    return `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      filter === filterValue
        ? 'bg-blue-600 text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`;
  };

  const getFilterCount = (filterType: typeof filter) => {
    switch (filterType) {
      case 'all':
        return stats.totalProducts;
      case 'tracking':
        return stats.trackingProducts;
      case 'paused':
        return products.filter(p => p.status === 'paused').length;
      case 'completed':
        return stats.completedProducts;
      case 'deals':
        return products.filter(product => {
          try {
            if (!product.targetPrice || !product.price) return false;
            const currentPrice = parseFloat(product.price.replace(/[^0-9.]/g, ''));
            const targetPrice = parseFloat(product.targetPrice.replace(/[^0-9.]/g, ''));
            return !isNaN(currentPrice) && !isNaN(targetPrice) && currentPrice <= targetPrice;
          } catch (error) {
            console.error('Error parsing prices for deals filter:', error);
            return false;
          }
        }).length;
      default:
        return 0;
    }
  };

  return (
    <main className="p-6 flex-1 bg-white">
      <div className="mb-6">
        {/* Header with Alert Icon and Savings */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Product Tracker</h1>
            <div className="text-sm text-green-600 font-medium">
              Total Saved: <span className="font-bold">${stats.totalSavings}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAlertModal(true)}
              className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
              title="View Alerts"
            >
              <span className="text-2xl">🔔</span>
              {alertStats.active > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {alertStats.active}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={getFilterButtonClass('all')}
          >
            All ({getFilterCount('all')})
          </button>
          <button
            onClick={() => setFilter('tracking')}
            className={getFilterButtonClass('tracking')}
          >
            Tracking ({getFilterCount('tracking')})
          </button>
          <button
            onClick={() => setFilter('paused')}
            className={getFilterButtonClass('paused')}
          >
            Paused ({getFilterCount('paused')})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={getFilterButtonClass('completed')}
          >
            Completed ({getFilterCount('completed')})
          </button>
          <button
            onClick={() => setFilter('deals')}
            className={getFilterButtonClass('deals')}
          >
            Deals ({getFilterCount('deals')})
          </button>
        </div>

        {/* Search and Filters */}
        <SearchFiltersComponent
          filters={filters}
          onFiltersChange={updateFilters}
          products={products.map(product => ({
            id: product.id,
            product_name: product.title,
            price: product.price,
            vendor: product.vendor,
            targetPrice: product.targetPrice,
            expiresIn: product.expiresIn,
            status: product.status,
            url: product.url,
            extractedAt: product.extractedAt,
            brand: '',
            color: '',
            capacity: '',
          }))}
          className="mb-6"
        />
      </div>

      {/* Search Results */}
      <SearchResults
        products={products.map(product => {
          try {
            const existingAlert = getExistingAlert(product.id);
            const finalTargetPrice = existingAlert ? existingAlert.targetPrice?.toString() : product.targetPrice;
            
            if (process.env.NODE_ENV === 'development' && product.id === '858') {
              console.log(`🎯 Product ${product.id} target price mapping:`, {
                productTargetPrice: product.targetPrice,
                alertTargetPrice: existingAlert?.targetPrice,
                finalTargetPrice: finalTargetPrice,
                hasAlert: productHasAlert(product.id)
              });
            }
            
            return {
              id: product.id,
              product_name: product.title,
              price: product.price,
              vendor: product.vendor,
              targetPrice: finalTargetPrice,
              expiresIn: product.expiresIn,
              status: product.status,
              url: product.url,
              extractedAt: product.extractedAt,
              brand: '',
              color: '',
              capacity: '',
              hasAlert: productHasAlert(product.id),
            };
          } catch (error) {
            console.error('Error processing product for SearchResults:', product.id, error);
            return {
              id: product.id,
              product_name: product.title || 'Unknown Product',
              price: product.price || '0',
              vendor: product.vendor || 'Unknown',
              targetPrice: product.targetPrice,
              expiresIn: product.expiresIn,
              status: product.status || 'tracking',
              url: product.url || '#',
              extractedAt: product.extractedAt || new Date().toISOString(),
              brand: '',
              color: '',
              capacity: '',
              hasAlert: false,
            };
          }
        })}
        filteredProducts={filteredProducts}
        loading={loading}
        onCreateAlert={handleCreateAlert}
        onViewProduct={handleViewProduct}
        isSmartSortingActive={isSmartSortingActive}
      />

      {/* Create Alert Modal */}
      <CreateAlertModal
        isOpen={showCreateAlertModal}
        onClose={() => {
          setShowCreateAlertModal(false);
          setSelectedProduct(null);
        }}
        productData={selectedProduct ? (() => {
          const parsedPrice = parseFloat(selectedProduct.price.replace(/[^0-9.]/g, ''));
          if (process.env.NODE_ENV === 'development') {
            console.log('🔍 Modal price debugging:', {
              originalPrice: selectedProduct.price,
              parsedPrice: parsedPrice,
              productTitle: selectedProduct.title,
              targetPrice: selectedProduct.targetPrice
            });
          }
          return {
            id: selectedProduct.id,
            name: selectedProduct.title,
            url: selectedProduct.url,
            image: selectedProduct.imageUrl,
            currentPrice: parsedPrice,
            targetPrice: selectedProduct.targetPrice,
          };
        })() : undefined}
        existingAlert={selectedProduct ? getExistingAlert(selectedProduct.id) : undefined}
      />

      {/* Alert Management Modal */}
      <AlertHistoryModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        alertId="all"
        alertName="All Alerts"
      />
      
      {/* Debug Info (Development Only) */}
      <AlertDebugInfo 
        products={products}
        alerts={alerts}
        isVisible={process.env.NODE_ENV === 'development'}
      />
    </main>
  );
}