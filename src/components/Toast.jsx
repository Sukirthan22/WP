// Toast.jsx — one notification card. Closes itself after 4 seconds.

import { useEffect } from 'react';
import { CheckIcon, CloseIcon } from './Icons.jsx';
import './Toast.css';

export const TOAST_MS = 4000;

export default function Toast({ id, type = 'success', title, message, onDismiss }) {
  // Auto-dismiss timer.
  // setTimeout runs once after TOAST_MS. The cleanup (clearTimeout) matters: if the user
  // closes the toast early with ✕, the component unmounts and the pending timer is cancelled.
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), TOAST_MS);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    // role="status" = an announcement; "alert" for errors makes screen readers interrupt.
    <div className={`toast toast-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <span className="toast-icon">{type === 'error' ? <CloseIcon /> : <CheckIcon />}</span>
      <div className="toast-body">
        <p className="toast-title">{title}</p>
        {message && <p className="toast-message small muted">{message}</p>}
      </div>
      <button className="toast-close" onClick={() => onDismiss(id)} aria-label="Dismiss notification">
        <CloseIcon />
      </button>
      {/* The shrinking bar shows how long until it closes. Its CSS animation lasts TOAST_MS. */}
      <span className="toast-progress" style={{ animationDuration: `${TOAST_MS}ms` }} />
    </div>
  );
}
