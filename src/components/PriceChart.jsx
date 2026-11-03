// PriceChart.jsx — a line chart drawn BY HAND with SVG (no chart library).
//
// ─── The idea ───────────────────────────────────────────────────────────
// We have a list of prices: [412.3, 413.1, 411.8, ...] (one per 2-second tick).
// To draw them we turn each (index, price) into an (x, y) pixel position:
//
//   x(i) = left padding + i × (drawing width ÷ (count − 1))        → spread evenly
//   y(p) = top padding  + (max − p) ÷ (max − min) × drawing height → highest price at the top
//
// (SVG's y-axis points DOWN, which is why we use (max − p): the max price gets y = top.)
//
// Then an SVG <path> joins the points:  "M x0,y0 L x1,y1 L x2,y2 …"
//   M = move the pen there, L = draw a line to there.
//
// ─── Why we measure the width ───────────────────────────────────────────
// Text in an SVG that's simply stretched to fit gets squashed. Instead we measure the box's
// real pixel width with a ResizeObserver and draw at exactly that size.

import { useEffect, useId, useRef, useState } from 'react';
import { formatINR, formatNumber } from '../utils/format.js';
import './PriceChart.css';

const PAD = { top: 16, right: 68, bottom: 28, left: 8 }; // room for labels around the plot
const GRID_LINES = 4;

// 0 → "now", 40 → "40s ago", 130 → "2m 10s ago"
function timeAgo(seconds) {
  if (seconds === 0) return 'now';
  if (seconds < 60) return `${seconds}s ago`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s === 0 ? `${m}m ago` : `${m}m ${s}s ago`;
}

export default function PriceChart({ points, sessionOpen, height = 280, tickSeconds = 2, label = 'Price' }) {
  const wrapRef = useRef(null); // a "handle" to the real <div> in the page
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState(null); // index of the point under the cursor, or null

  // useId → an id that is unique per chart, for the SVG gradient (two charts on a page
  // must not share an id). We strip characters that aren't allowed in url(#…).
  const gradientId = 'chart-fill-' + useId().replace(/[^a-zA-Z0-9]/g, '');

  // Measure the container, and re-measure whenever it changes size (window resize, rotate phone).
  // Cleanup: disconnect the observer when the chart unmounts, or it would keep watching forever.
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(wrapRef.current);
    return () => observer.disconnect();
  }, []);

  const n = points.length;

  // Before the first measurement (width 0) or with too few points, render just the empty box.
  if (width === 0 || n < 2) {
    return <div ref={wrapRef} className="chart" style={{ height }} />;
  }

  // ----- Scales -----
  const innerW = width - PAD.left - PAD.right;
  const innerH = height - PAD.top - PAD.bottom;

  let min = Math.min(...points);
  let max = Math.max(...points);
  const spread = max - min || max * 0.01; // flat line? invent a 1% range so we don't divide by 0
  min -= spread * 0.1; // 10% breathing room above and below the line
  max += spread * 0.1;

  const x = (i) => PAD.left + (i * innerW) / (n - 1);
  const y = (p) => PAD.top + ((max - p) / (max - min)) * innerH;
  const bottom = PAD.top + innerH;

  // ----- Shapes -----
  // The line: "M x0,y0 L x1,y1 …"
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p).toFixed(1)}`).join(' ');
  // The shaded area: the same line, then down to the bottom-right, across to bottom-left, Z = close.
  const areaPath = `${linePath} L${x(n - 1).toFixed(1)},${bottom} L${x(0).toFixed(1)},${bottom} Z`;

  const first = points[0];
  const last = points[n - 1];
  const trend = last >= first ? 'gain' : 'loss'; // colour: up over this window → green

  // Horizontal grid lines at evenly spaced prices. Array.from({ length: 4 }, fn) builds [fn(0)…fn(3)].
  const gridPrices = Array.from({ length: GRID_LINES }, (_, k) => max - ((k + 0.5) * (max - min)) / GRID_LINES);

  // X-axis labels: oldest, middle, newest.
  const xLabels = [0, Math.floor((n - 1) / 2), n - 1];

  // Only draw the "session open" line if it's inside the visible price range.
  const showOpen = sessionOpen >= min && sessionOpen <= max;

  // ----- Hover -----
  // Convert the mouse x position back into the nearest point index (the reverse of x(i)).
  function handlePointerMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const i = Math.round(((px - PAD.left) / innerW) * (n - 1));
    setHover(Math.min(n - 1, Math.max(0, i))); // clamp into 0 … n−1
  }

  const hoverX = hover === null ? 0 : x(hover);
  // Keep the tooltip inside the chart: never closer than 70px to either edge.
  const tooltipLeft = Math.min(Math.max(hoverX, 70), width - 70);

  return (
    <div ref={wrapRef} className={`chart chart-${trend}`} style={{ height }}>
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={`${label} chart: last ${n} ticks, from ${formatINR(first)} to ${formatINR(last)}`}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          {/* Vertical fade: line colour at the top → transparent at the bottom. */}
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines + price labels on the right. */}
        {gridPrices.map((price) => (
          <g key={price} className="chart-grid">
            <line x1={PAD.left} x2={PAD.left + innerW} y1={y(price)} y2={y(price)} />
            <text x={width - 6} y={y(price) + 4} textAnchor="end">
              {formatNumber(price)}
            </text>
          </g>
        ))}

        {/* Time labels along the bottom. textAnchor = which part of the text sits at x. */}
        {xLabels.map((i, k) => (
          <text
            key={i}
            className="chart-axis"
            x={x(i)}
            y={height - 8}
            textAnchor={k === 0 ? 'start' : k === xLabels.length - 1 ? 'end' : 'middle'}
          >
            {timeAgo((n - 1 - i) * tickSeconds)}
          </text>
        ))}

        {showOpen && (
          <g className="chart-open">
            <line x1={PAD.left} x2={PAD.left + innerW} y1={y(sessionOpen)} y2={y(sessionOpen)} />
            <text x={PAD.left + 4} y={y(sessionOpen) - 5}>Open</text>
          </g>
        )}

        <path className="chart-area" d={areaPath} fill={`url(#${gradientId})`} />
        <path className="chart-line" d={linePath} />

        {/* Live dot at the newest price, with a pulsing ring. */}
        <circle className="chart-pulse" cx={x(n - 1)} cy={y(last)} r="4" />
        <circle className="chart-dot" cx={x(n - 1)} cy={y(last)} r="4" />

        {/* Current price tag on the right axis. */}
        <g className="chart-tag" transform={`translate(${PAD.left + innerW + 6}, ${y(last) - 10})`}>
          <rect width={PAD.right - 8} height="20" rx="4" />
          <text x={(PAD.right - 8) / 2} y="14" textAnchor="middle">
            {formatNumber(last)}
          </text>
        </g>

        {/* Crosshair while hovering. */}
        {hover !== null && (
          <g className="chart-cross">
            <line x1={hoverX} x2={hoverX} y1={PAD.top} y2={bottom} />
            <circle cx={hoverX} cy={y(points[hover])} r="5" />
          </g>
        )}
      </svg>

      {/* The tooltip is normal HTML positioned over the SVG — easier to style than SVG text. */}
      {hover !== null && (
        <div className="chart-tooltip" style={{ left: tooltipLeft }}>
          <span className="num">{formatINR(points[hover])}</span>
          <span className="muted">{timeAgo((n - 1 - hover) * tickSeconds)}</span>
        </div>
      )}
    </div>
  );
}
