import { useEffect, useRef, useState } from 'react';
import { animate, createScope, onScroll } from 'animejs';
import { Glass } from '../glass/LiquidGlass.jsx';
import { Plus, ChevronRight, ArrowUpRight } from './Icons.jsx';
import { PROJECTS } from '../content.js';
import { makeFlagFiestaScreen } from '../flagFiesta.js';
import { prefersReduced } from '../motion.js';
import Scene from './Scene.jsx';

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

/* Phone projects are staged as scenes; the rest are image cards, and neighbouring cards share a row. */
const groups = FEATURED.reduce((out, p, index) => {
  if (p.scene) out.push({ scene: p, index });
  else if (out.length && out[out.length - 1].cards) out[out.length - 1].cards.push(p);
  else out.push({ cards: [p] });
  return out;
}, []);

export default function Work({ reduced, onOpen }) {
  const [more, setMore] = useState(false);
  const root = useRef(null);

  // Phones drift up a little faster than the page as their panel scrolls in.
  useEffect(() => {
    if (prefersReduced()) return;
    const scope = createScope({ root }).add(() => {
      root.current.querySelectorAll('.feat-phone').forEach((feat) => {
        animate(feat.querySelector('.feat-phones'), {
          translateY: [90, 0],
          ease: 'linear',
          autoplay: onScroll({ target: feat, enter: 'bottom top', leave: 'center center', sync: true }),
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
    <section className="work section" id="work" data-tone="dark" ref={root}>
      <div className="wrap">
        <header className="section-head split reveal">
          <div>
            <p className="eyebrow">Selected work</p>
            <h2 className="headline">Worlds I’ve built.</h2>
          </div>
          <p className="section-sub">Shipped games and VR for studios and clients. Four highlights here, more below.</p>
        </header>

        <div className="feats">
          {groups.map((g, i) => g.scene
            ? <Scene key={g.scene.id} p={g.scene} index={g.index} total={FEATURED.length} onOpen={onOpen} />
            : (
              <div key={i} className="grid feat-cards">
                {g.cards.map((p) => <Card key={p.id} p={p} span={g.cards.length > 1 ? 6 : 12} reduced={reduced} onOpen={onOpen} />)}
              </div>
            ))}
        </div>

        <div className="more">
          <button id="more-toggle" className="btn btn-outline" aria-expanded={more} aria-controls="more-work" onClick={toggle}>
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
