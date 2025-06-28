import { Routes, Route } from 'react-router-dom';
import Sidebar from './layout/Sidebar';
import Dashboard from './views/Dashboard';
import ProductDetail from './views/ProductDetail';
import Login from './views/Login';
import Alerts from './views/Alerts';
import Settings from './views/Settings';
import './styles/theme.css'

function App() {
  return (
    <div className="flex">
      <Sidebar />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  )
}

export default App 