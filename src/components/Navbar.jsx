// Navbar.jsx — logo + tabs (Watchlist / Portfolio / History) + settings button.
//
// <NavLink> is like <a href>, but:
//  1. It changes the page WITHOUT reloading (React Router swaps the component).
//  2. It knows if its link is the current page, and gives us `isActive` so we can
//     highlight the active tab.

import { NavLink, Link } from 'react-router-dom';
import { WatchlistIcon, PortfolioIcon, HistoryIcon, SettingsIcon } from './Icons.jsx';
import Logo from './Logo.jsx';
import { useAccount } from '../context/AccountContext.jsx';
import { formatINR } from '../utils/format.js';
import './Navbar.css';

// The tabs are DATA, and we draw them with .map() below.
// Adding a tab later = adding one line here, not copy-pasting JSX.
const TABS = [
  { to: '/watchlist', label: 'Watchlist', Icon: WatchlistIcon },
  { to: '/portfolio', label: 'Portfolio', Icon: PortfolioIcon },
  { to: '/history', label: 'History', Icon: HistoryIcon },
];

export default function Navbar() {
  const { account } = useAccount();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/watchlist" className="navbar-logo" aria-label="PaperTrade home">
          <Logo />
        </Link>

        <nav className="navbar-tabs" aria-label="Main">
          {TABS.map(({ to, label, Icon }) => (
            // `key` helps React track list items between renders. It must be unique.
            <NavLink
              key={to}
              to={to}
              // className can be a FUNCTION: React Router calls it with { isActive }.
              className={({ isActive }) => 'navbar-tab' + (isActive ? ' active' : '')}
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Cash chip: always shows your spendable cash. title = tooltip on hover. */}
        <div className="navbar-cash" title={`Hi ${account.user?.name ?? ''} — your available cash`}>
          <span className="muted small">Cash</span>
          <span className="num">{formatINR(account.cash)}</span>
        </div>

        <NavLink
          to="/settings"
          className={({ isActive }) => 'navbar-settings' + (isActive ? ' active' : '')}
          aria-label="Settings"
          title="Settings"
        >
          <SettingsIcon />
        </NavLink>
      </div>
    </header>
  );
}
