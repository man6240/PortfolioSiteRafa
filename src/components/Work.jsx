import { useEffect, useRef, useState } from 'react';
import { animate, createScope, onScroll } from 'animejs';
import { Glass } from '../glass/LiquidGlass.jsx';
import { Plus, ChevronRight } from './Icons.jsx';
import { PROJECTS } from '../content.js';
import { makeFlagFiestaScreen } from '../flagFiesta.js';
import { prefersReduced } from '../motion.js';

const FEATURED = PROJECTS.filter((p) => p.featured);
const MORE = PROJECTS.filter((p) => !p.featured);
const fullTitle = (p) => `${p.title}${p.subtitle ? ` ${p.subtitle}` : ''}`;

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
function Slideshow({ shots, reduced, interval = 4200 }) {
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

/* A featured project: centred copy, then one object (a phone or a framed screen) rising out
   of a dark, grainy panel tinted with the project's palette. The object is the focal point. */
function Showcase({ p, reduced, onOpen }) {
  const phone = portrait(p);
  const open = () => onOpen(p, 0);
  return (
    <article
      className={`show ${phone ? 'show-phone' : 'show-screen'}`}
      style={{ '--accent': p.palette[0], '--light': p.palette[1], '--deep': p.palette[2] }}
    >
      <header className="show-head reveal">
        <p className="eyebrow show-kind">{p.kind}</p>
        <h3 className="show-title">{p.title}{p.subtitle && <span>{p.subtitle}</span>}</h3>
        <p className="show-summary">{p.summary}</p>
        <button className="btn btn-dark" onClick={open}>
          View project<ChevronRight size={16} stroke={2.4} />
        </button>
      </header>
      <div className="show-stage reveal">
        <div className="show-panel" aria-hidden="true" />
        <button className="show-hero" onClick={open} aria-label={`Open ${fullTitle(p)} gallery`}>
          {phone ? (
            <PhoneFrame>{p.live ? <LiveScreen reduced={reduced} /> : <Slideshow shots={p.shots} reduced={reduced} />}</PhoneFrame>
          ) : (
            <Glass className="screen" variant="clear" refract={{ blur: 1, scale: 30, bezel: 12 }}>
              <Slideshow shots={p.shots} reduced={reduced} interval={5200} />
            </Glass>
          )}
        </button>
        <Glass className="chip show-chip" variant="clear">
          <span className={`status-dot ${p.status === 'In development' ? 'wip' : ''}`} aria-hidden="true" />
          {p.status} · {p.platforms}
        </Glass>
      </div>
    </article>
  );
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
      <button className="card-hit" onClick={() => onOpen(p, 0)} aria-label={`Open ${fullTitle(p)}`} />
    </article>
  );
}

export default function Work({ reduced, onOpen }) {
  const [more, setMore] = useState(false);
  const root = useRef(null);

  // The focal object drifts up a little faster than the page as its showcase scrolls in.
  useEffect(() => {
    if (prefersReduced()) return;
    const scope = createScope({ root }).add(() => {
      root.current.querySelectorAll('.show-stage').forEach((stage) => {
        animate(stage.querySelector('.show-hero'), {
          translateY: [70, 0],
          ease: 'linear',
          autoplay: onScroll({ target: stage, enter: 'bottom top', leave: 'center center', sync: true }),
        });
      });
    });
    return () => scope.revert();
  }, []);

  const toggle = () => {
    setMore((v) => !v);
    if (more) document.getElementById('more-toggle')?.scrollIntoView({ block: 'center' });
  };

  return (
    <section className="work section-white" id="work" data-tone="light" ref={root}>
      <div className="wrap">
        <header className="section-head centered reveal">
          <p className="eyebrow">Selected work</p>
          <h2 className="headline">Five projects,<br />up close.</h2>
          <p className="section-sub">Shipped games and VR and AR experiences, for studios and clients.</p>
        </header>

        <div className="showcases">
          {FEATURED.map((p) => <Showcase key={p.id} p={p} reduced={reduced} onOpen={onOpen} />)}
        </div>

        <div className="more">
          <button id="more-toggle" className="btn btn-soft" aria-expanded={more} aria-controls="more-work" onClick={toggle}>
            {more ? 'Show less' : `More work · ${MORE.length} projects`}
            <ChevronRight size={16} stroke={2.4} className={`more-chevron ${more ? 'up' : ''}`} />
          </button>
        </div>
        {more && (
          <div className="grid more-grid" id="more-work">
            {layout(MORE).map(([p, span]) => <Card key={p.id} p={p} span={span} reduced={reduced} onOpen={onOpen} />)}
          </div>
        )}
      </div>
    </section>
  );
}
