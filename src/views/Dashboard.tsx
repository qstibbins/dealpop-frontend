import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiAdapter } from '../services/apiAdapter';
import { SearchService } from '../services/searchService';
import { ImageService } from '../services/imageService';
import SearchFiltersComponent from '../components/SearchFilters';
import SearchResults from '../components/SearchResults';
import CreateAlertModal from '../components/CreateAlertModal';
import AlertHistoryModal from '../components/AlertHistoryModal';
import { useSearch } from '../hooks/useSearch';
import { useAlerts } from '../contexts/AlertContext';
import { useAuth } from '../contexts/AuthContext';
import AlertDebugInfo from '../components/AlertDebugInfo';
import { formatPrice } from '../utils/priceFormatting';
import { isStaticMode } from '../config/staticMode';

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

  // No dummy products - we'll show proper error states instead

  // Check authentication and redirect if needed
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  // Load products from API
  useEffect(() => {
    if (!user) return; // Don't load products if not authenticated
    
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await apiAdapter.getProducts();
        console.log('🔍 RAW API RESPONSE:', response);
        
        // Backend returns array directly, not wrapped in {products: [...]}
        const productsData = response;
        console.log('🔍 PRODUCTS DATA:', productsData);
        console.log('🔍 IS ARRAY:', Array.isArray(productsData));
        console.log('🔍 LENGTH:', productsData?.length);
        
        // Convert API response to Product format
        let convertedProducts: Product[] = [];
        if (Array.isArray(productsData)) {
          convertedProducts = productsData.map(product => {
            console.log('🔍 MAPPING PRODUCT:', product);
            
            return {
              id: product.id.toString(),
              imageUrl: product.product_image_url || ImageService.getFallbackImage(product.product_name),
              title: product.product_name,
              price: product.current_price,
              originalPrice: parseFloat(product.current_price), // Keep original numeric price
              vendor: product.vendor || 'Unknown',
              targetPrice: product.target_price,
              expiresIn: 'N/A', // Calculate from expires_at if needed
              status: product.status || 'tracking',
              url: product.product_url,
              extractedAt: product.extracted_at,
            };
          });
        }
        
        // Always use real data from API, even if empty
        setError(null); // Clear any previous errors
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
        
        // Use realistic stats for demo mode
        if (isStaticMode()) {
          setStats({
            totalProducts: 12,
            trackingProducts: 8,
            completedProducts: 2,
            totalSavings: 920.00, // Match the UI
          });
        } else {
          setStats({ totalProducts, trackingProducts, completedProducts, totalSavings });
        }
      } catch (error) {
        console.error('Failed to load products from API:', error);
        
        // NO FALLBACKS - LET IT FAIL HARD
        console.error('API ERROR - NO FALLBACKS, NO MOCK DATA:', error);
        setProducts([]);
        setError(error instanceof Error ? error.message : 'Failed to load products');
        setStats({
          totalProducts: 0,
          trackingProducts: 0,
          completedProducts: 0,
          totalSavings: 0,
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
          originalPrice: product.originalPrice, // Preserve originalPrice for API calls
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
    if (filterValue === 'deals') {
      return `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        filter === filterValue
          ? 'bg-pink-500 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`;
    }
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
      {/* Demo Mode Banner */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-blue-400">🎯</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Demo Mode</h3>
            <p className="text-sm text-blue-700 mt-1">
              This is a static preview with realistic mock data.
            </p>
          </div>
        </div>
      </div>
      
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
              Total Saved: <span className="font-bold">{formatPrice(stats.totalSavings)}</span>
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
            originalPrice: product.originalPrice,
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
              originalPrice: product.originalPrice, // Preserve originalPrice for API calls
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
              originalPrice: product.originalPrice, // Preserve originalPrice for API calls
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
          // Use originalPrice if available, otherwise parse the formatted price
          const currentPrice = selectedProduct.originalPrice || parseFloat(selectedProduct.price.replace(/[^0-9.]/g, ''));
          
          // Use the SAME target price logic as ProductCard for consistency
          const existingAlert = getExistingAlert(selectedProduct.id);
          const finalTargetPrice = existingAlert ? existingAlert.targetPrice?.toString() : selectedProduct.targetPrice;
          
          if (process.env.NODE_ENV === 'development') {
            console.log('🔍 Modal price debugging:', {
              originalPrice: selectedProduct.originalPrice,
              formattedPrice: selectedProduct.price,
              parsedPrice: currentPrice,
              productTitle: selectedProduct.title,
              productTargetPrice: selectedProduct.targetPrice,
              alertTargetPrice: existingAlert?.targetPrice,
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