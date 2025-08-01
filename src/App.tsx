import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import Sidebar from './layout/Sidebar';
import Dashboard from './views/Dashboard';
import ProductDetail from './views/ProductDetail';
import Login from './views/Login';
import Alerts from './views/Alerts';
import Settings from './views/Settings';
import './styles/theme.css'

function App() {
  return (
    <AuthProvider>
      <div className="flex">
        <Routes>
          <Route path="/login" element={<Login />} />
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
          <Route path="/alerts" element={
            <ProtectedRoute>
              <>
                <Sidebar />
                <Alerts />
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
    </AuthProvider>
  )
}

export default App 