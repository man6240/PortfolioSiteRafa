import { useEffect, useState } from 'react';
import { Glass } from '../glass/LiquidGlass.jsx';
import { SITE, PROJECTS, HERO, STATS } from '../content.js';

const byId = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));
const SLIDES = HERO.map(([id, i]) => ({ p: byId[id], i, src: byId[id].shots[i] }));

export default function Hero({ reduced, onOpen }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setN((v) => (v + 1) % SLIDES.length), 6000);
    return () => clearInterval(id);
  }, [reduced]);
  const now = SLIDES[n];

  return (
    <section className="hero" id="top" data-tone="dark">
      <div className="hero-stage">
        <div className="hero-media" aria-hidden="true">
          {SLIDES.map((s, k) => (
            <img key={k} src={s.src} alt="" className={k === n ? 'on' : ''} decoding="async" fetchpriority={k === 0 ? 'high' : 'low'} />
          ))}
        </div>
        <div className="hero-scrim" aria-hidden="true" />
  
        <div className="hero-content wrap">
          <Glass className="chip" variant="clear">
            <span className="status-dot" aria-hidden="true" />Available for freelance
          </Glass>
          <p className="hero-name">{SITE.name}</p>
          <h1 className="hero-title">Worlds that<br />tell stories.</h1>
          <p className="hero-lede">Level design, environment art and technical art for games, VR and AR. Based in {SITE.location}, working with teams anywhere.</p>
          <div className="actions">
            <a className="btn btn-primary" href="#work">See the work</a>
            <Glass as="a" variant="clear" className="btn btn-glass" href="#contact">Start a project</Glass>
          </div>
        </div>
  
        <div className="hero-foot wrap">
          <Glass as="button" variant="clear" className="now-showing" onClick={() => onOpen(now.p, now.i)} aria-label={`Now showing ${now.p.title}. Open project`}>
            <span className="now-label">Now showing</span>
            <span className="now-title">{now.p.title}{now.p.subtitle ? `: ${now.p.subtitle}` : ''}</span>
            <span className="now-dots" aria-hidden="true">
              {SLIDES.map((_, k) => <i key={k} className={k === n ? 'on' : ''} />)}
            </span>
          </Glass>
      </div>
      </div>

      <div className="stats wrap" role="list">
        {STATS.map((s) => (
          <div key={s.label} className="stat" role="listitem">
            <strong>{s.value}</strong><span>{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
