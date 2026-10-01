import { SITE } from '../content.js';

export function Footer() {
  return (
    <footer className="foot" data-tone="dark">
      <div className="wrap foot-inner">
        <p>Copyright © {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
        <p>{SITE.title} · {SITE.location}</p>
      </div>
    </footer>
  );
}
