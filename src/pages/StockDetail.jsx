// StockDetail.jsx — one stock: live chart, your position, and the order ticket.

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMarket } from '../context/MarketContext.jsx';
import { useAccount } from '../context/AccountContext.jsx';
import { changeSinceOpen, HISTORY_LENGTH, TICK_MS } from '../engine/prices.js';
import usePageTitle from '../hooks/usePageTitle.js';
import PriceChart from '../components/PriceChart.jsx';
import { unrealisedPnl } from '../utils/portfolio.js';
import { formatINR, formatPercent, formatSignedINR, trendOf } from '../utils/format.js';
import { BackIcon } from '../components/Icons.jsx';
import ChangeBadge from '../components/ChangeBadge.jsx';
import StockAvatar from '../components/StockAvatar.jsx';
import EmptyState from '../components/EmptyState.jsx';
import OrderTicket from '../components/OrderTicket.jsx';
import './StockDetail.css';

// Chart range buttons: how many ticks to show. 1 tick = 2s, so 30 ticks = 1 minute.
const RANGES = [
  { label: '1m', ticks: 30 },
  { label: '2m', ticks: 60 },
  { label: 'All', ticks: HISTORY_LENGTH },
];

export default function StockDetail() {
  // useParams reads the ":symbol" part of the URL. /stock/INDUSTEK → { symbol: "INDUSTEK" }
  const { symbol } = useParams();
  const navigate = useNavigate();
  const market = useMarket();
  const { account } = useAccount();
  const [range, setRange] = useState(60);

  // Look the stock up. toUpperCase() so /stock/industek also works.
  const stock = market.stocks[symbol?.toUpperCase()];

  // Live price in the browser tab title, e.g. "INDUSTEK ₹4,049.69 · PaperTrade".
  // RULE OF HOOKS: hooks must run on every render in the same order, so they all go
  // ABOVE the early return below — never inside an if.
  usePageTitle(stock ? `${stock.symbol} ${formatINR(stock.price)}` : 'Not found');

  // "Early return": handle the bad case first, then the rest of the code can assume `stock` exists.
  if (!stock) {
    return (
      <div className="page">
        <EmptyState
          title="Stock not found"
          message={`There is no stock called “${symbol}”.`}
          action={<Link to="/watchlist" className="btn btn-primary">Back to Watchlist</Link>}
        />
      </div>
    );
  }

  const { abs, pct } = changeSinceOpen(stock);
  const trend = trendOf(pct);
  const flash = stock.price > stock.prevPrice ? 'flash-up' : stock.price < stock.prevPrice ? 'flash-down' : '';

  // Chart data: the last `range` prices. High/Low are for the visible window.
  const chartPoints = stock.history.slice(-range);
  const high = Math.max(...chartPoints);
  const low = Math.min(...chartPoints);

  // Your position in this stock (undefined if you don't own any).
  const holding = account.holdings[stock.symbol];
  const position = holding ? unrealisedPnl(holding, stock.price) : null;
  const positionTrend = position ? trendOf(position.abs) : 'flat';

  return (
    <div className="page">
      {/* navigate(-1) = the browser's Back button. */}
      <button className="btn btn-ghost sd-back" onClick={() => navigate(-1)}>
        <BackIcon /> Back
      </button>

      {/* Two columns on wide screens (info | ticket), one column on phones. See StockDetail.css. */}
      <div className="sd-grid">
        <div className="sd-main">
          <section className="sd-header">
            <StockAvatar stock={stock} size="lg" />
            <div>
              <h2>{stock.symbol}</h2>
              <p className="muted">
                {stock.name} · {stock.sector}
              </p>
            </div>
          </section>

          <div className="sd-price-row">
            <span key={market.tick} className={`num sd-price ${flash}`}>
              {formatINR(stock.price)}
            </span>
            <span className={`num sd-abs ${trend}`}>{formatSignedINR(abs)}</span>
            <ChangeBadge pct={pct} />
          </div>
          <p className="muted small">Change since session start · updates every 2s</p>

          <section className="card sd-chart">
            <div className="sd-chart-head">
              <h4>Price <em>chart</em></h4>
              <div className="seg-tabs" role="tablist" aria-label="Chart range">
                {RANGES.map((r) => (
                  <button
                    key={r.label}
                    role="tab"
                    aria-selected={range === r.ticks}
                    className={'seg-tab' + (range === r.ticks ? ' active' : '')}
                    onClick={() => setRange(r.ticks)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <PriceChart
              points={chartPoints}
              sessionOpen={stock.sessionOpen}
              tickSeconds={TICK_MS / 1000}
              label={stock.symbol}
            />

            <dl className="sd-stats">
              <div>
                <dt className="muted small">Session open</dt>
                <dd className="num">{formatINR(stock.sessionOpen)}</dd>
              </div>
              <div>
                <dt className="muted small">High</dt>
                <dd className="num gain">{formatINR(high)}</dd>
              </div>
              <div>
                <dt className="muted small">Low</dt>
                <dd className="num loss">{formatINR(low)}</dd>
              </div>
              <div>
                <dt className="muted small">Previous tick</dt>
                <dd className="num">{formatINR(stock.prevPrice)}</dd>
              </div>
            </dl>
          </section>

          {position && (
            <section className="card sd-position">
              <h4>Your <em>position</em></h4>
              {/* <dl> = description list: pairs of <dt> (term) and <dd> (its value). Semantic for key/value data. */}
              <dl className="sd-position-grid">
                <div>
                  <dt className="muted small">Quantity</dt>
                  <dd className="num">{holding.qty}</dd>
                </div>
                <div>
                  <dt className="muted small">Avg. cost</dt>
                  <dd className="num">{formatINR(holding.avgCost)}</dd>
                </div>
                <div>
                  <dt className="muted small">Invested</dt>
                  <dd className="num">{formatINR(position.invested)}</dd>
                </div>
                <div>
                  <dt className="muted small">Current value</dt>
                  <dd className="num">{formatINR(position.current)}</dd>
                </div>
                <div>
                  <dt className="muted small">Unrealised P&amp;L</dt>
                  <dd className={`num ${positionTrend}`}>
                    {formatSignedINR(position.abs)} ({formatPercent(position.pct)})
                  </dd>
                </div>
              </dl>
            </section>
          )}
        </div>

        <aside className="sd-side">
          <OrderTicket stock={stock} />
        </aside>
      </div>
    </div>
  );
}
