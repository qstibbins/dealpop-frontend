import ProductCard from './components/ProductCard'
import Sidebar from './layout/Sidebar';
import Dashboard from './views/Dashboard';
import ProductDetail from './views/ProductDetail';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/theme.css'

function App() {
  const sampleProducts = [
    {
      id: 1,
      imageUrl: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Product+1',
      title: 'Wireless Bluetooth Headphones',
      price: '89.99',
      vendor: 'TechCorp',
      targetPrice: '79.99',
      expiresIn: '3 days'
    },
    {
      id: 2,
      imageUrl: 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Product+2',
      title: 'Smart Fitness Watch',
      price: '199.99',
      vendor: 'FitTech',
      targetPrice: '179.99',
      expiresIn: '1 week'
    },
    {
      id: 3,
      imageUrl: 'https://via.placeholder.com/300x200/45B7D1/FFFFFF?text=Product+3',
      title: 'Portable Power Bank',
      price: '29.99',
      vendor: 'PowerPlus',
      expiresIn: '5 days'
    }
  ]

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
    // <div className="min-h-screen bg-bg font-sans">
    //   <div className="container mx-auto px-4 py-8">
    //     <header className="text-center mb-12">
    //       <h1 className="text-4xl font-bold text-accent mb-4">DealPop</h1>
    //       <p className="text-grayText text-lg">Find the best deals on your favorite products</p>
    //     </header>
        
    //     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    //       {sampleProducts.map((product) => (
    //         <ProductCard
    //           key={product.id}
    //           imageUrl={product.imageUrl}
    //           title={product.title}
    //           price={product.price}
    //           vendor={product.vendor}
    //           targetPrice={product.targetPrice}
    //           expiresIn={product.expiresIn}
    //         />
    //       ))}
    //     </div>
    //   </div>
    // </div>
  )
}

export default App 