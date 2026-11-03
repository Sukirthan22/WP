// storage.js — the ONLY file in the app that touches localStorage.
//
// localStorage basics:
//   - A small key → value store in the browser. Survives page refresh and closing the tab.
//   - It only stores STRINGS. So we JSON.stringify() objects when saving
//     and JSON.parse() them back when loading.
//
// Keeping all of it here means: one place to change key names, one place to handle errors.
// try/catch: localStorage can throw (private mode, storage full, or corrupt JSON),
// and we never want that to crash the app — we just fall back to defaults.

const PREFIX = 'papertrade:'; // namespaced keys, e.g. "papertrade:prices"

export function loadState(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw); // null = nothing saved yet
  } catch {
    return fallback;
  }
}

export function saveState(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage full or blocked — the app keeps working, it just won't remember.
  }
}

export function removeState(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}
