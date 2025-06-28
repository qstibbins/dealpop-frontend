import React from 'react';
import ProductCard from '../components/ProductCard';

export default function Dashboard() {
  const dummyProducts = [
    { imageUrl: '/img/mixer.png', title: 'Kitchen Aid', price: '499.95', vendor: 'Amazon', targetPrice: '300', expiresIn: '2 days' },
    { imageUrl: '/img/mixer.png', title: 'Kitchen Aid', price: '499.95', vendor: 'Amazon', targetPrice: '300', expiresIn: '2 days' },
  ];

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
        {dummyProducts.map((p, i) => (
          <ProductCard key={i} {...p} />
        ))}
      </div>
    </main>
  );
}