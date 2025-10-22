import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AlertProvider } from './contexts/AlertContext';
import ProtectedRoute from './auth/ProtectedRoute';
import Sidebar from './layout/Sidebar';
import Dashboard from './views/Dashboard';
import Login from './views/Login';
import LandingPage from './views/LandingPage';
import Settings from './views/Settings';
import './styles/theme.css'

function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <Routes>
          {/* Landing page at root - no layout wrapper */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Beta routes - always show login page */}
          <Route path="/beta" element={<Login />} />
          
          {/* Other protected routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <Dashboard />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar />
                <Settings />
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </AlertProvider>
    </AuthProvider>
  )
}

export default App 