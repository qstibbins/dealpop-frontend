import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AlertProvider } from './contexts/AlertContext';
import ProtectedRoute from './auth/ProtectedRoute';
import Sidebar from './layout/Sidebar';
import Dashboard from './views/Dashboard';
import ProductDetail from './views/ProductDetail';
// import Login from './views/Login';
import LoginV2 from './views/LoginV2';
import ABTestLogin from './components/ABTestLogin';
import ABTestDashboard from './components/ABTestDashboard';
import Settings from './views/Settings';
import './styles/theme.css'

function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <div className="flex">
          <Routes>
            <Route path="/login" element={<ABTestLogin />} />
            <Route path="/login-v2" element={<LoginV2 />} />
            <Route path="/ab-test-analytics" element={<ABTestDashboard />} />
            <Route path="/" element={
              <ProtectedRoute>
                <>
                  <Sidebar />
                  <Dashboard />
                </>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <>
                  <Sidebar />
                  <Dashboard />
                </>
              </ProtectedRoute>
            } />
            <Route path="/product/:id" element={
              <ProtectedRoute>
                <>
                  <Sidebar />
                  <ProductDetail />
                </>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <>
                  <Sidebar />
                  <Settings />
                </>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </AlertProvider>
    </AuthProvider>
  )
}

export default App 