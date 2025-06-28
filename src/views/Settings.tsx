import { useState } from 'react';

export default function Settings() {
  const [email, setEmail] = useState('');
  const [smsEnabled, setSmsEnabled] = useState(false);

  return (
    <main className="p-6 flex-1 bg-white">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          className="border px-3 py-2 rounded w-full"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <label className="text-sm font-medium">Enable SMS Alerts</label>
        <input
          type="checkbox"
          checked={smsEnabled}
          onChange={() => setSmsEnabled(!smsEnabled)}
          className="form-checkbox h-5 w-5 text-accent"
        />
      </div>

      <button className="bg-accent text-white px-4 py-2 rounded hover:bg-pink-600">Save Settings</button>
    </main>
  );
}