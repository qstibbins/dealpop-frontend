import { useState, useEffect, useMemo } from 'react';
import { ChromeStorageService } from '../services/chromeStorage';
import { SearchService } from '../services/searchService';
import { ImageService } from '../services/imageService';
import SearchFiltersComponent from '../components/SearchFilters';
import SearchResults from '../components/SearchResults';
import CreateAlertModal from '../components/CreateAlertModal';
import { useSearch } from '../hooks/useSearch';

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



  // Filter products based on search criteria
  const filteredProducts = useMemo(() => {
    // Convert Product[] to ExtractedProduct[] for the search service
    const extractedProducts = products.map(product => ({
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
  }, [products, debouncedFilters]);

  const handleCreateAlert = (product: any) => {
    setSelectedProduct(product);
    setShowCreateAlertModal(true);
  };

  const handleViewProduct = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <main className="p-6 flex-1 bg-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Product Tracker</h1>
        
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
    </main>
  );
}