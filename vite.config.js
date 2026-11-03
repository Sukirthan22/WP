// vite.config.js — tells Vite how to build the project.
// Vite is the dev server + bundler. The React plugin lets Vite understand JSX
// (the HTML-like syntax inside .jsx files) and enables fast hot-reload.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
