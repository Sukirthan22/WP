// MarketContext.jsx — holds live prices and shares them with every page.
//
// THE PROBLEM: Watchlist, Stock Detail and Portfolio all need the same live prices.
// Passing them down as props through every component ("prop drilling") gets messy.
//
// THE FIX — React Context:
//   1. createContext()      → makes a "channel".
//   2. <Provider value={…}> → puts data into the channel, high up in the tree (main.jsx).
//   3. useContext()         → any component below can read it directly.
//
// useReducer instead of useState: all state changes go through ONE function (the reducer)
// via "actions" like { type: 'TICK' }. Easier to reason about as state grows.

import { createContext, useContext, useEffect, useReducer } from 'react';
import { applyMoves, createMarket, generateMoves, SYMBOLS, TICK_MS } from '../engine/prices.js';
import { loadState, saveState } from '../utils/storage.js';

const MarketContext = createContext(null);

// The reducer: (currentState, action) → newState.
// It MUST be pure: no Math.random, no timers, no localStorage in here.
// (In development, StrictMode calls reducers twice to catch impure ones.)
// That's why the random moves arrive inside the action instead of being made here.
function marketReducer(state, action) {
  switch (action.type) {
    case 'TICK':
      return applyMoves(state, action.moves);
    default:
      return state; // unknown action → change nothing
  }
}

// Lazy initial state: React calls this ONCE on first render (not on every render).
// It restores the last prices from localStorage so your portfolio value doesn't
// jump back to the starting prices after a refresh.
function initMarket() {
  return createMarket(loadState('prices', {}));
}

export function MarketProvider({ children }) {
  const [market, dispatch] = useReducer(marketReducer, undefined, initMarket);

  // The price clock.
  // useEffect with [] runs once after the first render ("on mount").
  // The function we RETURN is the cleanup: React runs it on unmount.
  // Without clearInterval, the timer would keep running forever (a memory leak), and in
  // StrictMode you'd get TWO timers → prices ticking twice every 2 seconds.
  useEffect(() => {
    const id = setInterval(() => {
      dispatch({ type: 'TICK', moves: generateMoves(SYMBOLS) });
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  // Save only the latest price of each stock whenever the market changes.
  // [market] = "run this effect again whenever `market` changes".
  useEffect(() => {
    const prices = {};
    for (const symbol in market.stocks) {
      prices[symbol] = market.stocks[symbol].price;
    }
    saveState('prices', prices);
  }, [market]);

  return <MarketContext.Provider value={market}>{children}</MarketContext.Provider>;
}

// A custom hook: components write useMarket() instead of useContext(MarketContext).
// The error makes it obvious if someone forgets to wrap the app in <MarketProvider>.
export function useMarket() {
  const market = useContext(MarketContext);
  if (!market) throw new Error('useMarket must be used inside <MarketProvider>');
  return market;
}
