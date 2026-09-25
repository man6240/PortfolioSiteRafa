import { useEffect, useRef } from 'react';
import { animate, createDrawable, stagger } from 'animejs';
import { PhoneFrame } from './Work.jsx';
import { ArrowUpRight } from './Icons.jsx';
import { prefersReduced } from '../motion.js';

/* A featured project staged like a product shot: the phone floats at the centre of a dark
   scene in the game's own colours, big words sit around it, and
   callout tags pop in with leader lines when the scene scrolls into view. */

// Simple flags that read at bunting size: stripes only.
const FLAGS = [
  { v: ['#009246', '#fff', '#CE2B37'] }, // Italy
  { h: ['#fff', '#74ACDF', '#fff'] }, // Argentina (simplified)
  { v: ['#0055A4', '#fff', '#EF4135'] }, // France
  { h: ['#000', '#DD0000', '#FFCE00'] }, // Germany
  { v: ['#169B62', '#fff', '#FF883E'] }, // Ireland
  { h: ['#FCD116', '#003893', '#CE1126'], w: [2, 1, 1] }, // Colombia
  { v: ['#008751', '#fff', '#008751'] }, // Nigeria
  { h: ['#AE1C28', '#fff', '#21468B'] }, // Netherlands
  { v: ['#002B7F', '#FCD116', '#CE1126'] }, // Romania
  { h: ['#AA151B', '#F1BF00', '#AA151B'], w: [1, 2, 1] }, // Spain
  { v: ['#000', '#FDDA24', '#EF3340'] }, // Belgium
  { h: ['#fff', '#D52B1E'] }, // Poland
  { v: ['#D91023', '#fff', '#D91023'] }, // Peru
  { h: ['#0057B7', '#FFD700'] }, // Ukraine
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
  // flags hang from a gentle catenary across the top of the panel
  const n = FLAGS.length, W = 1200;
  const yAt = (x) => 18 + 34 * (1 - Math.pow((x - W / 2) / (W / 2), 2));
  return (
    <svg className="bunting" viewBox={`0 0 ${W} 90`} preserveAspectRatio="none" aria-hidden="true">
      <path d={`M0 18 Q ${W / 2} ${18 + 68} ${W} 18`} fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="1.2" />
      {FLAGS.map((f, i) => {
        const x = ((i + 0.5) / n) * W;
        const slope = (-68 * 2 * (x - W / 2)) / ((W / 2) * (W / 2)) * 0.5;
        return <Flag key={i} f={f} x={x} y={yAt(x)} rot={Math.atan(slope) * -57} delay={-(i * 0.37) % 3} />;
      })}
    </svg>
  );
}

const CONFETTI = [
  [8, 22, '#FFD34E', 0], [16, 64, '#4FD1C5', 1], [24, 38, '#E0508A', 2], [31, 80, '#8B7CFF', 0],
  [44, 18, '#4FD1C5', 1], [58, 72, '#FFD34E', 2], [66, 28, '#E0508A', 0], [74, 56, '#FF8A3D', 1],
  [83, 20, '#8B7CFF', 2], [90, 70, '#4FD1C5', 0], [12, 88, '#FF8A3D', 1], [52, 90, '#E0508A', 2],
];

