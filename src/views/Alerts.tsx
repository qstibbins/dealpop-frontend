import { useEffect, useState } from 'react';
import { fetchWithAuth } from '../utils/fetcher';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Dummy alerts to use as fallback
const dummyAlerts = [
  { id: '1', message: 'Price dropped for Bluetooth Headphones!' },
  { id: '2', message: 'Kitchen Mixer is back in stock.' },
];

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth(`${API_BASE_URL}/api/alerts`)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAlerts(data);
        } else {
          setAlerts(dummyAlerts);
        }
        setLoading(false);
      })
      .catch(() => {
        setAlerts(dummyAlerts);
        setLoading(false);
      });
  }, []);

  return (
    <main className="p-6 flex-1 bg-white">
      <h1 className="text-2xl font-bold mb-4">Alerts</h1>
      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : alerts.length === 0 ? (
        <p className="text-gray-600">No alerts yet. You'll see tracked product updates here.</p>
      ) : (
        <ul className="space-y-2">
          {alerts.map((alert, i) => (
            <li key={alert.id || i} className="p-4 bg-pink-50 rounded shadow">
              {alert.message || JSON.stringify(alert)}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}