import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const navItem = (to: string, label: string) => (
    <Link
      to={to}
      className={`block px-4 py-2 rounded hover:bg-gray-100 ${pathname === to ? 'bg-blue-100 text-blue-600 font-semibold' : ''}`}
    >
      {label}
    </Link>
  );

  const handleLogout = async () => {
    const result = await signOut();
    if (!result.error) {
      navigate('/login');
    }
  };

  return (
    <aside className="bg-white w-56 min-h-screen p-4 text-sm text-gray-700 border-r">
      <div className="mb-8 text-xl font-bold text-red-600">dealpop</div>
      

      {/* Navigation */}
      {navItem('/dashboard', 'Homepage')}
      {navItem('/settings', 'Settings')}
      
      {/* Logout Button */}
      <div className="mt-8">
        <button 
          onClick={handleLogout}
          className="w-full bg-white text-gray-700 py-2 rounded border hover:bg-gray-50 transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}