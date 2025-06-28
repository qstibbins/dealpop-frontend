import React from 'react';

export default function ProductDetail() {
  return (
    <main className="p-6 flex-1 bg-bg">
      <h1 className="text-2xl font-bold mb-4">Cute Couch</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div className="bg-white rounded shadow p-4 h-64">[Image Gallery Placeholder]</div>
        <div className="bg-white rounded shadow p-4">
          <p className="text-lg">Current Price: <strong>$55</strong></p>
          <p className="text-lg">Goal Price: <strong>$25</strong></p>
          <p className="mt-4 text-gray-700">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros...
          </p>
          <div className="mt-6 flex gap-2">
            <button className="px-4 py-2 rounded bg-pink text-black font-semibold">Continue Tracking</button>
            <button className="px-4 py-2 rounded border">Remove From Tracker</button>
          </div>
        </div>
      </div>
    </main>
  );
}