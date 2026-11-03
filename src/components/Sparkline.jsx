// Sparkline.jsx — a tiny line chart with no axes, drawn with SVG.
//
// THE MATH (turning prices into x,y points inside a width × height box):
//   x: spread points evenly → x = index × (width / (count − 1))
//   y: scale price between the lowest (min) and highest (max) price.
//      ratio = (price − min) / (max − min)   → 0 for lowest, 1 for highest
//      SVG y grows DOWNWARDS, so high prices need SMALL y:  y = height − ratio × height
//   A 2px padding keeps the line from touching the edges.

const PAD = 2;

export default function Sparkline({ points, trend = 'flat', width = 96, height = 32 }) {
  if (points.length < 2) return null; // can't draw a line with one point

  const min = Math.min(...points); // ...points spreads the array into separate arguments
  const max = Math.max(...points);
  const range = max - min || 1; // || 1 avoids dividing by 0 when all prices are equal
  const stepX = width / (points.length - 1);

  const coords = points
    .map((price, i) => {
      const x = i * stepX;
      const y = height - PAD - ((price - min) / range) * (height - PAD * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' '); // → "0,30 3.3,28.1 6.6,25 ..." — the format <polyline points> expects

  // className={trend} reuses the global .gain / .loss colours; stroke="currentColor" picks it up.
  return (
    <svg
      className={`sparkline ${trend === 'flat' ? 'muted' : trend}`}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      <polyline
        points={coords}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
