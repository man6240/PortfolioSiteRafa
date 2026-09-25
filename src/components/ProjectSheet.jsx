import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate } from 'animejs';
import { Glass } from '../glass/LiquidGlass.jsx';
import { gentle } from '../motion.js';
import { ChevronLeft, ChevronRight, Close } from './Icons.jsx';
import { PhoneFrame, LiveScreen } from './Work.jsx';

export default function ProjectSheet({ state, onClose, reduced }) {
  const [i, setI] = useState(0);
  const closing = useRef(false);
  const closeRef = useRef(null);
  const backdropRef = useRef(null);
  const sheetRef = useRef(null);
  const lastFocus = useRef(null);
  const p = state?.p;
  const n = p?.shots.length || 0;

  useEffect(() => {
    if (!state) return;
    setI(state.i || 0);
    closing.current = false;
    lastFocus.current = document.activeElement;
    closeRef.current?.focus({ preventScroll: true });
    const bar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${bar}px`;
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      lastFocus.current?.focus?.({ preventScroll: true });
    };
  }, [state]);

  // Open: the backdrop fades while the sheet springs up from slightly below and behind.
  useLayoutEffect(() => {
    if (!state || reduced) return;
    animate(backdropRef.current, { opacity: [0, 1], duration: 350, ease: 'outQuad' });
    animate(sheetRef.current, { opacity: [0, 1], translateY: [48, 0], scale: [0.95, 1], ease: gentle() });
  }, [state, reduced]);

  const close = useCallback(() => {
    if (reduced) return onClose();
    if (closing.current) return;
    closing.current = true;
    animate(backdropRef.current, { opacity: 0, duration: 260, ease: 'inQuad' });
    animate(sheetRef.current, { opacity: 0, translateY: 24, scale: 0.97, duration: 260, ease: 'inQuad', onComplete: onClose });
  }, [onClose, reduced]);
  const step = useCallback((d) => n && setI((v) => (v + d + n) % n), [n]);

  useEffect(() => {
    if (!state) return;
    const k = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [state, close, step]);

  // Swipe between images on touch screens.
  const touch = useRef(null);
  const onTouchStart = (e) => { touch.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touch.current == null) return;
    const dx = e.changedTouches[0].clientX - touch.current;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
    touch.current = null;
  };

  if (!state) return null;
  const tall = Boolean(p.frame);
  const vars = { '--accent': p.palette[0], '--light': p.palette[1], '--deep': p.palette[2] };

  return (
    <div className="sheet-backdrop" ref={backdropRef} onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="sheet" ref={sheetRef} role="dialog" aria-modal="true" aria-labelledby="sheet-title" style={vars}>
        <div className={`viewer ${tall ? 'tall' : ''} ${p.live ? 'live' : ''}`} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {p.live ? (
            <PhoneFrame className="solo"><LiveScreen reduced={reduced} /></PhoneFrame>
          ) : (
            p.shots.map((src, k) => (
              <img key={k} src={src} className={k === i ? 'on' : ''} alt={k === i ? `${p.title}, image ${k + 1} of ${n}` : ''} aria-hidden={k !== i} decoding="async" />
            ))
          )}
          <Glass as="button" variant="clear" className="icon-btn sheet-close" onClick={close} aria-label="Close" ref={closeRef}>
            <Close size={18} stroke={2.2} />
          </Glass>
          {n > 1 && (
            <>
              <Glass as="button" variant="clear" className="icon-btn viewer-prev" onClick={() => step(-1)} aria-label="Previous image"><ChevronLeft stroke={2.2} /></Glass>
              <Glass as="button" variant="clear" className="icon-btn viewer-next" onClick={() => step(1)} aria-label="Next image"><ChevronRight stroke={2.2} /></Glass>
              <Glass className="chip viewer-count" variant="clear" aria-live="polite">{i + 1} / {n}</Glass>
            </>
          )}
        </div>

        {n > 1 && (
          <div className="thumbs" role="tablist" aria-label="Images">
            {p.shots.map((src, k) => (
              <button key={k} role="tab" aria-selected={k === i} className={k === i ? 'on' : ''} onClick={() => setI(k)} aria-label={`Image ${k + 1}`}>
                <img src={src} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        )}

        <div className="sheet-body">
          <div className="sheet-intro">
            <p className="eyebrow accent">{p.kind}</p>
            <h2 id="sheet-title">{p.title}{p.subtitle && <span>{p.subtitle}</span>}</h2>
            <p className="sheet-summary">{p.summary}</p>
          </div>
          <dl className="specs">
            <div><dt>Status</dt><dd><span className={`status-dot ${p.status === 'In development' ? 'wip' : ''}`} aria-hidden="true" />{p.status}</dd></div>
            <div><dt>Platforms</dt><dd>{p.platforms}</dd></div>
            <div><dt>My role</dt><dd>{p.role}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}
