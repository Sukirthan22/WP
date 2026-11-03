// OrderTicket.jsx — Buy/Sell toggle, quantity, estimated cost, confirm.
//
// Market orders only: the order fills instantly at the live price at the moment you click.
// The rules (enough cash / enough shares) live in utils/portfolio.js → validateOrder().
//
// Note: if an order breaks a rule we still let you click, and show an "Order rejected"
// toast — the same thing a real broker does. A warning under the numbers tells you first.

import { useState } from 'react';
import { useAccount } from '../context/AccountContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { orderValue, realisedPnlOnSell, validateOrder } from '../utils/portfolio.js';
import { formatINR, formatSignedINR } from '../utils/format.js';
import NumberStepper from './NumberStepper.jsx';
import './OrderTicket.css';

export default function OrderTicket({ stock }) {
  const { account, placeOrder } = useAccount();
  const showToast = useToast();

  const [side, setSide] = useState('BUY'); // 'BUY' | 'SELL'
  const [qtyText, setQtyText] = useState('1');

  // Everything below is DERIVED from state + props on each render (recomputed every tick).
  const isBuy = side === 'BUY';
  const qty = Number(qtyText); // "" → 0
  const qtyValid = Number.isInteger(qty) && qty >= 1;
  const price = stock.price;
  const estimate = qtyValid ? orderValue(qty, price) : 0;
  const holding = account.holdings[stock.symbol];
  const owned = holding?.qty ?? 0;
  const problem = qtyValid ? validateOrder(account, { side, symbol: stock.symbol, qty, price }) : null;

  // "Max" = most shares you can buy with your cash, or all the shares you own.
  // Math.floor rounds DOWN: ₹1,000 cash at ₹300/share → 3.33 → 3 shares.
  function fillMax() {
    const max = isBuy ? Math.floor(account.cash / price) : owned;
    setQtyText(String(max));
  }

  function handleSubmit(event) {
    event.preventDefault();

    // Work out the realised P&L BEFORE placing the sell, while we still know the avg cost.
    const pnl = !isBuy && holding && qtyValid ? realisedPnlOnSell(holding.avgCost, price, qty) : null;

    const result = placeOrder({ symbol: stock.symbol, side, qty, price });

    if (result.ok) {
      const verb = isBuy ? 'Bought' : 'Sold';
      const pnlText = pnl === null ? '' : ` · P&L ${formatSignedINR(pnl)}`;
      showToast({
        type: 'success',
        title: 'Order filled',
        message: `${verb} ${qty} × ${stock.symbol} at ${formatINR(price)}${pnlText}`,
      });
    } else {
      showToast({ type: 'error', title: 'Order rejected', message: result.error });
    }
  }

  return (
    <form className="card ticket" onSubmit={handleSubmit}>
      {/* Segmented control: two buttons, one "pressed". aria-pressed tells screen readers which. */}
      <div className={`segmented segmented-${side.toLowerCase()}`} role="group" aria-label="Order side">
        <button type="button" aria-pressed={isBuy} onClick={() => setSide('BUY')}>
          Buy
        </button>
        <button type="button" aria-pressed={!isBuy} onClick={() => setSide('SELL')}>
          Sell
        </button>
      </div>

      <div className="ticket-row">
        <span className="muted">Market price</span>
        <span className="num ticket-price">{formatINR(price)}</span>
      </div>

      <div className="ticket-qty-head">
        <label className="label" htmlFor="ticket-qty">Quantity</label>
        <button type="button" className="ticket-max" onClick={fillMax}>
          Max
        </button>
      </div>
      <NumberStepper id="ticket-qty" value={qtyText} onChange={setQtyText} />

      <div className="ticket-rows">
        <div className="ticket-row">
          <span className="muted">{isBuy ? 'Est. cost' : 'Est. proceeds'}</span>
          <span className="num ticket-strong">{formatINR(estimate)}</span>
        </div>
        <div className="ticket-row">
          <span className="muted">Available cash</span>
          <span className="num">{formatINR(account.cash)}</span>
        </div>
        <div className="ticket-row">
          <span className="muted">Shares owned</span>
          <span className="num">{owned}</span>
        </div>
      </div>

      {/* Only one of these shows: a rule warning, or the "enter a quantity" hint. */}
      {problem && <p className="ticket-warning small" role="note">{problem}</p>}
      {!qtyValid && <p className="ticket-warning small">Enter a quantity of at least 1.</p>}

      <button
        type="submit"
        className={`btn btn-block ticket-submit ${isBuy ? 'btn-buy' : 'btn-sell'}`}
        disabled={!qtyValid}
      >
        {isBuy ? 'Buy' : 'Sell'} {stock.symbol}
      </button>
      <p className="muted small ticket-note">Market order · fills instantly at the live price</p>
    </form>
  );
}
