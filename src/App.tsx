import Sidebar from './layout/Sidebar';
import Dashboard from './views/Dashboard';
import ProductDetail from './views/ProductDetail';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/theme.css'

function App() {

  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App 