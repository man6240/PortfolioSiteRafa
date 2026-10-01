import { SITE } from '../content.js';

export function Footer() {
  return (
    <footer className="foot" data-tone="dark">
      <div className="wrap foot-inner">
        <p>Copyright © {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
        <p>{SITE.title} · {SITE.location}</p>
        <p className="foot-credit">Hero iPhone model: <a href="https://sketchfab.com/3d-models/iphone-17-pro-4aeeeb41f9d14f96bb3f2589edc3edac" rel="noopener" target="_blank">“iPhone 17 Pro” by Ibrahim.Bhl</a>, <a href="https://creativecommons.org/licenses/by/4.0/" rel="noopener license" target="_blank">CC BY 4.0</a></p>
      </div>
    </footer>
  );
}
