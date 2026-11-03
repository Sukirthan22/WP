// Onboarding.jsx — first screen: ask the user's name, then start with ₹1,00,000.
//
// This shows a CONTROLLED INPUT, the standard React way to handle forms:
//   - The input's text lives in React state (`name`).
//   - value={name} makes the input SHOW the state.
//   - onChange updates the state on every keystroke.
// So React state is the "single source of truth" for what's typed.
//
// On submit, onboard(name) creates the account with ₹1,00,000. AccountContext saves it
// to localStorage, so after a refresh you go straight to the app.

import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAccount } from '../context/AccountContext.jsx';
import { STARTING_CASH } from '../utils/portfolio.js';
import Logo from '../components/Logo.jsx';
import { formatINR } from '../utils/format.js';
import usePageTitle from '../hooks/usePageTitle.js';
import './Onboarding.css';

// The points of the decorative chart line, as "x,y" pairs inside a 300×80 box.
// SVG's y-axis points DOWN, so smaller y = higher on screen = "price went up".
const LINE_POINTS = '0,70 30,62 55,66 80,50 105,55 130,40 155,44 180,30 205,34 230,20 255,24 280,10 300,6';

export default function Onboarding() {
  // useState returns [currentValue, setterFunction]. Calling the setter re-renders the component.
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // lets us change page from code (not just from a link click)
  const { account, onboard } = useAccount();
  usePageTitle('Welcome');

  // Already onboarded? Skip this screen. (Hooks above must still run first — React requires
  // hooks to be called in the same order on every render, so early returns go AFTER them.)
  if (account.user) {
    return <Navigate to="/watchlist" replace />;
  }

  function handleSubmit(event) {
    // A <form> submit normally RELOADS the page. preventDefault() stops that,
    // so we can handle it in JavaScript instead.
    event.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter your name to continue.');
      return;
    }
    onboard(trimmed);
    navigate('/watchlist');
  }

  return (
    <div className="onboarding">
      {/* Using a real <form> means pressing Enter in the input also submits. */}
      <form className="onboarding-card card fade-up" onSubmit={handleSubmit}>
        <div className="onboarding-logo">
          <Logo size="lg" />
        </div>

        <h1 className="onboarding-title">
          Welcome to <em>PaperTrade</em>
        </h1>
        <p className="muted onboarding-sub">
          Practice trading with {formatINR(STARTING_CASH)} virtual cash. Learn. Experiment. Get better.
        </p>

        {/* htmlFor links the label to the input's id: clicking the label focuses the input. */}
        <label className="label" htmlFor="name">What&apos;s your name?</label>
        <input
          id="name"
          className={'input' + (error ? ' has-error' : '')}
          placeholder="e.g. Arjun"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(''); // clear the error as soon as they start typing
          }}
          maxLength={30}
          autoComplete="given-name"
          autoFocus
        />
        {/* role="alert" makes screen readers announce the error immediately. */}
        {error && <p className="onboarding-error small" role="alert">{error}</p>}

        <button type="submit" className="btn btn-primary btn-block onboarding-btn">
          Let&apos;s Start <span className="btn-arrow">→</span>
        </button>

        {/* Decorative chart: a gradient-filled area + a line that "draws itself" (see Onboarding.css). */}
        <svg className="onboarding-chart" viewBox="0 0 300 80" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            {/* A vertical gradient: orange at the top fading to transparent at the bottom. */}
            <linearGradient id="onboarding-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* The area = the line's points + the two bottom corners, closing the shape. */}
          <polygon className="onboarding-area" points={`${LINE_POINTS} 300,80 0,80`} fill="url(#onboarding-fill)" />
          {/* pathLength="1" pretends the line is 1 unit long, which makes the draw animation easy. */}
          <polyline
            className="onboarding-line"
            points={LINE_POINTS}
            pathLength="1"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
          />
        </svg>

        <div className="onboarding-cash">
          <span className="num">{formatINR(STARTING_CASH)}</span>
          <span className="muted small">Virtual Cash</span>
        </div>
      </form>
    </div>
  );
}
