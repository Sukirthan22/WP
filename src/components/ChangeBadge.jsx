// ChangeBadge.jsx — the coloured "▲ +1.24%" / "▼ -0.62%" pill.
// Green background for up, red for down, grey for no change.

import { formatPercent, trendOf } from '../utils/format.js';

const ARROWS = { gain: '▲', loss: '▼', flat: '' };

export default function ChangeBadge({ pct }) {
  const trend = trendOf(pct);
  return (
    <span className={`badge badge-${trend}`}>
      {ARROWS[trend]} {formatPercent(pct)}
    </span>
  );
}
