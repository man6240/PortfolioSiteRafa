import { useEffect, useRef } from 'react';
import { animate, createDrawable, stagger } from 'animejs';
import { PhoneFrame, LiveScreen, Slideshow } from './Devices.jsx';
import { ArrowUpRight } from './Icons.jsx';
import { prefersReduced } from '../motion.js';

/* The site's visual language: every section is a "scene" panel. Crop marks frame it, a mono bar
   runs along the top, big grotesque words sit around a floating object, and callout tags pop in
   with leader lines. Featured projects use the default export; the hero, sections and contact
   reuse the pieces below. */

export function Crops() {
  return ['tl', 'tr', 'bl', 'br'].map((c) => <span key={c} className={`crop ${c}`} aria-hidden="true" />);
}

/* Callout frames pop in and their leader lines draw, once, when the scene is well in view. */
export function useCallouts(root, { threshold = 0.4, delay = 350 } = {}) {
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReduced()) return;
    const frames = el.querySelectorAll('.tag-frame');
    const lines = el.querySelectorAll('.tag-line path');
    if (!frames.length) return;
    frames.forEach((f) => { f.style.opacity = 0; });
    const drawables = lines.length ? createDrawable(lines, 0, 0) : [];
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      animate(frames, { opacity: [0, 1], scale: [0.85, 1], duration: 700, delay: stagger(240, { start: delay + 150 }), ease: 'outBack(1.6)' });
      if (drawables.length) animate(drawables, { draw: ['0 0', '0 1'], duration: 600, delay: stagger(240, { start: delay }), ease: 'inOutQuad' });
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [root, threshold, delay]);
}

/* A little depth: floating objects and words drift apart as the pointer moves (fine pointers only). */
export function usePointerDepth(root) {
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReduced() || !window.matchMedia('(pointer: fine)').matches) return;
    let raf = 0;
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => { el.style.setProperty('--mx', x.toFixed(3)); el.style.setProperty('--my', y.toFixed(3)); });
    };
    const leave = () => { el.style.setProperty('--mx', 0); el.style.setProperty('--my', 0); };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); cancelAnimationFrame(raf); };
  }, [root]);
}

/* Callout tags. `side` puts the leader line on the tag's right ('r') or left ('l'). */
export function Tag({ children, side = 'l', className = '' }) {
  return (
    <div className={`scene-tag ${side === 'r' ? 'line-r' : 'line-l'} ${className}`} aria-hidden="true">
      <svg className="tag-line" viewBox="0 0 100 60" preserveAspectRatio="none">
        <path d={side === 'r' ? 'M0 60 L40 60 L100 0' : 'M100 60 L60 60 L0 0'} />
      </svg>
      <span className="tag-frame"><span className="tag-box">{children}</span></span>
    </div>
  );
}

/* ---- decor ---- */

// Simple flags that read at bunting size: stripes only.
const FLAGS = [
  { v: ['#009246', '#fff', '#CE2B37'] }, { h: ['#fff', '#74ACDF', '#fff'] }, { v: ['#0055A4', '#fff', '#EF4135'] },
  { h: ['#000', '#DD0000', '#FFCE00'] }, { v: ['#169B62', '#fff', '#FF883E'] }, { h: ['#FCD116', '#003893', '#CE1126'], w: [2, 1, 1] },
  { v: ['#008751', '#fff', '#008751'] }, { h: ['#AE1C28', '#fff', '#21468B'] }, { v: ['#002B7F', '#FCD116', '#CE1126'] },
  { h: ['#AA151B', '#F1BF00', '#AA151B'], w: [1, 2, 1] }, { v: ['#000', '#FDDA24', '#EF3340'] }, { h: ['#fff', '#D52B1E'] },
  { v: ['#D91023', '#fff', '#D91023'] }, { h: ['#0057B7', '#FFD700'] },
];

function Flag({ f, x, y, rot, delay }) {
  const W = 30, H = 22;
  const bands = f.v || f.h;
  const weights = f.w || bands.map(() => 1);
  const total = weights.reduce((a, b) => a + b, 0);
  let at = 0;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <g className="bunt-flag" style={{ animationDelay: `${delay}s` }}>
        <line x1="0" y1="0" x2="0" y2="4" stroke="rgba(255,255,255,.5)" strokeWidth="1" />
        {bands.map((c, i) => {
          const size = (weights[i] / total) * (f.v ? W : H);
          const r = f.v
            ? <rect key={i} x={-W / 2 + at} y="4" width={size + 0.3} height={H} fill={c} />
            : <rect key={i} x={-W / 2} y={4 + at} width={W} height={size + 0.3} fill={c} />;
          at += size;
          return r;
        })}
      </g>
    </g>
  );
}

