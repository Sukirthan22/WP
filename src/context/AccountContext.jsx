// AccountContext.jsx — the user's account: name, cash, holdings, trades.
//
// Same pattern as MarketContext: Context (to share) + useReducer (to change state through actions).
// Actions:
//   ONBOARD        → create the account with ₹1,00,000
//   EXECUTE_ORDER  → apply a buy/sell (math lives in utils/portfolio.js)
//   RESET          → wipe everything, back to onboarding

import { createContext, useContext, useEffect, useReducer } from 'react';
import { STARTING_CASH, executeOrder, validateOrder } from '../utils/portfolio.js';
import { loadState, saveState } from '../utils/storage.js';

const AccountContext = createContext(null);

// A brand-new, empty account. A function (not a constant object) so every call
// returns a FRESH object — no accidental sharing between resets.
function emptyAccount() {
  return {
    user: null, // null = not onboarded yet
    cash: STARTING_CASH,
    holdings: {},
    trades: [],
    realisedPnl: 0,
  };
}

// Pure reducer: (state, action) → new state. All the maths is delegated to portfolio.js.
function accountReducer(state, action) {
  switch (action.type) {
    case 'ONBOARD':
      return { ...emptyAccount(), user: { name: action.name, joinedAt: action.time } };

    case 'EXECUTE_ORDER':
      // Double-check the rules here too: the reducer is the last line of defence,
      // so an invalid order can NEVER change the account, wherever it came from.
      if (validateOrder(state, action.order)) return state;
      return executeOrder(state, action.order);

    case 'RESET':
      return emptyAccount();

    default:
      return state;
  }
}

// Load the saved account once at startup. If nothing is saved, or it looks broken
// (e.g. someone edited localStorage by hand), start fresh instead of crashing.
function initAccount() {
  const saved = loadState('account', null);
  if (!saved || typeof saved.cash !== 'number' || typeof saved.holdings !== 'object') {
    return emptyAccount();
  }
  return { ...emptyAccount(), ...saved }; // defaults first, saved values overwrite them
}

// Simple unique id for each trade: time + random letters, e.g. "lq3k9x-4f8a2".
function makeId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
}

export function AccountProvider({ children }) {
  const [account, dispatch] = useReducer(accountReducer, undefined, initAccount);

  // PERSISTENCE: whenever the account changes, save it. This one effect is the only place
  // the account is written; storage.js is the only file that talks to localStorage.
  useEffect(() => {
    saveState('account', account);
  }, [account]);

  // --- Functions the UI calls. They wrap dispatch so components don't build actions by hand. ---

  function onboard(name) {
    dispatch({ type: 'ONBOARD', name, time: Date.now() });
  }

  // Place a MARKET order: fills immediately at the price passed in (the live price).
  // Returns { ok: true, trade } or { ok: false, error } so the caller can show a toast.
  // id and time are made HERE (not in the reducer) because Date.now/Math.random are impure.
  function placeOrder({ symbol, side, qty, price }) {
    const order = { id: makeId(), time: Date.now(), symbol, side, qty, price };
    const error = validateOrder(account, order);
    if (error) return { ok: false, error };
    dispatch({ type: 'EXECUTE_ORDER', order });
    return { ok: true, order };
  }

  function resetAccount() {
    dispatch({ type: 'RESET' });
  }

  const value = { account, onboard, placeOrder, resetAccount };
  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error('useAccount must be used inside <AccountProvider>');
  return ctx;
}
