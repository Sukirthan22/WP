// portfolio.js — ALL the money math for PaperTrade, as pure functions.
//
// Pure function = output depends ONLY on the inputs, and it changes nothing outside itself.
// That makes each one easy to test by hand: plug in numbers, check the answer.
//
// ─── Data shapes used below ──────────────────────────────────────────────
//   account  = { cash, holdings, trades, realisedPnl, user }
//   holdings = { ARYAPWR: { qty: 15, avgCost: 110 }, ... }   (one entry per stock you own)
//   order    = { id, time, symbol, side: 'BUY' | 'SELL', qty, price }
//   trade    = order + { total, realisedPnl (sells only) }  — saved in history
//
// ─── Key words ───────────────────────────────────────────────────────────
//   avg cost     = average price you paid per share (across all your buys)
//   invested     = qty × avg cost   → money currently tied up in the stock
//   current value= qty × LTP        (LTP = Last Traded Price = live price)
//   unrealised P&L = current value − invested   → profit "on paper", not locked in yet
//   realised P&L   = profit/loss LOCKED IN when you sell

import { round2 } from './math.js';
import { formatINR } from './format.js';

export const STARTING_CASH = 100000; // ₹1,00,000

// Value of an order: quantity × price, rounded to paise.
// orderValue(10, 412.35) → 4123.50
export function orderValue(qty, price) {
  return round2(qty * price);
}

/*
  WEIGHTED AVERAGE COST after a buy.

    new avg = (old qty × old avg  +  buy qty × buy price) / (old qty + buy qty)
              └── what you paid before ┘  └── what you pay now ┘     └── total shares ┘

  Example: you own 10 @ ₹100 and buy 5 more @ ₹130
    (10 × 100 + 5 × 130) / 15 = (1000 + 650) / 15 = 1650 / 15 = ₹110

  First buy works too: old qty = 0 → (0 + 5 × 130) / 5 = ₹130.

  We do NOT round avg cost here: 1650 / 14 = 117.857… and rounding it would make
  qty × avg ≠ what you actually paid. We only round when DISPLAYING it.
*/
export function averageCost(oldQty, oldAvg, buyQty, buyPrice) {
  const totalQty = oldQty + buyQty;
  return (oldQty * oldAvg + buyQty * buyPrice) / totalQty;
}

/*
  REALISED P&L on a sell.

    realised = (sell price − avg cost) × sell qty

  Example: avg cost ₹110, sell 6 @ ₹125 → (125 − 110) × 6 = ₹90 profit.
           sell 6 @ ₹100 instead      → (100 − 110) × 6 = −₹60 loss.

  Selling does NOT change avg cost of the shares you keep — you still paid ₹110 each for them.
*/
export function realisedPnlOnSell(avgCost, sellPrice, sellQty) {
  return round2((sellPrice - avgCost) * sellQty);
}

/*
  UNREALISED P&L of one holding at the live price (LTP).

    invested = qty × avg cost
    current  = qty × LTP
    P&L ₹    = current − invested
    P&L %    = P&L ₹ / invested × 100

  Example: 15 shares, avg ₹110, LTP ₹120
    invested 1650, current 1800, P&L +₹150, % = 150 / 1650 × 100 = +9.09%

  We round invested and current to paise FIRST, then subtract. That way the P&L you see is
  always exactly (Current value − Invested) as displayed — easy to check by hand.
*/
export function unrealisedPnl(holding, ltp) {
  const invested = round2(holding.qty * holding.avgCost);
  const current = round2(holding.qty * ltp);
  const abs = round2(current - invested);
  return {
    invested,
    current,
    abs,
    pct: invested === 0 ? 0 : (abs / invested) * 100, // guard against dividing by 0
  };
}

