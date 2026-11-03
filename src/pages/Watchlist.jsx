// Watchlist.jsx — live table of all 10 stocks. Click a row → Stock Detail.
//
// Data flow: MarketProvider ticks every 2s → `market` changes → this component
// re-renders automatically with the new prices. We never "refresh" the table ourselves.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarket } from '../context/MarketContext.jsx';
import { STOCKS, changeSinceOpen } from '../engine/prices.js';
import { formatINR, formatSignedINR, trendOf } from '../utils/format.js';
import ChangeBadge from '../components/ChangeBadge.jsx';
import Sparkline from '../components/Sparkline.jsx';
import StockAvatar from '../components/StockAvatar.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { SearchIcon } from '../components/Icons.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import './Watchlist.css';

const SPARK_POINTS = 30; // the sparkline shows the last 30 ticks (~1 minute)

export default function Watchlist() {
  const market = useMarket();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  usePageTitle('Watchlist');

  // Build the row list in the fixed STOCKS order, joined with live data from the market.
  const rows = STOCKS.map(({ symbol }) => market.stocks[symbol]);

  // DERIVED STATE: compute from existing state on every render instead of storing it.
  // No need for a separate "filteredRows" useState — it would only get out of sync.
  const q = query.trim().toLowerCase();
  const visible = rows.filter(
    (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
  );

  // Little market summary: how many stocks are up vs down since the session started.
  const gainers = rows.filter((s) => trendOf(changeSinceOpen(s).pct) === 'gain').length;
  const losers = rows.filter((s) => trendOf(changeSinceOpen(s).pct) === 'loss').length;

  function openStock(symbol) {
    navigate(`/stock/${symbol}`); // template literal: builds "/stock/ARYAPWR"
  }

  return (
    <div className="page">
      <div className="wl-header">
        <h2 className="page-title">Market <em>Watchlist</em></h2>
        <div className="wl-status small">
          <span className="live-dot" /> Live
          <span className="muted">· every 2s ·</span>
          <span className="gain">▲ {gainers}</span>
          <span className="loss">▼ {losers}</span>
        </div>
      </div>

      <div className="wl-search">
        <SearchIcon className="wl-search-icon" />
        <input
          className="input wl-search-input"
          type="search"
          placeholder="Search stocks, e.g. ARYAPWR, Pharma…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search stocks"
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="No stocks match"
          message={`Nothing found for “${query}”.`}
          action={<button className="btn btn-secondary" onClick={() => setQuery('')}>Clear search</button>}
        />
      ) : (
        <div className="table-wrap">
          <table className="table wl-table">
            <thead>
              <tr>
                <th>Stock</th>
                <th className="hide-mobile">Trend</th>
                <th className="right">Price</th>
                <th className="right">Change</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((stock) => {
                const { abs, pct } = changeSinceOpen(stock);
                const trend = trendOf(pct);
                // Did THIS tick go up or down? Decides the flash colour.
                const flash =
                  stock.price > stock.prevPrice ? 'flash-up' : stock.price < stock.prevPrice ? 'flash-down' : '';

                return (
                  <tr
                    key={stock.symbol}
                    className={`wl-row wl-row-${trend}`}
                    onClick={() => openStock(stock.symbol)}
                    // Rows aren't focusable by default. tabIndex={0} lets keyboard users
                    // Tab to them, and Enter opens the stock — same as a click.
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') openStock(stock.symbol);
                    }}
                  >
                    <td>
                      <div className="wl-stock">
                        <StockAvatar stock={stock} />
                        <div className="wl-names">
                          <div className="wl-symbol">{stock.symbol}</div>
                          <div className="wl-name muted small">{stock.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hide-mobile">
                      <Sparkline points={stock.history.slice(-SPARK_POINTS)} trend={trend} />
                    </td>
                    <td className="right">
                      {/* key={market.tick}: new key each tick → element re-created → flash replays */}
                      <span key={market.tick} className={`num wl-price ${flash}`}>
                        {formatINR(stock.price)}
                      </span>
                    </td>
                    <td className="right">
                      <ChangeBadge pct={pct} />
                      <div className={`num small wl-abs ${trend}`}>{formatSignedINR(abs)}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
