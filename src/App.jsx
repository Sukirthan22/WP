// App.jsx — the route table: which URL shows which page.
//
// <Routes> looks at the current URL and renders the FIRST <Route> whose path matches.
// Nested routes (inside the Layout route) render inside Layout's <Outlet />, so they all
// share the same header + nav bar without repeating it on every page.

import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Watchlist from './pages/Watchlist.jsx';
import StockDetail from './pages/StockDetail.jsx';
import Portfolio from './pages/Portfolio.jsx';
import History from './pages/History.jsx';
import Settings from './pages/Settings.jsx';

export default function App() {
  return (
    <Routes>
      {/* Onboarding is full-screen, so it sits OUTSIDE the Layout (no nav bar). */}
      <Route path="/onboarding" element={<Onboarding />} />

      {/* Every route inside here gets the header + nav from <Layout>. */}
      <Route element={<Layout />}>
        {/* "index" = the parent path itself ("/"). Send it to the watchlist. */}
        <Route index element={<Navigate to="/watchlist" replace />} />
        <Route path="/watchlist" element={<Watchlist />} />
        {/* ":symbol" is a URL parameter. /stock/TCS → symbol = "TCS" (read with useParams). */}
        <Route path="/stock/:symbol" element={<StockDetail />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* "*" matches anything else (typos, old links) → go to the watchlist. */}
      <Route path="*" element={<Navigate to="/watchlist" replace />} />
    </Routes>
  );
}
