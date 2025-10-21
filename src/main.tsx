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
  // If we're running locally in dev mode, no basename
  if (import.meta.env.DEV) {
    return '/'
  }
  
  // If we're in production and the URL contains /beta/, use /beta
  if (window.location.pathname.startsWith('/beta')) {
    return '/beta'
  }
  
  // Otherwise, use root
  return '/'
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={getBasename()}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
); 