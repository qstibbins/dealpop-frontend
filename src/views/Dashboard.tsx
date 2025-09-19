import { useState, useEffect, useMemo } from 'react';
import { ChromeStorageService } from '../services/chromeStorage';
import { SearchService } from '../services/searchService';
import { ImageService } from '../services/imageService';
import SearchFiltersComponent from '../components/SearchFilters';
import SearchResults from '../components/SearchResults';
import CreateAlertModal from '../components/CreateAlertModal';
import AlertHistoryModal from '../components/AlertHistoryModal';
import PriceSummary from '../components/PriceSummary';
import { useSearch } from '../hooks/useSearch';
import { useAlerts } from '../contexts/AlertContext';
import { setupMockAlerts, getAlertStatus } from '../utils/setupMockAlerts';
import { MockAlertService } from '../services/mockAlertService';

interface Product {
  id: string;
  imageUrl: string;
  title: string;
  price: string;
  vendor: string;
  targetPrice?: string;
  previousPrice?: string;
  originalPrice?: string;
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
  const productHasAlert = (productId: string) => {
    const hasAlert = alerts.some(alert => alert.productId === productId && alert.status === 'active');
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Product ${productId} has alert: ${hasAlert}`);
    }
    return hasAlert;
  };

  // Dummy products fallback
  const dummyProducts: Product[] = [
    {
      id: '1',
      imageUrl: ImageService.getFallbackImage('Sample Laptop'),
      title: 'Sample Laptop',
      price: '999.99',
      vendor: 'TechStore',
      targetPrice: '899.99',
      previousPrice: '1099.99',
      originalPrice: '1199.99',
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
      previousPrice: '179.99',
      originalPrice: '249.99',
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
      previousPrice: '549.99',
      originalPrice: '599.99',
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
      previousPrice: '279.99',
      originalPrice: '329.99',
      expiresIn: '15 days',
      status: 'tracking',
      url: 'https://example.com/monitor',
      extractedAt: new Date().toISOString(),
    },
  ];

  // Load products from Chrome storage
  useEffect(() => {
    // Auto-initialize mock alerts in development mode
    if (process.env.NODE_ENV === 'development') {
      MockAlertService.initializeMockData();
      MockAlertService.forceCreateDashboardAlerts();
      console.log('🔔 Mock alerts initialized for development testing');
      
      // Debug: Show what alerts are available
      const alerts = MockAlertService.getAlerts();
      const activeAlerts = alerts.filter(alert => alert.status === 'active');
      console.log('📋 Available alerts:', activeAlerts.map(a => `${a.productName} (ID: ${a.productId})`));
    }

    const loadProducts = async () => {
      try {
        const extractedProducts = await ChromeStorageService.getProducts();
        let convertedProducts: Product[] = extractedProducts.map(product => ({
          id: product.id,
          imageUrl: product.imageUrl || ImageService.getFallbackImage(product.product_name), // Use extracted image or fallback
          title: product.product_name,
          price: product.price,
          vendor: product.vendor || 'Unknown',
          targetPrice: product.targetPrice,
          expiresIn: product.expiresIn,
          status: product.status || 'tracking',
          url: product.url,
          extractedAt: product.extractedAt,
        }));
        
        // Fallback to dummyProducts if Chrome extension API is unavailable or no products
        if (!window.chrome || !window.chrome.storage || convertedProducts.length === 0) {
          convertedProducts = dummyProducts;
        }
        setProducts(convertedProducts);
        // Load stats
        let statsData;
        if (!window.chrome || !window.chrome.storage || convertedProducts === dummyProducts) {
          // Dummy stats for fallback
          statsData = {
            totalProducts: dummyProducts.length,
            trackingProducts: dummyProducts.filter(p => p.status === 'tracking').length,
            completedProducts: dummyProducts.filter(p => p.status === 'completed').length,
            totalSavings: 150, // Example static value
          };
        } else {
          statsData = await ChromeStorageService.getStats();
        }
        setStats(statsData);
      } catch (error) {
        console.error('Failed to load products:', error);
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

    // Listen for changes from the Chrome extension
    ChromeStorageService.onStorageChange((extractedProducts) => {
      const convertedProducts: Product[] = extractedProducts.map(product => ({
        id: product.id,
        imageUrl: product.imageUrl || ImageService.getFallbackImage(product.product_name), // Use extracted image or fallback
        title: product.product_name,
        price: product.price,
        vendor: product.vendor || 'Unknown',
        targetPrice: product.targetPrice,
        expiresIn: product.expiresIn,
        status: product.status,
        url: product.url,
        extractedAt: product.extractedAt,
      }));
      
      setProducts(convertedProducts);
    });
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
      filtered = filtered.filter(product => 
        product.targetPrice && 
        parseFloat(product.price.replace(/[^0-9.]/g, '')) <= parseFloat(product.targetPrice.replace(/[^0-9.]/g, ''))
      );
    }

    // Convert Product[] to ExtractedProduct[] for the search service
    const extractedProducts = filtered.map(product => ({
      id: product.id,
      product_name: product.title,
      price: product.price,
      vendor: product.vendor,
      targetPrice: product.targetPrice,
      expiresIn: product.expiresIn,
      status: product.status,
      url: product.url,
      extractedAt: product.extractedAt,
      brand: '', // Add default values for missing fields
      color: '',
      capacity: '',
      hasAlert: productHasAlert(product.id), // Add hasAlert property
    }));

    return SearchService.filterProducts(extractedProducts, debouncedFilters);
  }, [products, debouncedFilters, filter, alerts]); // Add alerts to dependencies

  // Check if smart sorting is active
  const isSmartSortingActive = debouncedFilters.sortBy === 'smart';

  const handleCreateAlert = (product: any) => {
    setSelectedProduct(product);
    setShowCreateAlertModal(true);
  };

  // Helper function to get existing alert for a product
  const getExistingAlert = (productId: string) => {
    return alerts.find(alert => alert.productId === productId && alert.status === 'active');
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
        return products.filter(product => 
          product.targetPrice && 
          parseFloat(product.price.replace(/[^0-9.]/g, '')) <= parseFloat(product.targetPrice.replace(/[^0-9.]/g, ''))
        ).length;
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
            {/* Development buttons - only show in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="flex space-x-2 mr-4">
                <button
                  onClick={() => {
                    setupMockAlerts();
                    // Force a re-render to update the UI
                    window.location.reload();
                  }}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  title="Set up mock alerts for testing"
                >
                  Setup Alerts
                </button>
                <button
                  onClick={() => {
                    MockAlertService.forceCreateDashboardAlerts();
                    window.location.reload();
                  }}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                  title="Force create dashboard alerts"
                >
                  Force Dashboard Alerts
                </button>
                <button
                  onClick={getAlertStatus}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  title="Check alert status"
                >
                  Alert Status
                </button>
              </div>
            )}
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
        
        {/* Enhanced Price Summary */}
        {products.length > 0 && (
          <PriceSummary products={products} className="mb-6" />
        )}

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
            previousPrice: product.previousPrice,
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

      {/* Search Results */}
      <SearchResults
        products={products.map(product => ({
          id: product.id,
          product_name: product.title,
          price: product.price,
          vendor: product.vendor,
          targetPrice: product.targetPrice,
          previousPrice: product.previousPrice,
          originalPrice: product.originalPrice,
          expiresIn: product.expiresIn,
          status: product.status,
          url: product.url,
          extractedAt: product.extractedAt,
          brand: '',
          color: '',
          capacity: '',
          hasAlert: productHasAlert(product.id),
        }))}
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
        productData={selectedProduct ? {
          id: selectedProduct.id,
          name: selectedProduct.title,
          url: selectedProduct.url,
          image: selectedProduct.imageUrl,
          currentPrice: parseFloat(selectedProduct.price.replace(/[^0-9.]/g, '')),
        } : undefined}
        existingAlert={selectedProduct ? getExistingAlert(selectedProduct.id) : undefined}
      />

      {/* Alert Management Modal */}
      <AlertHistoryModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        alertId="all"
        alertName="All Alerts"
      />
    </main>
  );
}