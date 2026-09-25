import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/fredoka';
import '@fontsource/space-mono/400.css';
import '@fontsource/space-mono/700.css';
import App from './App.jsx';
import './styles.css';

const root = document.getElementById('root');
// The production build ships prerendered HTML (scripts/prerender.mjs); pick it up instead of re-rendering.
if (root.firstElementChild) hydrateRoot(root, <App />);
else createRoot(root).render(<App />);
// Animated parts stay hidden (styles.css, html.js) until the app has taken over.
requestAnimationFrame(() => document.documentElement.classList.add('hydrated'));
