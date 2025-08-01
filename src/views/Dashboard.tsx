import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { ChromeStorageService } from '../services/chromeStorage';

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
  const [stats, setStats] = useState({
    totalProducts: 0,
    trackingProducts: 0,
    completedProducts: 0,
    totalSavings: 0,
  });

  // Dummy products fallback
  const dummyProducts: Product[] = [
    {
      id: '1',
      imageUrl: `${import.meta.env.BASE_URL}img/laptop.png`,
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
      imageUrl: `${import.meta.env.BASE_URL}img/headphones.png`,
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
      imageUrl: `${import.meta.env.BASE_URL}img/sofa.png`,
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
          imageUrl: `${import.meta.env.BASE_URL}img/laptop.png`, // Default image
          title: product.product_name,
          price: product.price,
          vendor: product.vendor || 'Unknown',
          targetPrice: product.targetPrice,
          expiresIn: product.expiresIn,
          status: product.status,
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
        imageUrl: `${import.meta.env.BASE_URL}img/laptop.png`,
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

  if (loading) {
    return (
      <main className="p-6 flex-1 bg-white">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading your products...</div>
        </div>
      </main>
    );
  }

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

        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Search products..."
            className="border px-3 py-1 rounded focus:outline-none w-64"
          />
          <div className="text-sm text-gray-600">
            {products.length} products tracked
          </div>
        </div>
      </div>

      <div className="mb-4 space-x-2">
        {['All', 'Tracking', 'Paused', 'Completed'].map(tag => (
          <button key={tag} className="px-3 py-1 rounded-full bg-pink-100 text-sm hover:bg-pink-200">
            {tag}
          </button>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-500 mb-4">
            Use the Chrome extension to extract products from shopping websites.
          </p>
          <div className="text-sm text-gray-400">
            Products you extract will appear here automatically.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Link key={product.id} to={`/product/${product.id}`} className="block">
              <ProductCard {...product} />
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}