import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Helmet } from 'react-helmet';

createRoot(document.getElementById('root')).render(
  <StrictMode>

    <App />

  </StrictMode>,
)
