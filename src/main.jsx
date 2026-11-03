// main.jsx — the entry point. index.html loads this file first.
// Its only job: find <div id="root"> and tell React to draw <App /> inside it.

// Importing a .css file in JS is a Vite feature: Vite puts the CSS into the page for us.
// ORDER MATTERS — these must come BEFORE App: CSS files land in the page in import order,
// and when two rules are equally specific, the LATER one wins. Global first means each
// page's own CSS (imported inside App's components) can override the global defaults.
import './styles/tokens.css';
import './styles/global.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { MarketProvider } from './context/MarketContext.jsx';
import { AccountProvider } from './context/AccountContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { applyTheme, getSavedTheme } from './utils/theme.js';

// Set the saved theme BEFORE React draws anything, so there's no flash of the wrong colours.
applyTheme(getSavedTheme());

createRoot(document.getElementById('root')).render(
  // StrictMode (development only) mounts components twice on purpose to catch bugs —
  // e.g. a setInterval you forgot to clean up would show up as two timers.
  <StrictMode>
    {/* BrowserRouter watches the URL bar so <Routes> can show the right page. */}
    <BrowserRouter>
      {/* Providers wrap the whole app, so every page can use them:
          live prices, the user's account, and toast notifications. */}
      <MarketProvider>
        <AccountProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AccountProvider>
      </MarketProvider>
    </BrowserRouter>
  </StrictMode>
);
