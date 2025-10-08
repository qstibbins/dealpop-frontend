import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const { pathname } = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const navItem = (to: string, label: string) => (
    <Link
      to={to}
      className={`block px-4 py-2 rounded hover:bg-blue-500 ${pathname === to ? 'bg-blue-500 text-white font-semibold' : 'text-white'}`}
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
    <aside 
      className="w-56 min-h-screen text-sm border-r"
      style={{ color: 'white' }}
    >
      {/* White background logo section */}
      <div className="bg-white p-4 mb-0">
        <img 
          src="/img/DealPop_Horizontal_logo.png" 
          alt="DealPop" 
          className="w-full h-auto"
        />
      </div>
      
      {/* Blue background navigation section */}
      <div className="p-4 min-h-full" style={{ backgroundColor: '#2563eb' }}>
        {/* Navigation */}
        {navItem('/dashboard', 'Homepage')}
        {navItem('/settings', 'Settings')}
        
        {/* Logout Button */}
        <div className="mt-8">
          <button 
            onClick={handleLogout}
            className="w-full bg-white text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}