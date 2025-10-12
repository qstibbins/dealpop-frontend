import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AlertProvider } from './contexts/AlertContext';
import ProtectedRoute from './auth/ProtectedRoute';
import Sidebar from './layout/Sidebar';
import Dashboard from './views/Dashboard';
import Login from './views/Login';
import Settings from './views/Settings';
import './styles/theme.css'

function App() {
  return (
    <AuthProvider>
      <AlertProvider>
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