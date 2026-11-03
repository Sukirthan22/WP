// math.js — tiny shared number helpers.

// Round to 2 decimal places (paise). Multiply by 100, round to a whole number, divide back.
// e.g. 2856.4049 → 285640.49 → 285640 → 2856.40
//
// Why we need this: computers store decimals in binary, so 0.1 + 0.2 = 0.30000000000000004.
// Rounding money to paise after every calculation stops these tiny errors piling up.
export function round2(n) {
  return Math.round(n * 100) / 100;
}
