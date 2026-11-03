// Logo.jsx — "Paper" in bold sans + "Trade" in orange serif italic.
//
// Made a component because it appears in two places (Navbar + Onboarding).
// One component = one place to change it.
//
// <em> is the HTML tag for "emphasis"; browsers show it in italics by default.
// Logo.css swaps its font to the serif display font.

import { LogoIcon } from './Icons.jsx';
import './Logo.css';

// size = 'md' (navbar) or 'lg' (onboarding). The default value is used if no prop is passed.
export default function Logo({ size = 'md' }) {
  return (
    <span className={`logo logo-${size}`}>
      <LogoIcon className="logo-icon" />
      <span className="logo-text">
        Paper<em>Trade</em>
      </span>
    </span>
  );
}
