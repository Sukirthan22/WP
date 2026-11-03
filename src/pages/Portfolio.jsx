// Portfolio.jsx — stat tiles + holdings table, updating live every tick.
//
// All the maths comes from ONE call: portfolioSummary(account, market.stocks)
// (see utils/portfolio.js). This page only DISPLAYS the numbers — no calculations here,
// so there's exactly one place to check if a number looks wrong.

import { Link, useNavigate } from 'react-router-dom';
import { useMarket } from '../context/MarketContext.jsx';
import { useAccount } from '../context/AccountContext.jsx';
import { portfolioSummary, STARTING_CASH } from '../utils/portfolio.js';
import { formatINR, formatNumber, formatPercent, formatSignedINR, trendOf } from '../utils/format.js';
import StatTile from '../components/StatTile.jsx';
import StockAvatar from '../components/StockAvatar.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { WalletIcon, LayersIcon, PieIcon, WatchlistIcon } from '../components/Icons.jsx';
import usePageTitle from '../hooks/usePageTitle.js';
import './Portfolio.css';

export default function Portfolio() {
  const market = useMarket();
  const { account } = useAccount();
  const navigate = useNavigate();
  usePageTitle('Portfolio');

  const s = portfolioSummary(account, market.stocks);
  const totalTrend = trendOf(s.totalPnl);

  return (
    <div className="page">
      <div className="pf-header">
        <h2 className="page-title">Portfolio <em>Overview</em></h2>
        <p className="pf-networth">
          <span className="muted small">Net worth</span>
          <span className="num">{formatINR(s.netWorth)}</span>
          <span className={`num small ${totalTrend}`}>
            {formatPercent(s.totalPnlPct)} since start
          </span>
        </p>
      </div>

      {/* auto-fit grid: 4 tiles in a row on desktop, 2 on phones (see Portfolio.css). */}
      <div className="pf-tiles">
        <StatTile Icon={WalletIcon} label="Virtual Cash" value={formatINR(s.cash)} accent="var(--accent)">
          Available to trade
        </StatTile>

        <StatTile Icon={LayersIcon} label="Invested" value={formatINR(s.invested)} accent="var(--info)">
          {s.rows.length} {s.rows.length === 1 ? 'holding' : 'holdings'} at avg. cost
        </StatTile>

        <StatTile Icon={PieIcon} label="Current Value" value={formatINR(s.current)} accent="#a78bfa">
          Unrealised{' '}
          <span className={`num ${trendOf(s.unrealised)}`}>
            {formatSignedINR(s.unrealised)} ({formatPercent(s.unrealisedPct)})
          </span>
        </StatTile>

        <StatTile
          Icon={WatchlistIcon}
          label="Total P&L"
          value={formatSignedINR(s.totalPnl)}
          trend={totalTrend}
          accent={totalTrend === 'loss' ? 'var(--danger)' : 'var(--success)'}
        >
          <span className={`num ${totalTrend}`}>{formatPercent(s.totalPnlPct)}</span> of{' '}
          {formatINR(STARTING_CASH)}
          <br />
          Realised <span className={`num ${trendOf(s.realised)}`}>{formatSignedINR(s.realised)}</span>
        </StatTile>
      </div>

      <h3 className="pf-section-title">
        Holdings <span className="muted">({s.rows.length})</span>
      </h3>

      {s.rows.length === 0 ? (
        <EmptyState
          title="No holdings yet"
          message="Buy a stock and it will show up here with live P&L."
          action={<Link to="/watchlist" className="btn btn-primary">Explore Stocks</Link>}
        />
      ) : (
        <>
          {/* <> </> is a Fragment: groups elements without adding an extra <div> to the page. */}
          <div className="table-wrap">
            {/* table-stack: on phones each row turns into a card (see global.css). */}
            <table className="table table-stack pf-table">
              <thead>
                <tr>
                  <th>Stock</th>
                  <th className="right">Qty</th>
                  <th className="right">Avg. cost</th>
                  <th className="right">LTP</th>
                  <th className="right">Invested</th>
                  <th className="right">Current value</th>
                  <th className="right">Unrealised P&amp;L</th>
                </tr>
              </thead>
              <tbody>
                {s.rows.map((row) => {
                  const stock = market.stocks[row.symbol];
                  const trend = trendOf(row.abs);
                  return (
                    <tr
                      key={row.symbol}
                      className="pf-row"
                      onClick={() => navigate(`/stock/${row.symbol}`)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') navigate(`/stock/${row.symbol}`);
                      }}
                    >
                      <td className="cell-head">
                        <div className="pf-stock">
                          <StockAvatar stock={stock} />
                          <div>
                            <div className="pf-symbol">{row.symbol}</div>
                            <div className="muted small">{stock.sector}</div>
                          </div>
                        </div>
                      </td>
                      {/* data-label: the column name, shown above the value on phones via CSS attr(). */}
                      <td className="right num" data-label="Qty">{row.qty}</td>
                      {/* title = hover tooltip with the exact (unrounded) average. */}
                      <td className="right num" data-label="Avg. cost" title={`Exact: ₹${row.avgCost}`}>
                        {formatNumber(row.avgCost)}
                      </td>
                      <td className="right num" data-label="LTP">{formatNumber(row.ltp)}</td>
                      <td className="right num" data-label="Invested">{formatINR(row.invested)}</td>
                      <td className="right num" data-label="Current value">{formatINR(row.current)}</td>
                      <td className={`right num ${trend}`} data-label="Unrealised P&L">
                        <div className="pf-pnl">{formatSignedINR(row.abs)}</div>
                        <div className="small">{formatPercent(row.pct)}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* <tfoot> = table footer: the totals row. */}
              <tfoot>
                <tr className="pf-total">
                  <td className="cell-head">Total</td>
                  <td className="stack-hide" colSpan={3} />
                  <td className="right num" data-label="Invested">{formatINR(s.invested)}</td>
                  <td className="right num" data-label="Current value">{formatINR(s.current)}</td>
                  <td className={`right num ${trendOf(s.unrealised)}`} data-label="Unrealised P&L">
                    <div className="pf-pnl">{formatSignedINR(s.unrealised)}</div>
                    <div className="small">{formatPercent(s.unrealisedPct)}</div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="muted small pf-note">
            LTP = last traded (live) price · P&amp;L = Current value − Invested · Avg. cost is shown
            rounded to 2 decimals; the maths uses the exact average (total paid ÷ shares).
          </p>
        </>
      )}
    </div>
  );
}
