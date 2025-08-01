import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
  color?: string;
  brand?: string;
  capacity?: string;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    targetPrice: '',
    status: 'tracking' as 'tracking' | 'paused' | 'completed',
  });

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      try {
        const products = await ChromeStorageService.getProducts();
        const foundProduct = products.find(p => p.id === id);
        
        if (foundProduct) {
          const convertedProduct: Product = {
            id: foundProduct.id,
            imageUrl: `${import.meta.env.BASE_URL}img/laptop.png`,
            title: foundProduct.product_name,
            price: foundProduct.price,
            vendor: foundProduct.vendor || 'Unknown',
            targetPrice: foundProduct.targetPrice,
            expiresIn: foundProduct.expiresIn,
            status: foundProduct.status,
            url: foundProduct.url,
            extractedAt: foundProduct.extractedAt,
            color: foundProduct.color,
            brand: foundProduct.brand,
            capacity: foundProduct.capacity,
          };
          
          setProduct(convertedProduct);
          setFormData({
            targetPrice: foundProduct.targetPrice || '',
            status: foundProduct.status,
          });
        }
      } catch (error) {
        console.error('Failed to load product:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleSave = async () => {
    if (!product) return;
    
    try {
      await ChromeStorageService.updateProduct(product.id, {
        targetPrice: formData.targetPrice,
        status: formData.status,
      });
      
      setProduct(prev => prev ? { ...prev, ...formData } : null);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await ChromeStorageService.deleteProduct(product.id);
        navigate('/dashboard');
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  if (loading) {
    return (
      <main className="p-6 flex-1 bg-bg">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading product...</div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="p-6 flex-1 bg-bg">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <button className="px-4 py-2 rounded bg-accent text-white" onClick={() => navigate(-1)}>Go Back</button>
      </main>
    );
  }

  return (
    <main className="p-6 flex-1 bg-bg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{product.title}</h1>
        <div className="flex gap-2">
          <button 
            className="px-4 py-2 rounded bg-accent text-white hover:bg-pink-600"
            onClick={() => setEditing(!editing)}
          >
            {editing ? 'Cancel' : 'Edit'}
          </button>
          <button 
            className="px-4 py-2 rounded border border-red-500 text-red-500 hover:bg-red-50"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded shadow p-4 h-64 flex items-center justify-center">
          <img src={product.imageUrl} alt={product.title} className="max-h-48 object-contain" />
        </div>
        
        <div className="bg-white rounded shadow p-4">
          <div className="mb-4">
            <p className="text-lg">Current Price: <strong className="text-green-600">${product.price}</strong></p>
            {product.targetPrice && (
              <p className="text-lg">Target Price: <strong className="text-blue-600">${product.targetPrice}</strong></p>
            )}
          </div>

          <div className="mb-4">
            <p className="text-gray-700">Vendor: {product.vendor}</p>
            {product.brand && <p className="text-gray-700">Brand: {product.brand}</p>}
            {product.color && <p className="text-gray-700">Color: {product.color}</p>}
            {product.capacity && <p className="text-gray-700">Capacity: {product.capacity}</p>}
            {product.expiresIn && <p className="text-gray-500">Tracker ends in {product.expiresIn}</p>}
          </div>

          {product.url && (
            <div className="mb-4">
              <a 
                href={product.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                View Original Product
              </a>
            </div>
          )}

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Target Price</label>
                <input
                  type="text"
                  value={formData.targetPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetPrice: e.target.value }))}
                  className="border px-3 py-2 rounded w-full"
                  placeholder="Enter target price"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="border px-3 py-2 rounded w-full"
                >
                  <option value="tracking">Tracking</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <button 
                className="w-full bg-accent text-white py-2 rounded hover:bg-pink-600"
                onClick={handleSave}
              >
                Save Changes
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded bg-pink text-black font-semibold">
                Continue Tracking
              </button>
              <button className="px-4 py-2 rounded border">
                Pause Tracking
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}