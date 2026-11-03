// Icons.jsx — small hand-drawn SVG icons (no icon library allowed).
//
// SVG basics:
// - viewBox="0 0 24 24" sets up a 24×24 drawing grid; the icon then scales to any size.
// - stroke="currentColor" means "use the CSS `color` of the parent", so an icon turns
//   orange automatically when its tab becomes active.
// - <path d="..."> is a list of drawing commands: M = move to, L = line to, etc.
//
// Each icon is a tiny React component. `...props` passes extra attributes (like className)
// straight through to the <svg>.

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true, // decorative: screen readers read the text label instead
};

// Logo: four rising bars, like a signal-strength / growth icon.
export function LogoIcon(props) {
  return (
    <svg {...base} stroke="none" fill="var(--accent)" {...props}>
      <rect x="2" y="15" width="4" height="7" rx="1" />
      <rect x="8" y="10" width="4" height="12" rx="1" />
      <rect x="14" y="5" width="4" height="17" rx="1" />
      <rect x="20" y="1" width="3" height="21" rx="1" />
    </svg>
  );
}

export function WatchlistIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M15 7h6v6" />
    </svg>
  );
}

export function PortfolioIcon(props) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export function HistoryIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

export function SettingsIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}

export function SearchIcon(props) {
  return (
    <svg {...base} width={16} height={16} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

export function WalletIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5" />
      <circle cx="16" cy="14" r="1.5" />
    </svg>
  );
}

export function LayersIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 13l9 5 9-5" />
    </svg>
  );
}

export function PieIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M21 12A9 9 0 1 1 12 3v9h9z" />
      <path d="M15 3.5A9 9 0 0 1 20.5 9H15V3.5z" />
    </svg>
  );
}

export function CheckIcon(props) {
  return (
    <svg {...base} width={16} height={16} strokeWidth={3} {...props}>
      <path d="M5 12l5 5 9-10" />
    </svg>
  );
}

export function CloseIcon(props) {
  return (
    <svg {...base} width={16} height={16} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function BackIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

export function EmptyBoxIcon(props) {
  return (
    <svg {...base} width={40} height={40} strokeWidth={1.5} {...props}>
      <path d="M3 13l3-8h12l3 8" />
      <path d="M3 13v6a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-6h-5a3 3 0 0 1-6 0H3z" />
    </svg>
  );
}
