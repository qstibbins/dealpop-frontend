// Test change for GitHub Pages deployment
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './styles/theme.css';
import './styles/globals.css';
import { BrowserRouter } from 'react-router-dom';

// Determine basename based on current path
const getBasename = () => {
  // Always use root basename - routes are defined with full paths
  return '/'
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={getBasename()}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
); 