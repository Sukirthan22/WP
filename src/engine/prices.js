// prices.js — the fake stock market.
//
// HOW IT WORKS (random walk):
//   Every 2 seconds, each stock's price is multiplied by (1 + a small random %).
//   The % is between -0.8% and +0.8%. Each step only depends on the previous price,
//   like someone taking random steps left/right — hence "random walk".
//   Real prices aren't truly random, but for practice this looks and feels realistic.
//
// DESIGN RULE: everything in this file is a PURE FUNCTION (same input → same output,
// no side effects), EXCEPT where we explicitly pass in `random` (defaults to Math.random).
// Why? The reducer that stores prices must be pure, so the randomness is generated
// OUTSIDE the reducer (in the timer) and passed in as data. See MarketContext.jsx.

import { round2 } from '../utils/math.js';

export const TICK_MS = 2000;       // one price update every 2 seconds
export const MAX_MOVE = 0.008;      // max ±0.8% move per tick
export const HISTORY_LENGTH = 100;  // keep the last 100 prices per stock (for charts)
export const MIN_PRICE = 1;         // a price can never go below ₹1

// The 10 fictional NSE-style stocks.
// symbol = ticker (like on NSE), startPrice = price on first ever launch,
// hue = colour of its avatar circle (0–360 on the colour wheel).
export const STOCKS = [
  { symbol: 'ARYAPWR', name: 'Arya Power Grid Ltd', sector: 'Power', startPrice: 412.35, hue: 45 },
  { symbol: 'BHARATSTL', name: 'Bharat Steelworks Ltd', sector: 'Metals', startPrice: 1186.5, hue: 210 },
  { symbol: 'DECCANFIN', name: 'Deccan Finance Ltd', sector: 'Financials', startPrice: 2856.4, hue: 145 },
  { symbol: 'GANGATEX', name: 'Ganga Textiles Ltd', sector: 'Textiles', startPrice: 48.6, hue: 280 },
  { symbol: 'INDUSTEK', name: 'Industek Software Ltd', sector: 'IT', startPrice: 3702.15, hue: 195 },
  { symbol: 'KAVERIPH', name: 'Kaveri Pharma Ltd', sector: 'Pharma', startPrice: 1501.3, hue: 0 },
  { symbol: 'MAHAAUTO', name: 'Maha Auto Motors Ltd', sector: 'Auto', startPrice: 942.6, hue: 25 },
  { symbol: 'NILGIRICON', name: 'Nilgiri Consumer Ltd', sector: 'FMCG', startPrice: 2245.0, hue: 330 },
  { symbol: 'SAHYADRI', name: 'Sahyadri Cement Ltd', sector: 'Cement', startPrice: 786.5, hue: 90 },
  { symbol: 'VAYUAIR', name: 'Vayu Airlines Ltd', sector: 'Aviation', startPrice: 1632.75, hue: 260 },
];

export const SYMBOLS = STOCKS.map((s) => s.symbol);

// Apply a % move to a price. pct is a fraction: 0.005 means +0.5%.
// Math.max(MIN_PRICE, …) enforces the "never below ₹1" rule.
export function nextPrice(price, pct) {
  return Math.max(MIN_PRICE, round2(price * (1 + pct)));
}

// One random move between -MAX_MOVE and +MAX_MOVE.
// random() gives 0..1 → ×2 gives 0..2 → −1 gives −1..1 → ×0.008 gives −0.008..0.008.
export function randomMove(random = Math.random) {
  return (random() * 2 - 1) * MAX_MOVE;
}

// Make one random move for every symbol: { ARYAPWR: 0.0031, BHARATSTL: -0.0072, ... }
export function generateMoves(symbols, random = Math.random) {
  const moves = {};
  for (const symbol of symbols) {
    moves[symbol] = randomMove(random);
  }
  return moves;
}

// Charts look empty with 1 point, so on startup we invent some "past" prices.
// We walk BACKWARDS from today's price (divide instead of multiply), then reverse
// the list so it ends exactly at the current price.
export function seedHistory(endPrice, count, random = Math.random) {
  const points = [endPrice];
  let price = endPrice;
  for (let i = 1; i < count; i++) {
    price = Math.max(MIN_PRICE, round2(price / (1 + randomMove(random))));
    points.push(price);
  }
  return points.reverse();
}

// Build the starting market state.
// savedPrices = last prices from localStorage, e.g. { ARYAPWR: 415.2 }.
// If a saved price is missing or invalid, fall back to the stock's startPrice.
// sessionOpen = the price when THIS session started. "Change %" is measured from it.
export function createMarket(savedPrices = {}) {
  const stocks = {};
  for (const info of STOCKS) {
    const saved = savedPrices[info.symbol];
    const price = typeof saved === 'number' && saved >= MIN_PRICE ? saved : info.startPrice;
    stocks[info.symbol] = {
      ...info, // spread: copy symbol, name, sector, startPrice, hue
      price,
      prevPrice: price, // price one tick ago (tells us if this tick went up or down)
      sessionOpen: price,
      history: seedHistory(price, 40),
    };
  }
  return { tick: 0, stocks };
}

// Produce the NEXT market state from the current one + the random moves.
// It never changes `market` — it builds new objects/arrays (immutability).
// React only notices a change when it gets a NEW object, so this is required.
export function applyMoves(market, moves) {
  const stocks = {};
  for (const symbol in market.stocks) {
    const stock = market.stocks[symbol];
    const price = nextPrice(stock.price, moves[symbol] ?? 0); // ?? 0 → "no move given = no change"
    stocks[symbol] = {
      ...stock,
      prevPrice: stock.price,
      price,
      // add the new price at the end, then keep only the last 100
      history: [...stock.history, price].slice(-HISTORY_LENGTH),
    };
  }
  return { tick: market.tick + 1, stocks };
}

// Change since the session started, in ₹ and %.
// % change = (now − open) / open × 100
export function changeSinceOpen(stock) {
  const diff = stock.price - stock.sessionOpen;
  return {
    abs: round2(diff),
    pct: (diff / stock.sessionOpen) * 100,
  };
}
