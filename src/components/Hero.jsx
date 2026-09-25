import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createTimeline, stagger, utils } from 'animejs';
import { SITE, PROJECTS, HERO, STATS } from '../content.js';
import { prefersReduced, splitWords } from '../motion.js';
import { ArrowUpRight } from './Icons.jsx';

const byId = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));
const SLIDES = HERO.map(([id, i]) => ({ p: byId[id], i, src: byId[id].shots[i] }));

/* A calm hero: headline and intro, then one wide render slideshow. */
export default function Hero({ reduced, onOpen }) {
  const [n, setN] = useState(0);
  const root = useRef(null);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setN((v) => (v + 1) % SLIDES.length), 6000);
    return () => clearInterval(id);
  }, [reduced]);
  const now = SLIDES[n];

  useLayoutEffect(() => {
    if (prefersReduced()) return;
    const el = root.current;
    const words = splitWords(el.querySelector('.hero-title'));
    const rest = el.querySelectorAll('.hero-meta, .hero-lede, .hero-actions > *, .hero-media');
    utils.set(words, { translateY: '110%' });
    utils.set(rest, { opacity: 0, translateY: 16 });
    const tl = createTimeline({ defaults: { ease: 'outExpo', duration: 1200 } })
      .add(words, { translateY: '0%', delay: stagger(70, { start: 120 }) })
      .add(rest, { opacity: 1, translateY: 0, delay: stagger(80) }, 350);
    return () => { tl.revert(); };
  }, []);

  return (
    <section className="hero" id="top" data-tone="dark" ref={root}>
      <div className="wrap">
        <p className="hero-meta">
          <span><i className="status-dot" aria-hidden="true" />Available for freelance</span>
          <span>{SITE.location}</span>
        </p>
        <div className="hero-head">
          <h1 className="hero-title">Worlds that tell stories.</h1>
          <div className="hero-side">
            <p className="hero-lede">I’m {SITE.name}, a level designer, environment artist and technical artist for games, VR and AR. Working remotely in English and Spanish.</p>
            <div className="hero-actions">
              <a className="box-btn" href="#work">See the work<ArrowUpRight size={15} stroke={2} /></a>
              <a className="box-btn ghost" href="#contact">Start a project</a>
            </div>
          </div>
        </div>

        <button className="hero-media" onClick={() => onOpen(now.p, now.i)} aria-label={`Open ${now.p.title}`}>
          <span className="hero-slides">
            {SLIDES.map((s, k) => <img key={k} src={s.src} className={k === n ? 'on' : ''} alt="" decoding="async" fetchpriority={k === 0 ? 'high' : 'low'} />)}
          </span>
          <span className="hero-caption">
            <span className="hero-caption-title"><span className="mono-label">Now showing</span>{now.p.title}{now.p.subtitle ? `: ${now.p.subtitle}` : ''}</span>
            <span className="now-dots" aria-hidden="true">{SLIDES.map((_, k) => <i key={k} className={k === n ? 'on' : ''} />)}</span>
          </span>
        </button>

        <div className="stats reveal" role="list">
          {STATS.map((s) => (
            <div key={s.label} className="stat" role="listitem">
              <strong data-count>{s.value}</strong>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
