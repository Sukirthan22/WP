// EmptyState.jsx — the "nothing here yet" box (from the design system).
//
// PROPS are a component's inputs, like function arguments:
//   <EmptyState title="No trades yet" message="..." action={<button/>} />
// We "destructure" them in the parameter list: ({ title, message, action }).

import { EmptyBoxIcon } from './Icons.jsx';
import './EmptyState.css';

export default function EmptyState({ title, message, action }) {
  return (
    <div className="empty-state card">
      <EmptyBoxIcon className="empty-state-icon" />
      <h4>{title}</h4>
      <p className="muted">{message}</p>
      {/* `action && ...` → only render the action if one was passed in. */}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
