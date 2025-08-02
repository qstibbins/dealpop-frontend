import { useState, useEffect, useMemo } from 'react';
import { ChromeStorageService } from '../services/chromeStorage';
import { SearchService } from '../services/searchService';
import { ImageService } from '../services/imageService';
import SearchFiltersComponent from '../components/SearchFilters';
import SearchResults from '../components/SearchResults';
import CreateAlertModal from '../components/CreateAlertModal';
import AlertHistoryModal from '../components/AlertHistoryModal';
import { useSearch } from '../hooks/useSearch';
import { useAlerts } from '../contexts/AlertContext';

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
  
  const { getAlertStats } = useAlerts();
  const alertStats = getAlertStats();

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

  // Load products from Chrome storage
  useEffect(() => {
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
    }));

    return SearchService.filterProducts(extractedProducts, debouncedFilters);
  }, [products, debouncedFilters, filter]);

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
        {/* Header with Alert Icon */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Product Tracker</h1>
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
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.totalProducts}</div>
            <div className="text-sm text-blue-600">Total Products</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.trackingProducts}</div>
            <div className="text-sm text-green-600">Tracking</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.completedProducts}</div>
            <div className="text-sm text-purple-600">Completed</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">${stats.totalSavings}</div>
            <div className="text-sm text-yellow-600">Total Savings</div>
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
        filteredProducts={filteredProducts}
        loading={loading}
        onCreateAlert={handleCreateAlert}
        onViewProduct={handleViewProduct}
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