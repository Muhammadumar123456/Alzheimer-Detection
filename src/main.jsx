import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Ensure a root element exists in case index.html is missing it (helps surface mount errors)
const rootId = 'root';
let rootEl = document.getElementById(rootId);
if (!rootEl) {
  rootEl = document.createElement('div');
  rootEl.id = rootId;
  // Insert at the top so styles / layout behave predictably
  document.body.insertBefore(rootEl, document.body.firstChild);
  // visible debug hint during development
  rootEl.style.minHeight = '100vh';
}

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
