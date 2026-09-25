import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Glass } from '../glass/LiquidGlass.jsx';
import { Plus } from './Icons.jsx';
import { PROJECTS, CATEGORIES } from '../content.js';
import { makeFlagFiestaScreen } from '../flagFiesta.js';

const portrait = (p) => Boolean(p.frame || p.live);

/* Cards go into rows of two. A landscape card next to a portrait one takes 8 of 12 columns;
   two of a kind split the row; a card left alone at the end takes the full row. */
function layout(items) {
  const out = [];
  for (let i = 0; i < items.length; i += 2) {
    const a = items[i], b = items[i + 1];
    if (!b) { out.push([a, 12]); break; }
    if (portrait(a) === portrait(b)) { out.push([a, 6], [b, 6]); continue; }
    out.push([a, portrait(a) ? 4 : 8], [b, portrait(b) ? 4 : 8]);
  }
  return out;
}

export function Segmented({ value, onChange, options }) {
  const ref = useRef(null);
  const [thumb, setThumb] = useState(null);
  useLayoutEffect(() => {
    const measure = () => {
      const el = ref.current?.querySelector('[aria-checked="true"]');
      if (el) setThumb({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [value]);
  const key = (e) => {
    const i = options.findIndex((o) => o.id === value);
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = options[(i + d + options.length) % options.length];
    onChange(next.id);
    ref.current.querySelector(`[data-id="${next.id}"]`)?.focus();
  };
  return (
    <Glass className="segmented" variant="clear" role="radiogroup" aria-label="Filter projects" ref={ref} onKeyDown={key}>
      {thumb && <span className="segmented-thumb" style={{ transform: `translateX(${thumb.left}px)`, width: thumb.width }} aria-hidden="true" />}
      {options.map((o) => (
        <button key={o.id} data-id={o.id} role="radio" aria-checked={o.id === value} tabIndex={o.id === value ? 0 : -1} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </Glass>
  );
}

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

function CardMedia({ p, reduced }) {
  if (p.live) {
    return <div className="card-stage"><PhoneFrame className="solo"><LiveScreen reduced={reduced} /></PhoneFrame></div>;
  }
  if (p.frame) {
    const picks = [p.shots[1], p.shots[0], p.shots[2]].filter(Boolean);
    return (
      <div className={`card-stage fan fan-${p.frame}`}>
        {picks.map((src, k) => p.frame === 'phone'
          ? <PhoneFrame key={k} src={src} className={`f${k}`} />
          : <div key={k} className={`print f${k}`}><img src={src} alt="" loading="lazy" decoding="async" /></div>)}
      </div>
    );
  }
  return (
    <div className="card-photo">
      <img src={p.shots[0]} alt="" loading="lazy" decoding="async" />
      {p.shots[1] && <img className="alt" src={p.shots[1]} alt="" loading="lazy" decoding="async" />}
    </div>
  );
}

function Card({ p, span, reduced, onOpen }) {
  const count = p.shots.length;
  return (
    <article
      className={`card reveal ${portrait(p) ? 'is-portrait' : 'is-landscape'}`}
      style={{ '--span': span, '--accent': p.palette[0], '--light': p.palette[1], '--deep': p.palette[2] }}
    >
      <CardMedia p={p} reduced={reduced} />
      <Glass className="chip card-chip" variant="clear">{p.kind}</Glass>
      <Glass className="card-caption" refract={{ blur: 12, scale: 40, bezel: 18 }}>
        <div className="card-text">
          <h3>{p.title}{p.subtitle && <span> {p.subtitle}</span>}</h3>
          <p>{p.status}{count ? ` · ${count} images` : ''}</p>
        </div>
        <span className="card-plus" aria-hidden="true"><Plus size={18} stroke={2.2} /></span>
      </Glass>
      <button className="card-hit" onClick={() => onOpen(p, 0)} aria-label={`Open ${p.title}${p.subtitle ? ` ${p.subtitle}` : ''}`} />
    </article>
  );
}

export default function Work({ reduced, onOpen }) {
  const [cat, setCat] = useState('all');
  const items = useMemo(() => layout(PROJECTS.filter((p) => cat === 'all' || p.category === cat)), [cat]);
  return (
    <section className="work section-dark" id="work" data-tone="dark">
      <div className="wrap">
        <header className="section-head reveal">
          <p className="eyebrow">Selected work</p>
          <h2 className="headline">Ten projects across<br />mobile, PC, VR and AR.</h2>
          <p className="section-sub">Shipped games, studio productions and client work. Open any project for the full gallery and my role on it.</p>
        </header>
        <div className="work-filter">
          <Segmented value={cat} onChange={setCat} options={CATEGORIES} />
        </div>
        <div className="grid" key={cat}>
          {items.map(([p, span]) => <Card key={p.id} p={p} span={span} reduced={reduced} onOpen={onOpen} />)}
        </div>
      </div>
    </section>
  );
}
