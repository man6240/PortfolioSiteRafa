import { useEffect, useRef, useState } from 'react';
import { makeFlagFiestaScreen } from '../flagFiesta.js';

/* The devices projects are shown on: a phone frame, the live Flag Fiesta canvas, and a crossfading slideshow. */

export function PhoneFrame({ src, children, className = '' }) {
  return (
    <div className={`phone ${className}`}>
      <div className="phone-screen">
        {src ? <img src={src} alt="" loading="lazy" decoding="async" /> : children}
        <span className="phone-island" aria-hidden="true" />
      </div>
    </div>
  );
}

/* Flag Fiesta has no captures yet: its screen is a live canvas that only animates while visible. */
export function LiveScreen({ reduced }) {
  const host = useRef(null);
  useEffect(() => {
    const { canvas, draw } = makeFlagFiestaScreen();
    host.current.appendChild(canvas);
    if (reduced) return () => canvas.remove();
    let raf = 0, visible = false, t0 = performance.now();
    const loop = (t) => { draw((t - t0) / 1000); raf = visible ? requestAnimationFrame(loop) : 0; };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    });
    io.observe(host.current);
    return () => { io.disconnect(); cancelAnimationFrame(raf); canvas.remove(); };
  }, [reduced]);
  return <div className="live-screen" ref={host} />;
}

/* Crossfading screenshots, used inside the showcase phone and screen. */
export function Slideshow({ shots, reduced, interval = 4200 }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduced || shots.length < 2) return;
    const id = setInterval(() => setI((v) => (v + 1) % shots.length), interval);
    return () => clearInterval(id);
  }, [shots.length, reduced, interval]);
  return (
    <div className="slides">
      {shots.map((src, k) => <img key={k} src={src} className={k === i ? 'on' : ''} alt="" loading="lazy" decoding="async" />)}
    </div>
  );
}
