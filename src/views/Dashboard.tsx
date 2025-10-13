import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiAdapter } from '../services/apiAdapter';
import { SearchService } from '../services/searchService';
import SearchFiltersComponent from '../components/SearchFilters';
import SearchResults from '../components/SearchResults';
import CreateAlertModal from '../components/CreateAlertModal';
import AlertsListModal from '../components/AlertsListModal';
import { useSearch } from '../hooks/useSearch';
import { useAlerts } from '../contexts/AlertContext';
import { useAuth } from '../contexts/AuthContext';
import AlertDebugInfo from '../components/AlertDebugInfo';
import { formatPrice } from '../utils/priceFormatting';

interface Product {
  id: string;
  imageUrl: string;
  title: string;
  price: string;
  originalPrice?: number; // Keep original numeric price for API calls
  vendor: string;
  targetPrice?: string;
  expiresIn?: string;
  status: 'tracking' | 'paused' | 'completed';
  url: string;
  extractedAt: string;
}

// Helper function to calculate days remaining from expiration date
const calculateDaysRemaining = (expiresAt: string): string => {
  try {
    const expirationDate = new Date(expiresAt);
    const currentDate = new Date();
    const timeDiff = expirationDate.getTime() - currentDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff < 0) {
      return 'Expired';
    } else if (daysDiff === 0) {
      return 'Expires today';
    } else if (daysDiff === 1) {
      return '1 day';
    } else {
      return `${daysDiff} days`;
    }
  } catch (error) {
    console.error('Error calculating days remaining:', error);
    return 'Unknown';
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const [error, setError] = useState<string | null>(null);
  
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
      
      if (import.meta.env.DEV) {
        console.log(`🔍 Alert ${alert.id}: productId=${alert.productId}, status=${alert.status}, matches=${matches}`);
      }
      
      return matches;
    });
    
    if (import.meta.env.DEV) {
      console.log(`🔍 Product ${productId} (${productIdNum}) has alert: ${hasAlert}`);
    }
    
    return hasAlert;
  }, [alerts]);


  // Check authentication and redirect if needed
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  // Load products from API
  const loadProducts = useCallback(async () => {
    if (!user) return; // Don't load products if not authenticated
    
    try {
      setLoading(true);
      const response = await apiAdapter.getProducts();
      console.log('🔍 RAW API RESPONSE:', response);
      
      // Backend returns array directly, not wrapped in {products: [...]}
      const productsData = response;
      console.log('🔍 PRODUCTS DATA:', productsData);
      console.log('🔍 IS ARRAY:', Array.isArray(productsData));
      console.log('🔍 LENGTH:', Array.isArray(productsData) ? productsData.length : 0);
      
      // Convert API response to Product format
      let convertedProducts: Product[] = [];
      if (Array.isArray(productsData)) {
        convertedProducts = productsData.map(product => {
          console.log('🔍 MAPPING PRODUCT:', product);
          console.log('🔍 PRODUCT FIELDS:', Object.keys(product));
          console.log('🔍 IMAGE URL FIELDS:', {
            product_image_url: product.product_image_url,
          });
          console.log('🔍 AMAZON ECHO DOT DATA:', product.id, product.title, 'target_price:', product.target_price, 'price_goal:', product.price_goal);
          
          // Handle missing title gracefully
          const productTitle = product.title || product.product_name || 'Unknown Product';
          
          // Get image URL from correct field name and proxy it to avoid CORS
          const imageUrl = product.product_image_url ? 
            `https://images.weserv.nl/?url=${encodeURIComponent(product.product_image_url)}` : 
            '/img/icon.png';
          console.log('🔍 FINAL IMAGE URL:', imageUrl);
          console.log('🔍 PRODUCT IMAGE URL TYPE:', typeof imageUrl);
          console.log('🔍 PRODUCT IMAGE URL LENGTH:', imageUrl ? imageUrl.length : 'null/undefined');
          
          // Test if the image URL is accessible
          if (imageUrl) {
            fetch(imageUrl, { mode: 'no-cors' })
              .then(() => console.log('🔍 IMAGE ACCESSIBLE:', imageUrl))
              .catch((err) => console.log('🔍 IMAGE BLOCKED (CORS):', imageUrl, err));
          }
          
          return {
            id: product.id.toString(),
            imageUrl: imageUrl,
            title: productTitle,
            price: product.current_price || '0',
            originalPrice: parseFloat(product.current_price || '0'), 
            vendor: product.site || product.vendor || 'Unknown',
            targetPrice: product.target_price,
            expiresIn: product.expires_at ? calculateDaysRemaining(product.expires_at) : 'No expiration',
            status: product.active !== undefined ? (product.active ? 'tracking' : 'paused') : 'tracking',
            url: product.url || product.product_url || '',
            extractedAt: product.created_at || product.updated_at || new Date().toISOString(),
          };
        });
      }
      
      // Always use real data from API, even if empty
      console.log('🔍 SETTING PRODUCTS WITH IMAGEURLS:', convertedProducts.map(p => ({ id: p.id, title: p.title, imageUrl: p.imageUrl })));
      setProducts(convertedProducts);
      
      // Calculate stats
      const totalProducts = convertedProducts.length;
      const trackingProducts = convertedProducts.filter(p => p.status === 'tracking').length;
      const completedProducts = convertedProducts.filter(p => p.status === 'completed').length;
      const totalSavings = convertedProducts.reduce((sum, product) => {
        if (product.targetPrice && product.originalPrice) {
          const targetPriceNum = parseFloat(product.targetPrice);
          const savings = product.originalPrice - targetPriceNum;
          return sum + (savings > 0 ? savings : 0);
        }
        return sum;
      }, 0);
      
      setStats({
        totalProducts,
        trackingProducts,
        completedProducts,
        totalSavings,
      });
      
    } catch (error) {
      console.error('Failed to load products:', error);
      setError(error instanceof Error ? error.message : 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Listen for product refresh events from AlertContext
  useEffect(() => {
    const handleProductRefresh = (event: Event) => {
      console.log('🔄 Received product refresh event:', event);
      console.log('🔄 About to reload products...');
      loadProducts();
    };

    console.log('🔄 Setting up refreshProducts event listener');
    window.addEventListener('refreshProducts', handleProductRefresh);
    return () => {
      console.log('🔄 Removing refreshProducts event listener');
      window.removeEventListener('refreshProducts', handleProductRefresh);
    };
  }, [loadProducts]);

  // DEBUG: Log when products change
  useEffect(() => {
    console.log('🔍 PRODUCTS UPDATED:', products.map(p => ({ id: p.id, title: p.title, targetPrice: p.targetPrice })));
  }, [products]);

  // Filter products based on status and deal status
  const filteredProducts = useMemo(() => {
    console.log('🔍 PRODUCTS STATE:', products);
    console.log('🔍 FIRST PRODUCT IMAGEURL:', products[0]?.imageUrl);
    console.log('🔍 FILTERED PRODUCTS BEFORE RETURN:', products.map(p => ({ id: p.id, title: p.title, imageUrl: p.imageUrl })));
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
        
        const hasAlert = productHasAlert(product.id);
        
        return {
          id: product.id,
          product_name: product.title || 'Unknown Product',
          imageUrl: product.imageUrl || '',
          price: product.price || '0',
          originalPrice: product.originalPrice, // Preserve originalPrice for API calls
          vendor: product.vendor || 'Unknown',
          targetPrice: product.targetPrice,
          expiresIn: product.expiresIn,
          status: product.status || 'tracking',
          url: product.url || '#',
          extractedAt: product.extractedAt || new Date().toISOString(),
          hasAlert: hasAlert, // Add hasAlert property
        };
      } catch (error) {
        console.error('Error processing product:', product.id, error);
        // NO FALLBACKS - THROW THE ERROR
        throw error;
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
            // Show products where target price has been reached (current <= target)
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
      
      {/* Network Error Warning Banner */}
      {error && error.includes('Network connection issue') && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Demo Mode</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Network connection issue detected. You're viewing demo data. Alerts created with demo products will not work.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Product Tracker Section */}
      <div className="mb-12">
        {/* Header with Alert Icon and Savings */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Product Tracker</h1>
            <div className="text-sm text-green-600 font-medium">
              Potential Savings: <span className="font-bold">{formatPrice(stats.totalSavings)}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAlertModal(true)}
              className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
              title="View Deal Alerts"
            >
              <span className="text-2xl">🔔</span>
              {alertStats.triggered > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {alertStats.triggered}
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
            onClick={() => setFilter('deals')}
            className={getFilterButtonClass('deals')}
          >
            DealPop ({getFilterCount('deals')})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={getFilterButtonClass('completed')}
          >
            Expired ({getFilterCount('completed')})
          </button>
          <button
            onClick={() => setFilter('tracking')}
            className={getFilterButtonClass('tracking')}
          >
            Active ({getFilterCount('tracking')})
          </button>
          <button
            onClick={() => setFilter('paused')}
            className={getFilterButtonClass('paused')}
          >
            Completed ({getFilterCount('paused')})
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
            originalPrice: product.originalPrice?.toString(),
            expiresIn: product.expiresIn,
            status: product.status,
            url: product.url,
            extractedAt: product.extractedAt,
          }))}
          className="mb-6"
        />
      </div>

      {/* Empty State - No Products */}
      {!loading && products.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Products Available
          </h3>
          <p className="text-gray-600 mb-6">
            {error && error.includes('Authentication issue') ? 
              "Authentication issue. Please log in again to access your data." :
              error && error.includes('Network connection issue') ? 
                "Network connection issue. Showing demo data. Please check your connection and try again." :
                error ? 
                  "Unable to load products from the database. Please check your connection and try again." :
                  "No products have been added to the database yet."
            }
          </p>
          {error && (
            <div className="space-x-2">
              {error.includes('Authentication issue') ? (
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Go to Login
                </button>
              ) : (
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Search Results */}
      <SearchResults
        products={products}
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
          // Use originalPrice if available, otherwise parse the formatted price
          const currentPrice = selectedProduct.originalPrice || parseFloat(selectedProduct.price.replace(/[^0-9.]/g, ''));
          
          // Use the product's target price from database (not stale alert data)
          const finalTargetPrice = selectedProduct.targetPrice;
          
          if (import.meta.env.DEV) {
            console.log('🔍 Modal price debugging:', {
              originalPrice: selectedProduct.originalPrice,
              formattedPrice: selectedProduct.price,
              parsedPrice: currentPrice,
              productTitle: selectedProduct.title,
              productTargetPrice: selectedProduct.targetPrice,
              finalTargetPrice: finalTargetPrice
            });
          }
          return {
            id: selectedProduct.id,
            name: selectedProduct.title,
            url: selectedProduct.url,
            image: selectedProduct.imageUrl,
            currentPrice: currentPrice,
            targetPrice: finalTargetPrice, // Use same logic as ProductCard for consistency
          };
        })() : undefined}
        existingAlert={selectedProduct ? { 
          id: 'tracked', 
          userId: user?.uid || '',
          productId: selectedProduct.id,
          productName: selectedProduct.title,
          productUrl: selectedProduct.url,
          productImage: selectedProduct.imageUrl,
          currentPrice: selectedProduct.originalPrice || 0,
          targetPrice: selectedProduct.targetPrice,
          alertType: 'price_drop' as const,
          status: 'active' as const,
          notificationPreferences: {
            email: true,
            push: true,
            sms: false
          },
          thresholds: {
            priceDropPercentage: 10,
            absolutePriceDrop: 10
          },
          expiresAt: '',
          triggeredAt: undefined,
          createdAt: '',
          updatedAt: '',
          lastCheckedAt: ''
        } : undefined}
      />

      {/* Alert Management Modal */}
      <AlertsListModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
      />
      
      {/* Debug Info (Development Only) */}
      <AlertDebugInfo 
        products={products}
        alerts={alerts}
        isVisible={import.meta.env.DEV}
      />
    </main>
  );
}