export default function Scene({ p, index, total, onOpen }) {
  const root = useRef(null);
  const { words, tags, colors, decor, shot = 0, variant = 'split' } = p.scene;
  // Which side of the phone each callout sits on; the stacked variant mirrors the split one.
  const sides = variant === 'stack' ? ['r', 'r', 'r'] : ['l', 'r', 'r'];
  const back = variant === 'stack' ? p.shots.find((_, k) => k !== shot && k !== 0) : null;
  const vars = { '--s-base': colors.base, '--s-deep': colors.deep, '--s-glow': colors.glow };

  // Callouts: frames pop in and leader lines draw, once, when the scene is well in view.
  useEffect(() => {
    const el = root.current;
    const frames = el.querySelectorAll('.tag-frame');
    const lines = el.querySelectorAll('.tag-line path');
    if (prefersReduced()) return;
    frames.forEach((f) => { f.style.opacity = 0; });
    const drawables = createDrawable(lines, 0, 0);
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      animate(frames, { opacity: [0, 1], scale: [0.85, 1], duration: 700, delay: stagger(260, { start: 500 }), ease: 'outBack(1.6)' });
      animate(drawables, { draw: ['0 0', '0 1'], duration: 600, delay: stagger(260, { start: 350 }), ease: 'inOutQuad' });
    }, { threshold: 0.45 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // A little depth: the phone and the words drift apart as the pointer moves.
  useEffect(() => {
    const el = root.current;
    if (prefersReduced() || !window.matchMedia('(pointer: fine)').matches) return;
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
  }, []);

  const title = `${p.title}${p.subtitle ? ` ${p.subtitle}` : ''}`;
  const foot = (
        <div className="scene-foot">
          <h3 className="scene-title">{title}</h3>
          <p className="scene-copy">{p.summary}</p>
          <p className="scene-copy dim">My role: {p.role}</p>
          <ul className="sr-only">{tags.map((t) => <li key={t}>{t}</li>)}</ul>
          <button className="scene-btn" onClick={() => onOpen(p, 0)}>
            {p.shots.length > 1 ? `Open gallery · ${p.shots.length}` : 'View project'}<ArrowUpRight size={15} stroke={2} />
          </button>
        </div>
  );
  return (
    <article className={`scene v-${variant} reveal`} style={vars} ref={root}>
      <div className="scene-bg" aria-hidden="true" />
      {decor === 'bunting' && <Bunting />}
      <div className="confetti back" aria-hidden="true">
        {CONFETTI.slice(0, 6).map(([x, y, c, s], i) => <i key={i} className={`c${s}`} style={{ left: `${x}%`, top: `${y}%`, background: c, animationDelay: `${-i * 1.7}s` }} />)}
      </div>

      <div className="scene-bar">
        <span>{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
        <span className="scene-bar-mid">{p.kind}</span>
        <span className="scene-bar-end"><i className={`status-dot ${p.status === 'In development' ? 'wip' : ''}`} aria-hidden="true" />{p.status}<span className="scene-plat"> · {p.platforms}</span></span>
      </div>

      {variant === 'stack' ? (
        <div className="stack-col">
          <p className="scene-stack" aria-hidden="true">{words.map((w, i) => <span key={w} className={`s${i + 1}`}>{w}</span>)}</p>
          {foot}
        </div>
      ) : (
        <>
          <p className="scene-word w1" aria-hidden="true">{words[0]}</p>
          <p className="scene-word w2" aria-hidden="true">{words[1]}</p>
        </>
      )}

      <button className="scene-hero" onClick={() => onOpen(p, shot)} aria-label={`Open ${title} gallery`}>
        {back && <span className="scene-float back"><PhoneFrame src={back} /></span>}
        <span className="scene-float"><PhoneFrame src={p.shots[shot] || p.shots[0]} alt={`${title}, ${p.kind.toLowerCase()} screenshot`} /></span>
      </button>

      {variant !== 'stack' && <p className="scene-word w3" aria-hidden="true">{words[2]}</p>}

      {tags.map((t, i) => (
        <div key={t} className={`scene-tag t${i + 1} on-${sides[i]}`} aria-hidden="true">
          <span className="tag-lead">
            <svg className="tag-line" viewBox="0 0 100 60" preserveAspectRatio="none">
              <path d={sides[i] === 'l' ? 'M0 60 C 55 60 50 0 100 0' : 'M100 60 C 45 60 50 0 0 0'} />
            </svg>
            <i className="tag-dot" />
          </span>
          <span className="tag-frame"><span className="tag-box">{t}</span></span>
        </div>
      ))}

      <div className="confetti front" aria-hidden="true">
        {CONFETTI.slice(6).map(([x, y, c, s], i) => <i key={i} className={`c${s}`} style={{ left: `${x}%`, top: `${y}%`, background: c, animationDelay: `${-i * 2.3}s` }} />)}
      </div>

      {variant !== 'stack' && foot}
    </article>
  );
}