function Bunting() {
  const n = FLAGS.length, W = 1200;
  const yAt = (x) => 18 + 34 * (1 - Math.pow((x - W / 2) / (W / 2), 2));
  return (
    <svg className="bunting" viewBox={`0 0 ${W} 90`} preserveAspectRatio="none" aria-hidden="true">
      <path d={`M0 18 Q ${W / 2} ${18 + 68} ${W} 18`} fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="1.2" />
      {FLAGS.map((f, i) => {
        const x = ((i + 0.5) / n) * W;
        const slope = ((-68 * 2 * (x - W / 2)) / ((W / 2) * (W / 2))) * 0.5;
        return <Flag key={i} f={f} x={x} y={yAt(x)} rot={Math.atan(slope) * -57} delay={-(i * 0.37) % 3} />;
      })}
    </svg>
  );
}

// [left %, top %, colour, shape]
const BITS = [
  [8, 22, '#FFD34E', 0], [16, 64, '#4FD1C5', 1], [24, 38, '#E0508A', 2], [31, 80, '#8B7CFF', 0],
  [44, 18, '#4FD1C5', 1], [58, 72, '#FFD34E', 2], [66, 28, '#E0508A', 0], [74, 56, '#FF8A3D', 1],
  [83, 20, '#8B7CFF', 2], [90, 70, '#4FD1C5', 0], [12, 88, '#FF8A3D', 1], [52, 90, '#E0508A', 2],
  [36, 12, '#FFD34E', 1], [94, 40, '#E0508A', 0], [4, 50, '#8B7CFF', 1], [70, 88, '#FFD34E', 0],
];

export function Decor({ kind, layer }) {
  if (!kind) return null;
  const bits = layer === 'back' ? BITS.slice(0, 8) : BITS.slice(8);
  if (kind === 'bunting' || kind === 'confetti') {
    return (
      <>
        {kind === 'bunting' && layer === 'front' && <Bunting />}
        <div className={`confetti ${layer}`} aria-hidden="true">
          {bits.slice(0, 6).map(([x, y, c, s], i) => <i key={i} className={`c${s}`} style={{ left: `${x}%`, top: `${y}%`, background: c, animationDelay: `${-i * 1.9}s` }} />)}
        </div>
      </>
    );
  }
  // embers rise from below; motes hang in the light
  return (
    <div className={`particles ${kind} ${layer}`} aria-hidden="true">
      {bits.map(([x, y], i) => <i key={i} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${-i * 1.3}s`, animationDuration: `${9 + (i % 5) * 2}s` }} />)}
    </div>
  );
}

/* ---- a featured project ---- */

export default function Scene({ p, index, total, onOpen, reduced }) {
  const root = useRef(null);
  useCallouts(root);
  usePointerDepth(root);
  const { words, tags, colors, decor } = p.scene;
  const phone = Boolean(p.frame === 'phone' || p.live);
  const vars = { '--s-base': colors.base, '--s-deep': colors.deep, '--s-glow': colors.glow };
  const title = `${p.title}${p.subtitle ? ` ${p.subtitle}` : ''}`;
  const count = p.shots.length;

  const media = p.live
    ? <LiveScreen reduced={reduced} />
    : count > 1 ? <Slideshow shots={p.shots} reduced={reduced} interval={phone ? 4200 : 5200} /> : <img src={p.shots[0]} alt="" loading="lazy" decoding="async" />;

  return (
    <article className={`scene panel ${phone ? 'scene-phone' : 'scene-screen'} reveal`} style={vars} ref={root}>
      <div className="scene-bg" aria-hidden="true" />
      {!phone && <div className="scene-backdrop" aria-hidden="true"><img src={p.shots[1] || p.shots[0]} alt="" loading="lazy" decoding="async" /></div>}
      <Decor kind={decor} layer="back" />
      <Crops />

      <div className="scene-bar">
        <span>{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
        <span className="scene-bar-mid">{p.kind}</span>
        <span className="scene-bar-end"><i className={`status-dot ${p.status === 'In development' ? 'wip' : ''}`} aria-hidden="true" />{p.status}<span className="scene-plat"> · {p.platforms}</span></span>
      </div>

      <p className="scene-word w1" aria-hidden="true">{words[0]}</p>
      <p className="scene-word w2" aria-hidden="true">{words[1]}</p>

      <button className="scene-hero" onClick={() => onOpen(p, 0)} aria-label={`Open ${title} gallery`}>
        <span className="scene-float">
          {phone ? <PhoneFrame>{media}</PhoneFrame> : <span className="screen-frame">{media}</span>}
        </span>
      </button>

      <p className="scene-word w3" aria-hidden="true">{words[2]}</p>

      <Tag side="r" className="t1">{tags[0]}</Tag>
      <Tag side="l" className="t2">{tags[1]}</Tag>
      <Tag side="l" className="t3">{tags[2]}</Tag>

      <Decor kind={decor} layer="front" />

      <div className="scene-foot">
        <h3 className="scene-title">{title}</h3>
        <p className="scene-copy">{p.summary}</p>
        <p className="scene-copy dim">My role: {p.role}</p>
        <ul className="sr-only">{tags.map((t) => <li key={t}>{t}</li>)}</ul>
        <button className="box-btn" onClick={() => onOpen(p, 0)}>
          {count > 1 ? `Open gallery · ${count}` : 'View project'}<ArrowUpRight size={15} stroke={2} />
        </button>
      </div>
    </article>
  );
}
