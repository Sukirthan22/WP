// Layout.jsx — the frame shared by every logged-in page: nav bar on top, page below.
//
// <Outlet /> is a React Router placeholder: "draw the matched child route here".
// So /portfolio renders <Layout> with <Portfolio /> where the Outlet is.

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAccount } from '../context/AccountContext.jsx';
import Navbar from './Navbar.jsx';
import './Layout.css';

export default function Layout() {
  // useLocation gives the current URL. We only need its path, e.g. "/portfolio".
  const location = useLocation();
  const { account } = useAccount();

  // ROUTE GUARD: no account yet → send them to onboarding first.
  // Because every app page is nested inside Layout, this one check protects all of them.
  // `replace` swaps the history entry, so Back doesn't bounce them into the guard again.
  if (!account.user) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="layout">
      <Navbar />
      {/* <main> is the semantic HTML tag for the page's main content (helps screen readers). */}
      <main className="layout-main">
        {/*
          Page-change animation trick:
          `key` normally identifies list items, but changing a component's key makes React
          throw the old element away and mount a NEW one. New element → the CSS fade-up
          animation plays again. So every time the path changes, the page fades in.
        */}
        <div key={location.pathname} className="fade-up">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
