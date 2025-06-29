import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { fetchWithAuth } from '../utils/fetcher';
import { Link } from 'react-router-dom';

// Define the product type to match ProductCard props
interface Product {
  id: string;
  imageUrl: string;
  title: string;
  price: string;
  vendor: string;
  targetPrice?: string;
  expiresIn?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const dummyProducts: Product[] = [
    { id: '1', imageUrl: `${import.meta.env.BASE_URL}img/mixer.png`, title: 'Kitchen Mixer', price: '499.95', vendor: 'Amazon', targetPrice: '300', expiresIn: '2 days' },
    { id: '2', imageUrl: `${import.meta.env.BASE_URL}img/headphones.png`, title: 'Bluetooth Headphones', price: '89.99', vendor: 'TechCorp', targetPrice: '79.99', expiresIn: '3 days' },
    { id: '3', imageUrl: `${import.meta.env.BASE_URL}img/watch.png`, title: 'Smart Fitness Watch', price: '199.99', vendor: 'FitTech', targetPrice: '179.99', expiresIn: '1 week' },
    { id: '4', imageUrl: `${import.meta.env.BASE_URL}img/powerbank.png`, title: 'Portable Power Bank', price: '29.99', vendor: 'PowerPlus', targetPrice: '25.00', expiresIn: '5 days' },
    { id: '5', imageUrl: `${import.meta.env.BASE_URL}img/skincare.png`, title: 'Skincare Cream', price: '24.99', vendor: 'BeautyCo', targetPrice: '19.99', expiresIn: '4 days' },
    { id: '6', imageUrl: `${import.meta.env.BASE_URL}img/laptop.png`, title: 'Laptop', price: '999.99', vendor: 'CompWorld', targetPrice: '899.99', expiresIn: '2 weeks' },
    { id: '7', imageUrl: `${import.meta.env.BASE_URL}img/sofa.png`, title: 'Modern Sofa', price: '799.99', vendor: 'HomeStore', targetPrice: '699.99', expiresIn: '10 days' },
  ];

  useEffect(() => {
    fetchWithAuth(`${API_BASE_URL}/api/products`)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        } else {
          setProducts(dummyProducts);
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setProducts(dummyProducts);
      });
  }, []);

  return (
    <main className="p-6 flex-1 bg-white">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Product Tracker</h1>
        <input
          type="text"
          placeholder="Search"
          className="border px-3 py-1 rounded focus:outline-none w-64"
        />
      </div>
      <div className="mb-4 space-x-2">
        {['All', 'Skincare', 'Tech', 'Home'].map(tag => (
          <button key={tag} className="px-3 py-1 rounded-full bg-pink-100 text-sm hover:bg-pink-200">
            {tag}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <Link key={p.id} to={`/product/${p.id}`} className="block">
            <ProductCard {...p} />
          </Link>
        ))}
      </div>
    </main>
  );
}