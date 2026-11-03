# PaperTrade

A browser-based **paper-trading simulator** for Indian stocks. You start with **₹1,00,000 of virtual cash**, watch 10 fictional NSE-style stocks tick live, and buy and sell them to practise trading without any risk.

Built with **HTML, CSS, JavaScript and React only** (Vite + React, plain JavaScript). There is no backend and no database: everything is saved in the browser's `localStorage`.

---

## Setup

You need [Node.js](https://nodejs.org) 20.19 or newer (Vite 8 requires it; developed on Node 22).

```bash
npm install
```

```bash
npm run dev
```

Then open **http://localhost:5173**.

Other commands:

| Command           | What it does                                           |
| ----------------- | ------------------------------------------------------ |
| `npm run dev`     | Start the dev server with hot reload                   |
| `npm run build`   | Build an optimised production version into `dist/`     |
| `npm run preview` | Serve the production build locally to test it          |

**Dependencies:** `react`, `react-dom`, `react-router-dom`, plus `vite` and `@vitejs/plugin-react` for development. There are no UI or chart libraries. Charts are drawn by hand with SVG.

---

## Features

1. **Onboarding:** enter your name and get ₹1,00,000 virtual cash, saved to `localStorage`.
2. **Live price engine:** 10 fictional stocks move every 2 seconds using a random walk (max ±0.8% per tick, never below ₹1). The last 100 ticks are kept for each stock.
3. **Watchlist:** a live table with price, change since session start, ▲/▼ badges, gain/loss colours, a green/red flash on every tick, sparklines and search. Click a row (or press Enter) to open the stock.
4. **Stock Detail:**
   - A hand-drawn SVG line chart with 1m / 2m / All ranges, a hover crosshair and tooltip, a session-open line and a live price tag.
   - High, low and open stats.
   - Your position in the stock.
   - An order ticket with a Buy/Sell toggle, quantity stepper, **Max** button, estimated cost and confirm button.
5. **Order rules:** market orders only. A buy is rejected if you don't have enough cash, and a sell is rejected if you try to sell more shares than you own. Every order shows a toast: *Order filled* or *Order rejected*.
6. **Portfolio:**
   - Stat tiles for cash, invested, current value and total P&L, plus net worth.
   - A holdings table with qty, avg cost, LTP, invested, current value and unrealised P&L in ₹ and %, with a totals row.
   - Realised P&L is tracked on every sell.
7. **Trade History:** every trade, newest first (time, stock, side, qty, price, total, realised P&L), with All / Buy / Sell filters.
8. **Indian number format everywhere:** `en-IN`, ₹, 2 decimals (₹1,00,000.00).
9. **Settings:** profile, dark/light theme, and **Reset account** (needs two clicks to confirm).
10. **Responsive:** works down to 360px. On phones the nav moves to a bottom tab bar and wide tables turn into cards.
11. **Accessibility:** keyboard-focusable rows, focus rings, screen-reader labels, and support for the OS "reduce motion" setting.

---

## Project structure

```
src/
├── main.jsx              Entry point: global CSS, theme, providers, router
├── App.jsx               Route table (which URL shows which page)
├── engine/
│   └── prices.js         The price engine (random walk), pure functions
├── context/              Shared state: React Context + useReducer
│   ├── MarketContext.jsx   live prices + the 2-second setInterval
│   ├── AccountContext.jsx  cash, holdings, trades (+ saves to localStorage)
│   └── ToastContext.jsx    pop-up notifications
├── utils/
│   ├── portfolio.js      ALL money maths: avg cost, P&L, order rules (pure functions)
│   ├── storage.js        the ONLY file that reads or writes localStorage
│   ├── format.js         Indian number/date formatting (Intl, en-IN)
│   ├── math.js           round2(): round to paise
│   └── theme.js          dark/light switch
├── hooks/
│   └── usePageTitle.js   custom hook: sets the browser tab title
├── components/           Reusable pieces (Navbar, PriceChart, OrderTicket, Toast, …)
├── pages/                One file per screen (Onboarding, Watchlist, StockDetail, …)
└── styles/
    ├── tokens.css        Design tokens as CSS variables (colours, type, spacing)
    └── global.css        Base styles + shared classes (buttons, cards, tables)
```

Each component or page has its own `.css` file next to it, and every value comes from `tokens.css` variables.

---

## How the price engine works (`src/engine/prices.js`)

**Random walk.** Every 2 seconds (`TICK_MS = 2000`), each stock's price is multiplied by a small random percentage:

```
move     = (Math.random() × 2 − 1) × 0.008      → a number between −0.008 and +0.008 (±0.8%)
newPrice = max(₹1, round2(price × (1 + move)))
```

Each step depends only on the previous price, like random steps left or right. That's why it's called a *random walk*. `Math.max(1, …)` enforces the "never below ₹1" rule. `round2` keeps prices in whole paise.

**History.** Each new price is added to the end of the stock's history, and only the last 100 are kept: `[...history, price].slice(-100)`. On startup, 40 "past" prices are generated by walking *backwards* from the current price, so the charts aren't empty.

**Where the timer lives.** `MarketContext.jsx` starts a `setInterval` inside `useEffect` and **clears it in the cleanup function**, so there is never more than one timer, even in React StrictMode.

**Keeping the reducer pure.** The random moves are generated in the timer callback and *passed into* the reducer as data (`{ type: 'TICK', moves }`). The reducer itself (`applyMoves`) is a pure function: same input, same output, and it never modifies the old state.

**Persistence.** The latest price of each stock is saved, so after a refresh the market continues from where it was. *Change %* is measured from **session open**: the price when you opened the app.

---

## How the P&L maths works (`src/utils/portfolio.js`)

Each holding stores `{ qty, avgCost }`. LTP = Last Traded Price (the live price).

### Average cost (weighted average) on every buy

```
new avg = (old qty × old avg + buy qty × buy price) / (old qty + buy qty)
```

Example: you own 10 @ ₹100 and buy 5 @ ₹130 → (1000 + 650) / 15 = **₹110**.

Avg cost is stored **unrounded**, so qty × avg is always exactly what you paid. It is only rounded for display.

### Realised P&L on every sell

```
realised = (sell price − avg cost) × sell qty
```

Example: avg ₹110, sell 6 @ ₹125 → (125 − 110) × 6 = **+₹90**. Selling does **not** change the avg cost of the shares you keep. When qty reaches 0, the holding is removed.

### Unrealised P&L of each holding (updates every tick)

```
invested = qty × avg cost
current  = qty × LTP
P&L ₹    = current − invested
P&L %    = P&L ₹ / invested × 100
```

Example: 9 shares @ avg ₹110, LTP ₹120 → invested 990, current 1080, **+₹90 (+9.09%)**.

### Portfolio totals

```
invested    = Σ invested of all holdings
current     = Σ current value of all holdings
total P&L   = (current − invested) + realised
total P&L % = total P&L / ₹1,00,000 × 100
net worth   = cash + current value      (≈ ₹1,00,000 + total P&L)
```

### Order rules

The `validateOrder()` function returns an error message or `null`:

- Quantity must be a whole number ≥ 1.
- **Buy:** qty × price must not be more than your cash.
- **Sell:** qty must not be more than the shares you own.

The rules are checked twice: once before dispatching (to show the toast) and again inside the reducer, so an invalid order can never change the account.

---

## State and persistence

- **React Context + useReducer:**
  - `MarketContext` holds prices.
  - `AccountContext` holds the user, cash, holdings, trades and realised P&L.
  - Components read state with `useMarket()` / `useAccount()` and change it only by dispatching actions (`TICK`, `ONBOARD`, `EXECUTE_ORDER`, `RESET`).
- **localStorage in one place:**
  - `utils/storage.js` is the only file that touches `localStorage`. It uses JSON, `try/catch` and namespaced keys `papertrade:*`.
  - Each provider saves its state in a single `useEffect` whenever that state changes.
- **Route guard:** `Layout.jsx` sends you to `/onboarding` if no account exists. **Reset account** clears it and sends you back.

---

## Manual test checklist

1. Onboard. Your name and ₹1,00,000 appear, and they survive a refresh.
2. On the Watchlist, prices change and flash every 2 seconds.
3. Buy 10, then buy 5 more at a different price. Check the avg cost with the formula above.
4. Sell more than you own: rejected with a toast. Sell part of it: a toast shows the realised P&L.
5. Try to buy more than your cash: rejected.
6. On the Portfolio page, P&L = Current value − Invested for each row, and the totals add up.
7. History lists all trades, newest first.
8. Refresh: everything is still there. Settings → Reset account takes you back to onboarding.
9. Narrow the browser to 360px: nothing scrolls sideways.
