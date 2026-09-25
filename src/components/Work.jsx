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

/* A featured project fills the width: copy on one side, the work on the other, alternating.
   Phone projects sit on a saturated panel in their own colours with the phones bleeding off
   the bottom edge. Landscape projects put the screenshot itself behind the whole panel. */
function Feature({ p, index, total, reduced, onOpen }) {
  const phone = portrait(p);
  const flip = index % 2 === 1;
  const vars = { '--accent': p.palette[0], '--light': p.palette[1], '--deep': p.palette[2] };
  if (p.panel) Object.assign(vars, { '--from': p.panel[0], '--to': p.panel[1], '--on': p.panel[2] });
  const [shot, setShot] = useState(0);
  useEffect(() => {
    if (phone || reduced || p.shots.length < 2) return;
    const id = setInterval(() => setShot((v) => (v + 1) % p.shots.length), 5600);
    return () => clearInterval(id);
  }, [phone, reduced, p.shots.length]);

  return (
    <article className={`feat ${phone ? 'feat-phone' : 'feat-screen'} ${flip ? 'flip' : ''} reveal`} style={vars}>
      {!phone && (
        <div className="feat-bg" aria-hidden="true">
          {p.shots.map((src, k) => <img key={k} src={src} className={k === shot ? 'on' : ''} alt="" loading="lazy" decoding="async" />)}
        </div>
      )}
      <div className="feat-info">
        <p className="feat-index"><span>{String(index + 1).padStart(2, '0')}</span> / {String(total).padStart(2, '0')}</p>
        <p className="feat-kind">{p.kind}</p>
        <h3 className="feat-title">{p.title}{p.subtitle && <span>{p.subtitle}</span>}</h3>
        <p className="feat-summary">{p.summary}</p>
        <dl className="feat-meta">
          <div><dt>Status</dt><dd>{p.status}</dd></div>
          <div><dt>Platforms</dt><dd>{p.platforms}</dd></div>
          <div className="wide"><dt>My role</dt><dd>{p.role}</dd></div>
        </dl>
        <button className="btn btn-feat" onClick={() => onOpen(p, phone ? 0 : shot)}>
          {p.shots.length ? `Open gallery · ${p.shots.length}` : 'View project'}<ArrowUpRight size={16} stroke={2.2} />
        </button>
      </div>

      <div className="feat-media">
        {phone ? (
          <button className="feat-phones" onClick={() => onOpen(p, 0)} aria-label={`Open ${fullTitle(p)} gallery`}>
            {p.live ? (
              <PhoneFrame className="ph-main"><LiveScreen reduced={reduced} /></PhoneFrame>
            ) : (
              <>
                <PhoneFrame className="ph-back" src={p.shots[1] || p.shots[0]} />
                <PhoneFrame className="ph-main"><Slideshow shots={p.shots} reduced={reduced} /></PhoneFrame>
              </>
            )}
          </button>
        ) : (
          <Glass className="feat-rail" variant="clear" refract={{ blur: 6, scale: 32, bezel: 14 }}>
            {p.shots.map((src, k) => (
              <button key={k} className={k === shot ? 'on' : ''} onClick={() => onOpen(p, k)} aria-label={`Open image ${k + 1} of ${p.shots.length}`}>
                <img src={src} alt="" loading="lazy" decoding="async" />
              </button>
            ))}
          </Glass>
        )}
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
          <p className="section-sub">Shipped games, VR and AR for studios and clients. Five highlights here, more below.</p>
        </header>

        <div className="feats">
          {FEATURED.map((p, i) => p.scene
            ? <Scene key={p.id} p={p} index={i} total={FEATURED.length} onOpen={onOpen} />
            : <Feature key={p.id} p={p} index={i} total={FEATURED.length} reduced={reduced} onOpen={onOpen} />)}
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
