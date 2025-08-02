import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const navItem = (to: string, label: string) => (
    <Link
      to={to}
      className={`block px-4 py-2 rounded hover:bg-pink-100 ${pathname === to ? 'bg-pink-200 font-semibold' : ''}`}
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
    <aside className="bg-bg w-56 min-h-screen p-4 text-sm text-gray-700">
      <div className="mb-8 text-xl font-bold text-accent">Deal Pop</div>
      
      {/* User Info */}
      {user && (
        <div className="mb-6 p-3 bg-white rounded-lg shadow-sm">
          <div className="flex items-center space-x-3">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="Profile" 
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {user.email?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.displayName || user.email}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      {navItem('/dashboard', 'Homepage')}
      {navItem('/settings', 'Settings')}
      
      {/* Logout Button */}
      <div className="mt-8">
        <button 
          onClick={handleLogout}
          className="w-full bg-accent text-white py-2 rounded hover:bg-pink-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}