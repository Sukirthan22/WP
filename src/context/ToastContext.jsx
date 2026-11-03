// ToastContext.jsx — pop-up notifications ("Order filled", "Order rejected").
//
// Any component can call:  const showToast = useToast();
//                           showToast({ type: 'success', title: 'Order filled', message: '…' });
// The provider keeps a list of visible toasts and draws them in a fixed stack.

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import Toast from '../components/Toast.jsx';

const ToastContext = createContext(null);
const MAX_TOASTS = 3; // never show more than 3 at once

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // useRef = a box that keeps a value between renders WITHOUT causing a re-render
  // when it changes. Perfect for a simple increasing id counter.
  const nextId = useRef(1);

  // useCallback keeps the SAME function object between renders.
  // Toast's useEffect lists `onDismiss` as a dependency — if it were a new function on
  // every render, each toast's timer would restart again and again.
  const dismiss = useCallback((id) => {
    // Functional update: setToasts(list => …) receives the LATEST list,
    // which is safer than using `toasts` from this render (it could be stale).
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((toast) => {
    const id = nextId.current++;
    setToasts((list) => [...list, { ...toast, id }].slice(-MAX_TOASTS));
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {/* aria-live="polite": screen readers read new toasts aloud when they appear. */}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
