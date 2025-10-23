import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: JSX.Element;
  fallback?: JSX.Element;
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Check if we're on /beta route and show login with current URL params preserved
    const currentPath = window.location.pathname;
    if (currentPath === '/beta') {
      // Preserve URL parameters (like ?extension=true) when showing login
      return fallback || <Navigate to={`/beta/login${window.location.search}`} />;
    }
    return fallback || <Navigate to="/beta/login" />;
  }

  return children;
}