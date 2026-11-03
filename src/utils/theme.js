// theme.js — dark / light mode.
//
// How theming works here: tokens.css defines dark colours on :root, and overrides some of
// them under [data-theme='light']. So switching theme is ONE line of JS:
//   document.documentElement.dataset.theme = 'light'   →   <html data-theme="light">
// Every var(--bg), var(--surface)… in the app then picks up the light values instantly.

import { loadState, saveState } from './storage.js';

export function getSavedTheme() {
  return loadState('theme', 'dark');
}

// Apply a theme to the page and remember it for next time.
export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme; // dataset.theme ↔ the data-theme attribute
  saveState('theme', theme);
}
