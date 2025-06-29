import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchWithAuth } from '../utils/fetcher';

const dummyProducts = [
  { id: '1', imageUrl: `${import.meta.env.BASE_URL}img/mixer.png`, title: 'Kitchen Mixer', price: '499.95', vendor: 'Amazon', targetPrice: '300', expiresIn: '2 days' },
  { id: '2', imageUrl: `${import.meta.env.BASE_URL}img/headphones.png`, title: 'Bluetooth Headphones', price: '89.99', vendor: 'TechCorp', targetPrice: '79.99', expiresIn: '3 days' },
  { id: '3', imageUrl: `${import.meta.env.BASE_URL}img/watch.png`, title: 'Smart Fitness Watch', price: '199.99', vendor: 'FitTech', targetPrice: '179.99', expiresIn: '1 week' },
  { id: '4', imageUrl: `${import.meta.env.BASE_URL}img/powerbank.png`, title: 'Portable Power Bank', price: '29.99', vendor: 'PowerPlus', targetPrice: '25.00', expiresIn: '5 days' },
  { id: '5', imageUrl: `${import.meta.env.BASE_URL}img/skincare.png`, title: 'Skincare Cream', price: '24.99', vendor: 'BeautyCo', targetPrice: '19.99', expiresIn: '4 days' },
  { id: '6', imageUrl: `${import.meta.env.BASE_URL}img/laptop.png`, title: 'Laptop', price: '999.99', vendor: 'CompWorld', targetPrice: '899.99', expiresIn: '2 weeks' },
  { id: '7', imageUrl: `${import.meta.env.BASE_URL}img/sofa.png`, title: 'Modern Sofa', price: '799.99', vendor: 'HomeStore', targetPrice: '699.99', expiresIn: '10 days' },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchWithAuth(`${API_BASE_URL}/api/products/${id}`)
      .then((data) => {
        if (data && data.id) {
          setProduct(data);
        } else {
          // fallback to dummy
          const dummy = dummyProducts.find(p => p.id === id);
          setProduct(dummy || null);
        }
      })
      .catch(() => {
        const dummy = dummyProducts.find(p => p.id === id);
        setProduct(dummy || null);
      });
  }, [id]);

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
      <h1 className="text-2xl font-bold mb-4">{product.title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div className="bg-white rounded shadow p-4 h-64 flex items-center justify-center">
          <img src={product.imageUrl} alt={product.title} className="max-h-48 object-contain" />
        </div>
        <div className="bg-white rounded shadow p-4">
          <p className="text-lg">Current Price: <strong>${product.price}</strong></p>
          <p className="text-lg">Goal Price: <strong>${product.targetPrice}</strong></p>
          <p className="mt-4 text-gray-700">
            Vendor: {product.vendor}
          </p>
          <p className="text-gray-500 mt-2">Tracker ends in {product.expiresIn}</p>
          <div className="mt-6 flex gap-2">
            <button className="px-4 py-2 rounded bg-pink text-black font-semibold">Continue Tracking</button>
            <button className="px-4 py-2 rounded border">Remove From Tracker</button>
          </div>
        </div>
      </div>
    </main>
  );
}