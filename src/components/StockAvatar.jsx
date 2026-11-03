// StockAvatar.jsx — coloured circle with the first 2 letters of the symbol ("AR", "BH"…).
//
// Each stock has its own `hue`. We pass it to CSS as a CSS VARIABLE through the
// inline style: style={{ '--hue': 45 }}. StockAvatar.css then builds colours with
// hsl(var(--hue) …). One CSS rule, ten different colours.

import './StockAvatar.css';

export default function StockAvatar({ stock, size = 'md' }) {
  return (
    <span className={`avatar avatar-${size}`} style={{ '--hue': stock.hue }} aria-hidden="true">
      {stock.symbol.slice(0, 2)}
    </span>
  );
}
