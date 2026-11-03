// Settings.jsx — account info + "Reset account".
//
// Reset is destructive, so it takes TWO clicks: the first one only reveals a confirm box.
// `confirming` is a boolean state that decides which buttons we show (conditional rendering).

import { useState } from 'react';
import { useAccount } from '../context/AccountContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { STARTING_CASH } from '../utils/portfolio.js';
import { formatINR } from '../utils/format.js';
import { applyTheme, getSavedTheme } from '../utils/theme.js';
import usePageTitle from '../hooks/usePageTitle.js';
import './Settings.css';

const THEMES = [
  ['dark', 'Dark'],
  ['light', 'Light'],
];

// Format a timestamp as an Indian-style date: 31 Oct 2026
const dateFormatter = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function Settings() {
  const { account, resetAccount } = useAccount();
  const showToast = useToast();
  const [confirming, setConfirming] = useState(false);
  // Lazy initial state: the function runs once, reading the theme saved in localStorage.
  const [theme, setTheme] = useState(getSavedTheme);
  usePageTitle('Settings');

  function changeTheme(next) {
    setTheme(next); // update the buttons
    applyTheme(next); // update the page + save it
  }

  const holdingsCount = Object.keys(account.holdings).length; // Object.keys → array of symbols

  function handleReset() {
    resetAccount();
    // After reset, account.user is null → Layout's route guard sends us to onboarding.
    showToast({ type: 'success', title: 'Account reset', message: `Start again with ${formatINR(STARTING_CASH)}.` });
  }

  return (
    <div className="page settings">
      <h2 className="page-title">Account <em>Settings</em></h2>

      <section className="card">
        <h4>Profile</h4>
        <dl className="settings-list">
          <div>
            <dt className="muted">Name</dt>
            <dd>{account.user?.name}</dd>
          </div>
          <div>
            <dt className="muted">Trading since</dt>
            <dd>{account.user ? dateFormatter.format(account.user.joinedAt) : '—'}</dd>
          </div>
          <div>
            <dt className="muted">Cash</dt>
            <dd className="num">{formatINR(account.cash)}</dd>
          </div>
          <div>
            <dt className="muted">Stocks held · Trades</dt>
            <dd className="num">{holdingsCount} · {account.trades.length}</dd>
          </div>
        </dl>
      </section>

      <section className="card settings-row">
        <div>
          <h4>Appearance</h4>
          <p className="muted small">Dark is the default. Your choice is saved on this device.</p>
        </div>
        <div className="seg-tabs" role="tablist" aria-label="Theme">
          {THEMES.map(([value, label]) => (
            <button
              key={value}
              role="tab"
              aria-selected={theme === value}
              className={'seg-tab' + (theme === value ? ' active' : '')}
              onClick={() => changeTheme(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="card settings-danger">
        <h4>Reset account</h4>
        <p className="muted">
          Deletes your trades and holdings and starts again with {formatINR(STARTING_CASH)}. This can&apos;t be undone.
        </p>

        {confirming ? (
          <div className="settings-confirm">
            <p className="small">Are you sure? Everything will be erased.</p>
            <div className="settings-actions">
              <button className="btn btn-sell" onClick={handleReset}>Yes, reset</button>
              <button className="btn btn-ghost" onClick={() => setConfirming(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <button className="btn btn-danger-outline" onClick={() => setConfirming(true)}>
            Reset account
          </button>
        )}
      </section>
    </div>
  );
}
