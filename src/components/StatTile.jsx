// StatTile.jsx — one summary box: icon, label, big value, small line underneath.
//
// `Icon` is passed as a COMPONENT (capital I), not as JSX. Inside we render it with <Icon />.
// `trend` ('gain' | 'loss' | 'flat') colours the value; `children` is the small line below.
// `children` = whatever you put BETWEEN the opening and closing tags:
//    <StatTile label="Cash" …>Available to trade</StatTile>

import './StatTile.css';

export default function StatTile({ Icon, label, value, trend, accent = 'var(--accent)', children }) {
  return (
    // --tile-accent is a CSS variable set per tile, used by StatTile.css for the icon colour.
    <div className="card stat-tile" style={{ '--tile-accent': accent }}>
      <span className="stat-icon">
        <Icon />
      </span>
      <p className="stat-label muted small">{label}</p>
      <p className={`stat-value num ${trend ?? ''}`}>{value}</p>
      {children && <div className="stat-sub small">{children}</div>}
    </div>
  );
}
