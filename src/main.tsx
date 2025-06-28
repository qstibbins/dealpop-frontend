import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './styles/theme.css';
import './styles/globals.css';
import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';


const enableAuth = import.meta.env.VITE_ENABLE_AUTH === 'true';

const Root = enableAuth ? (
  <Auth0Provider
    domain={import.meta.env.VITE_AUTH0_DOMAIN}
    clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
    authorizationParams={{
      redirect_uri: window.location.origin,
      audience: import.meta.env.VITE_AUTH0_API_IDENTIFIER
    }}
  >
    <BrowserRouter><App /></BrowserRouter>
  </Auth0Provider>
) : (
  <BrowserRouter><App /></BrowserRouter>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>{Root}</React.StrictMode>
);

// ReactDOM.createRoot(document.getElementById('root')!).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// ) 