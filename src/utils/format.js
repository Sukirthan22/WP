// format.js — Indian number formatting, used EVERYWHERE we show money or numbers.
//
// Intl.NumberFormat is built into JavaScript. The 'en-IN' locale groups digits the
// Indian way: 1,00,000 (lakh) instead of 100,000.
// We create the formatters ONCE (here, at module level) and reuse them, because
// building a formatter is slower than using one.

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',            // adds the ₹ symbol
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

// formatDateTime(Date.now()) → "31 Oct, 10:24:05 am"   (Intl accepts a timestamp number)
export function formatDateTime(timestamp) {
  return dateTimeFormatter.format(timestamp);
}

// formatINR(100000)  → "₹1,00,000.00"
export function formatINR(value) {
  return inrFormatter.format(value);
}

// formatNumber(2856.4) → "2,856.40" (no ₹ sign — for tight table cells)
export function formatNumber(value) {
  return numberFormatter.format(value);
}

// formatSignedINR(552)  → "+₹552.00"
// formatSignedINR(-18)  → "-₹18.00"
// Used for P&L and price change, where the sign matters.
export function formatSignedINR(value) {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  return sign + inrFormatter.format(Math.abs(value));
}

// trendOf(1.5) → "gain", trendOf(-2) → "loss", trendOf(0) → "flat"
// Returns a CSS class name, so colour logic lives in CSS, not scattered in JSX.
// We round first so +0.001 (which DISPLAYS as 0.00) counts as flat, not green.
export function trendOf(value) {
  const rounded = Math.round(value * 100) / 100;
  if (rounded > 0) return 'gain';
  if (rounded < 0) return 'loss';
  return 'flat';
}

// formatPercent(1.2345) → "+1.23%"
export function formatPercent(value) {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  return sign + numberFormatter.format(Math.abs(value)) + '%';
}
