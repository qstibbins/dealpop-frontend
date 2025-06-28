import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const { pathname } = useLocation();

  const navItem = (to: string, label: string) => (
    <Link
      to={to}
      className={`block px-4 py-2 rounded hover:bg-pink-100 ${pathname === to ? 'bg-pink-200 font-semibold' : ''}`}
    >
      {label}
    </Link>
  );

  return (
    <aside className="bg-bg w-56 min-h-screen p-4 text-sm text-gray-700">
      <div className="mb-8 text-xl font-bold text-accent">Deal Pop</div>
      {navItem('/dashboard', 'Homepage')}
      {navItem('/alerts', 'Price Drop Alert')}
      {navItem('/settings', 'Settings')}
      <div className="mt-8">
        <button className="w-full bg-accent text-white py-2 rounded hover:bg-pink-600">Logout</button>
      </div>
    </aside>
  );
}