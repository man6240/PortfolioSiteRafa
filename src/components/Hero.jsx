import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, createTimeline, createScope, onScroll, stagger, utils } from 'animejs';
import { Glass } from '../glass/LiquidGlass.jsx';
import { splitWords, prefersReduced } from '../motion.js';
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
  const root = useRef(null);

  // Intro: the headline rises word by word, then the rest of the copy follows it in.
  // Runs before first paint so nothing flashes in its final position.
  useLayoutEffect(() => {
    if (prefersReduced()) return;
    const scope = createScope({ root }).add(() => {
      const follow = ['.hero-content .chip', '.hero-name', '.hero-lede', '.hero-content .actions > *', '.now-showing'];
      const words = splitWords(root.current.querySelector('.hero-title'));
      utils.set(follow, { opacity: 0, translateY: 16 });
      utils.set(words, { translateY: '110%' });
      createTimeline({ defaults: { ease: 'outExpo', duration: 1100 } })
        .add('.hero-content .chip', { opacity: 1, translateY: 0, delay: 150 })
        .add('.hero-name', { opacity: 1, translateY: 0 }, '-=950')
        .add(words, { translateY: '0%', duration: 1300, delay: stagger(90) }, '-=1000')
        .add('.hero-lede', { opacity: 1, translateY: 0 }, '-=900')
        .add('.hero-content .actions > *', { opacity: 1, translateY: 0, delay: stagger(80) }, '-=950')
        .add('.now-showing', { opacity: 1, translateY: 0 }, '-=900');

      // Parallax: as the hero scrolls away the image drifts slower than the page
      // and the copy lifts and fades, like a layer further back.
      const sync = () => onScroll({ target: root.current.querySelector('.hero-stage'), enter: 'top top', leave: 'top bottom', sync: true });
      animate('.hero-media', { translateY: ['0%', '22%'], scale: [1, 1.06], ease: 'linear', autoplay: sync() });
      animate('.hero-content', { translateY: [0, -60], opacity: [1, 0.2], ease: 'linear', autoplay: sync() });
    });
    return () => scope.revert();
  }, []);

  return (
    <section className="hero" id="top" data-tone="dark" ref={root}>
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
          <p className="hero-name">{SITE.name} · Freelance game designer</p>
          <h1 className="hero-title">Worlds that<br />tell stories.</h1>
          <p className="hero-lede">Game design, level design and Unreal Engine development, plus environment and technical art, for PC, mobile, VR and AR. Based in {SITE.location}, working with teams anywhere.</p>
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

      <div className="stats wrap reveal" role="list">
        {STATS.map((s) => (
          <div key={s.label} className="stat" role="listitem">
            <strong data-count>{s.value}</strong><span>{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