/*
  PORTFOLIO SUMMARY — everything the Portfolio page shows.
  `stocks` is the live market: { ARYAPWR: { price, ... }, ... }

    invested      = Σ invested of every holding     (Σ = "sum of")
    current value = Σ current value of every holding
    unrealised    = current value − invested
    realised      = running total of P&L locked in by sells (stored on the account)
    total P&L     = unrealised + realised
    total P&L %   = total P&L / starting cash (₹1,00,000) × 100   → return on your money
    net worth     = cash + current value

  Sanity check you can do by hand: net worth − ₹1,00,000 ≈ total P&L
  (can differ by a paisa or two because each step is rounded to paise).
*/
export function portfolioSummary(account, stocks) {
  // Object.entries turns { ARYAPWR: {...} } into [['ARYAPWR', {...}], ...] so we can .map it.
  const rows = Object.entries(account.holdings).map(([symbol, holding]) => {
    const ltp = stocks[symbol]?.price ?? holding.avgCost; // fallback if a price is missing
    return { symbol, qty: holding.qty, avgCost: holding.avgCost, ltp, ...unrealisedPnl(holding, ltp) };
  });

  // Biggest position first.
  rows.sort((a, b) => b.current - a.current);

  // .reduce adds up one field across all rows, starting from 0.
  const invested = round2(rows.reduce((sum, r) => sum + r.invested, 0));
  const current = round2(rows.reduce((sum, r) => sum + r.current, 0));
  const unrealised = round2(current - invested);
  const realised = account.realisedPnl;
  const totalPnl = round2(unrealised + realised);

  return {
    rows,
    cash: account.cash,
    invested,
    current,
    unrealised,
    unrealisedPct: invested === 0 ? 0 : (unrealised / invested) * 100,
    realised,
    totalPnl,
    totalPnlPct: (totalPnl / STARTING_CASH) * 100,
    netWorth: round2(account.cash + current),
  };
}

/*
  ORDER RULES. Returns an error message (string) if the order must be REJECTED,
  or null if it's fine.
    - quantity must be a whole number ≥ 1
    - BUY:  cost must not be more than your cash
    - SELL: quantity must not be more than the shares you own (no short selling)
*/
export function validateOrder(account, order) {
  const { side, symbol, qty, price } = order;

  if (!Number.isInteger(qty) || qty < 1) {
    return 'Quantity must be a whole number of at least 1.';
  }

  if (side === 'BUY') {
    const cost = orderValue(qty, price);
    if (cost > account.cash) {
      return `Insufficient balance: need ${formatINR(cost)}, you have ${formatINR(account.cash)}.`;
    }
    return null;
  }

  if (side === 'SELL') {
    // ?. (optional chaining) → undefined instead of crashing if you don't own this stock.
    // ?? 0 → use 0 when the left side is undefined/null.
    const owned = account.holdings[symbol]?.qty ?? 0;
    if (qty > owned) {
      return owned === 0
        ? `You don't own any ${symbol} shares to sell.`
        : `You only own ${owned} ${symbol} shares.`;
    }
    return null;
  }

  return 'Unknown order side.';
}

/*
  EXECUTE a (valid) order → returns the NEW account. Never modifies the old one.

  BUY:  cash ↓ by qty × price, qty ↑, avg cost recalculated (weighted average)
  SELL: cash ↑ by qty × price, qty ↓, avg cost unchanged, realised P&L recorded.
        If qty hits 0 the holding is removed.
  Every order is added to the FRONT of trades, so history is newest-first.
*/
export function executeOrder(account, order) {
  const { id, time, symbol, side, qty, price } = order;
  const total = orderValue(qty, price);
  const holding = account.holdings[symbol]; // undefined if we don't own it yet
  const holdings = { ...account.holdings }; // copy, so we never touch the old object

  let cash;
  let realised = 0;

  if (side === 'BUY') {
    const oldQty = holding?.qty ?? 0;
    const oldAvg = holding?.avgCost ?? 0;
    holdings[symbol] = {
      qty: oldQty + qty,
      avgCost: averageCost(oldQty, oldAvg, qty, price),
    };
    cash = round2(account.cash - total);
  } else {
    realised = realisedPnlOnSell(holding.avgCost, price, qty);
    const remaining = holding.qty - qty;
    if (remaining === 0) {
      delete holdings[symbol]; // safe: `holdings` is our copy
    } else {
      holdings[symbol] = { ...holding, qty: remaining };
    }
    cash = round2(account.cash + total);
  }

  const trade = { id, time, symbol, side, qty, price, total };
  if (side === 'SELL') trade.realisedPnl = realised;

  return {
    ...account,
    cash,
    holdings,
    realisedPnl: round2(account.realisedPnl + realised),
    trades: [trade, ...account.trades],
  };
}
