import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from "@react-oauth/google";

  

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider 
  clientId="760811341738-u6m5d6l0blicen6n13br0puoeasge5ns.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>,
)
