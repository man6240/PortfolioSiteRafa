import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createTimeline, stagger, utils } from 'animejs';
import { SITE, PROJECTS, HERO, STATS } from '../content.js';
import { prefersReduced } from '../motion.js';
import { Crops, Decor, Tag, useCallouts, usePointerDepth } from './Scene.jsx';
import { ArrowUpRight } from './Icons.jsx';

const byId = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));
const SLIDES = HERO.map(([id, i]) => ({ p: byId[id], i, src: byId[id].shots[i] }));
const VARS = { '--s-base': '#1B2A44', '--s-deep': '#070E1A', '--s-glow': '#5F82C9' };

/* The hero is a scene of its own: the renders cycle on a floating screen at the centre,
   the headline sits around it in the corners, and callouts name the three disciplines. */
export default function Hero({ reduced, onOpen }) {
  const [n, setN] = useState(0);
  const root = useRef(null);
  useCallouts(root, { threshold: 0.2, delay: 1100 });
  usePointerDepth(root);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setN((v) => (v + 1) % SLIDES.length), 6000);
    return () => clearInterval(id);
  }, [reduced]);
  const now = SLIDES[n];

  // Intro: the words rise into their corners, the screen settles in, then the details follow.
  useLayoutEffect(() => {
    if (prefersReduced()) return;
    const el = root.current;
    const words = el.querySelectorAll('.scene-word');
    const rest = el.querySelectorAll('.scene-bar, .scene-foot > *');
    const screen = el.querySelector('.screen-frame');
    utils.set(words, { opacity: 0, translateY: 60 });
    utils.set(rest, { opacity: 0, translateY: 14 });
    utils.set(screen, { opacity: 0, scale: 0.92 });
    const tl = createTimeline({ defaults: { ease: 'outExpo', duration: 1200 } })
      .add(words, { opacity: 1, translateY: 0, delay: stagger(120, { start: 100 }) })
      .add(screen, { opacity: 1, scale: 1, duration: 1400 }, 250)
      .add(rest, { opacity: 1, translateY: 0, delay: stagger(60) }, 600);
    return () => { tl.revert(); };
  }, []);

  return (
    <>
      <section className="hero scene panel scene-screen" id="top" data-tone="dark" style={VARS} ref={root}>
        <div className="scene-bg" aria-hidden="true" />
        <div className="scene-backdrop" aria-hidden="true">
          {SLIDES.map((s, k) => <img key={k} src={s.src} className={k === n ? 'on' : ''} alt="" decoding="async" />)}
        </div>
        <Decor kind="motes" layer="back" />
        <Crops />

        <div className="scene-bar">
          <span>{SITE.name} — Portfolio</span>
          <button className="scene-bar-mid now-showing" onClick={() => onOpen(now.p, now.i)}>
            <span className="now-label">Now showing</span>
            <span className="now-title">{now.p.title}{now.p.subtitle ? `: ${now.p.subtitle}` : ''}</span>
            <span className="now-dots" aria-hidden="true">{SLIDES.map((_, k) => <i key={k} className={k === n ? 'on' : ''} />)}</span>
          </button>
          <span className="scene-bar-end"><i className="status-dot" aria-hidden="true" />Available for freelance</span>
        </div>

        <h1 className="hero-words">
          <span className="scene-word w1">Worlds</span>{' '}
          <span className="scene-word w2">that tell</span>{' '}
          <span className="scene-word w3">stories</span>
        </h1>

        <button className="scene-hero" onClick={() => onOpen(now.p, now.i)} aria-label={`Open ${now.p.title}`}>
          <span className="scene-float">
            <span className="screen-frame">
              <span className="slides">
                {SLIDES.map((s, k) => <img key={k} src={s.src} className={k === n ? 'on' : ''} alt="" decoding="async" fetchpriority={k === 0 ? 'high' : 'low'} />)}
              </span>
            </span>
          </span>
        </button>

        <Tag side="r" className="t1">Level design</Tag>
        <Tag side="l" className="t2">Environment art & lighting</Tag>
        <Tag side="l" className="t3">Technical art · VR · AR</Tag>

        <Decor kind="motes" layer="front" />

        <div className="scene-foot">
          <p className="scene-title">{SITE.name}</p>
          <p className="scene-copy">Level design, environment art and technical art for games, VR and AR.</p>
          <p className="scene-copy dim">Based in {SITE.location} · Working in English and Spanish</p>
          <div className="box-row">
            <a className="box-btn" href="#work">See the work<ArrowUpRight size={15} stroke={2} /></a>
            <a className="box-btn ghost" href="#contact">Start a project</a>
          </div>
        </div>
      </section>

      <div className="stats wrap reveal" role="list">
        {STATS.map((s, i) => (
          <div key={s.label} className="stat" role="listitem">
            <span className="stat-idx">{String(i + 1).padStart(2, '0')}</span>
            <strong data-count>{s.value}</strong>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}
