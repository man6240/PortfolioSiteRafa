import { renderToString } from 'react-dom/server';
import App from './App.jsx';

// Used at build time only (scripts/prerender.mjs): renders the page to static HTML so search
// engines and link previews see the full content without running JavaScript.
export function render() {
  return renderToString(<App />);
}
