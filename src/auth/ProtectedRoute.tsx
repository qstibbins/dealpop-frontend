import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';

const enableAuth = import.meta.env.VITE_ENABLE_AUTH === 'true';

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  if (!enableAuth) return children;

  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return children;
}