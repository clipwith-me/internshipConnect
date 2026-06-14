import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Apply saved theme before first render to avoid flash
;(function applyTheme() {
  try {
    const prefs = JSON.parse(localStorage.getItem('ic_preferences') || '{}');
    const theme = prefs.theme || 'light';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'auto') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      }
    }
  } catch {}
})();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
