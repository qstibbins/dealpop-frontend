import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AlertProvider } from './contexts/AlertContext';
import ProtectedRoute from './auth/ProtectedRoute';
import Sidebar from './layout/Sidebar';
import Dashboard from './views/Dashboard';
import Login from './views/Login';
import LandingPage from './views/LandingPage';
import PrivacyPolicy from './views/PrivacyPolicy';
import Settings from './views/Settings';
import './styles/theme.css'

function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <Routes>
          {/* Landing page at root - no layout wrapper */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Beta routes - specific routes first */}
          <Route path="/beta/login" element={<Login />} />
          <Route path="/beta/dashboard" element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <Dashboard />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/beta/settings" element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <Settings />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/beta/privacy" element={<PrivacyPolicy />} />
          
          {/* General beta route - should come last */}
          <Route path="/beta" element={<Navigate to="/beta/login" replace />} />
          
        </Routes>
      </AlertProvider>
    </AuthProvider>
  )
}

export default App