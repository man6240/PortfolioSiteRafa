import { animate, spring, splitText, stagger, utils } from 'animejs';

/* Shared motion vocabulary (Anime.js v4). Springs for anything the user moves,
   long expo ease-outs for things that arrive on their own. */

export const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Selection capsules and sheets: quick, with a hint of overshoot.
export const snappy = () => spring({ stiffness: 260, damping: 24 });
// Larger surfaces: softer and a little slower to settle.
export const gentle = () => spring({ stiffness: 140, damping: 20 });
export const ARRIVE = 'outExpo';

/* Words rise into place from behind a clip mask, one after another. */
export function splitWords(el) {
  if (!el._split) el._split = splitText(el, { words: { wrap: 'clip' } });
  return el._split.words;
}
export function riseWords(el, { delay = 0, duration = 1200, step = 70 } = {}) {
  if (!el) return null;
  return animate(splitWords(el), {
    translateY: ['110%', '0%'],
    duration,
    delay: stagger(step, { start: delay }),
    ease: ARRIVE,
  });
}

/* Fade and lift in. */
export function arrive(targets, { delay = 0, step = 90, y = 28, scale = 1, duration = 1100 } = {}) {
  return animate(targets, {
    opacity: [0, 1],
    translateY: [y, 0],
    ...(scale !== 1 ? { scale: [scale, 1] } : {}),
    duration,
    delay: stagger(step, { start: delay }),
    ease: ARRIVE,
    // hand the element back to CSS so hover transforms keep working
    onComplete: (self) => utils.cleanInlineStyles(self),
  });
}

/* Moves a selection capsule to a new slot. The first placement is instant; after that
   it springs across, briefly stretching along the direction of travel like a drop of liquid. */
export function moveCapsule(el, { left, width }) {
  if (!el) return;
  const placed = el.dataset.placed === '1';
  if (!placed || prefersReduced()) {
    utils.set(el, { translateX: left, width, opacity: 1 });
    el.dataset.placed = '1';
    return;
  }
  const from = parseFloat(utils.get(el, 'translateX')) || 0;
  const dist = Math.abs(left - from);
  animate(el, { translateX: left, width, ease: snappy() });
  if (dist > 4) {
    animate(el, {
      scaleY: [{ to: 0.86, duration: 140, ease: 'outQuad' }, { to: 1, ease: spring({ stiffness: 300, damping: 14 }) }],
      scaleX: [{ to: 1 + Math.min(dist / 600, 0.18), duration: 140, ease: 'outQuad' }, { to: 1, ease: spring({ stiffness: 300, damping: 14 }) }],
    });
  }
}

/* Counts a stat like "5+", "9+" or "5.0" up from zero, keeping its suffix and decimals. */
export function countUp(el, { delay = 0 } = {}) {
  const text = el.dataset.value || el.textContent;
  el.dataset.value = text;
  const m = text.match(/^([\d.]+)(.*)$/);
  if (!m) return;
  const target = parseFloat(m[1]);
  const decimals = (m[1].split('.')[1] || '').length;
  const counter = { v: 0 };
  el.textContent = (0).toFixed(decimals) + m[2];
  animate(counter, {
    v: target,
    duration: 1800,
    delay,
    ease: 'outExpo',
    onUpdate: () => { el.textContent = counter.v.toFixed(decimals) + m[2]; },
  });
}
