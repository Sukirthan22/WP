// NumberStepper.jsx — [ − ]  10  [ + ]  quantity input.
//
// It's a CONTROLLED component: the parent owns the value and passes it in with
// `value` + `onChange`. The stepper just displays it and reports changes.
//
// The value is a STRING, not a number, so the box can be empty while you're typing
// (a number state can't represent "nothing typed yet").

import './NumberStepper.css';

export default function NumberStepper({ id, value, onChange, min = 1 }) {
  const num = parseInt(value, 10); // "12" → 12, "" → NaN
  const current = Number.isNaN(num) ? 0 : num;

  return (
    <div className="stepper">
      <button
        type="button" // inside a <form>, buttons default to type="submit" — we don't want that here
        className="stepper-btn"
        onClick={() => onChange(String(Math.max(min, current - 1)))}
        disabled={current <= min}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <input
        id={id}
        className="stepper-input num"
        // type="text" + inputMode="numeric": phones show the number keypad, but we avoid
        // <input type="number"> quirks (it accepts "e", "-", "." and scroll-wheel changes).
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={value}
        // Regex /\D/g = every NON-digit character. Replace them with '' → only digits remain.
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 7))}
      />
      <button
        type="button"
        className="stepper-btn"
        onClick={() => onChange(String(current + 1))}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
