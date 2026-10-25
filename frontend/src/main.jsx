import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource-variable/inter'
import App from './App.jsx'
import './index.css'

// Apply saved theme before first render to avoid a flash of the wrong theme.
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
  } catch {
    // Storage can be unavailable (private mode, blocked cookies); default to light.
  }
})();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
