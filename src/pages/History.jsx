// History.jsx — every trade, newest first, with All / Buy / Sell filter.
//
// account.trades is already newest-first, because executeOrder() puts each new trade at the
// FRONT of the array ([trade, ...oldTrades]). So no sorting is needed here.

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccount } from '../context/AccountContext.jsx';
import { formatDateTime, formatINR, formatNumber, formatSignedINR, trendOf } from '../utils/format.js';
import EmptyState from '../components/EmptyState.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import './History.css';

// The filter tabs as data: [value, label]
const FILTERS = [
  ['ALL', 'All'],
  ['BUY', 'Buy'],
  ['SELL', 'Sell'],
];

export default function History() {
  const { account } = useAccount();
  const [filter, setFilter] = useState('ALL');
  usePageTitle('Trade History'); // above the early return — hooks must always run
  const trades = account.trades;

  if (trades.length === 0) {
    return (
      <div className="page">
        <h2 className="page-title">Trade <em>History</em></h2>
        <EmptyState
          title="No trades yet"
          message="Place your first trade to see it here."
          action={<Link to="/watchlist" className="btn btn-primary">Explore Stocks</Link>}
        />
      </div>
    );
  }

  // Derived values — recomputed from `trades` on every render.
  const counts = {
    ALL: trades.length,
    BUY: trades.filter((t) => t.side === 'BUY').length,
    SELL: trades.filter((t) => t.side === 'SELL').length,
  };
  const visible = filter === 'ALL' ? trades : trades.filter((t) => t.side === filter);
  const totalBought = trades.filter((t) => t.side === 'BUY').reduce((sum, t) => sum + t.total, 0);
  const totalSold = trades.filter((t) => t.side === 'SELL').reduce((sum, t) => sum + t.total, 0);

  return (
    <div className="page">
      <h2 className="page-title">Trade <em>History</em></h2>

      <div className="hist-summary">
        <div className="hist-chip">
          <span className="muted small">Bought</span>
          <span className="num">{formatINR(totalBought)}</span>
        </div>
        <div className="hist-chip">
          <span className="muted small">Sold</span>
          <span className="num">{formatINR(totalSold)}</span>
        </div>
        <div className="hist-chip">
          <span className="muted small">Realised P&amp;L</span>
          <span className={`num ${trendOf(account.realisedPnl)}`}>{formatSignedINR(account.realisedPnl)}</span>
        </div>
      </div>

      {/* role="tablist" / aria-selected tell screen readers these behave like tabs. */}
      <div className="seg-tabs hist-filters" role="tablist" aria-label="Filter trades">
        {FILTERS.map(([value, label]) => (
          <button
            key={value}
            role="tab"
            aria-selected={filter === value}
            className={'seg-tab' + (filter === value ? ' active' : '')}
            onClick={() => setFilter(value)}
          >
            {label} <span className="seg-count">{counts[value]}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="muted hist-none">No {filter.toLowerCase()} trades yet.</p>
      ) : (
        <div className="table-wrap">
          <table className="table table-stack hist-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Stock</th>
                <th>Side</th>
                <th className="right">Qty</th>
                <th className="right">Price</th>
                <th className="right">Total</th>
                <th className="right">Realised P&amp;L</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((t) => (
                <tr key={t.id}>
                  <td className="muted hist-time">{formatDateTime(t.time)}</td>
                  <td className="cell-head hist-stock">
                    <Link to={`/stock/${t.symbol}`} className="hist-symbol">{t.symbol}</Link>
                    {/* In card mode the side badge sits next to the symbol in the card header. */}
                    <span className={`badge stack-only ${t.side === 'BUY' ? 'badge-gain' : 'badge-loss'}`}>{t.side}</span>
                  </td>
                  <td className="stack-hide">
                    <span className={`badge ${t.side === 'BUY' ? 'badge-gain' : 'badge-loss'}`}>{t.side}</span>
                  </td>
                  <td className="right num" data-label="Qty">{t.qty}</td>
                  <td className="right num" data-label="Price">{formatNumber(t.price)}</td>
                  <td className="right num" data-label="Total">{formatINR(t.total)}</td>
                  {/* Buys have no realised P&L → show a dash. */}
                  <td className={`right num ${t.side === 'SELL' ? trendOf(t.realisedPnl) : 'muted'}`} data-label="Realised P&L">
                    {t.side === 'SELL' ? formatSignedINR(t.realisedPnl) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
