import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, createTimeline, createScope, onScroll, stagger, utils } from 'animejs';
import { Glass } from '../glass/LiquidGlass.jsx';
import { splitWords, prefersReduced } from '../motion.js';
import { SITE, PROJECTS, HERO, STATS } from '../content.js';

const byId = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));
const slide = ([id, shot, tag, label]) => ({ p: byId[id], shot: shot === 'video' ? 0 : shot, video: shot === 'video', tag, label: label || byId[id].title });
const MONITOR = HERO.monitor.map(slide);
const PHONE = HERO.phone.map(slide);
const VIDEO = [['/hero/flag-fiesta.mp4', 'video/mp4'], ['/hero/flag-fiesta.webm', 'video/webm']];

function webgl() {
  try { const c = document.createElement('canvas'); return Boolean(c.getContext('webgl2')); } catch { return false; }
}

export default function Hero({ reduced, onOpen }) {
  const root = useRef(null);
  const canvas = useRef(null);
  const tagMonitor = useRef(null);
  const tagPhone = useRef(null);
  const [now, setNow] = useState({ m: 0, p: 0 });
  const [live, setLive] = useState(false);
  const [progress, setProgress] = useState(0);

  // The 3D stage starts loading straight away (main.jsx already requested its code); until it's ready,
  // and without WebGL, the poster render stands in with a small progress ring.
  useEffect(() => {
    if (!webgl()) { setLive(null); return; }
    let stop = null, cancelled = false;
    import('../hero3d.js').then(({ mountHero }) => {
      if (cancelled) return;
      stop = mountHero(canvas.current, {
        monitor: MONITOR.map((s) => ({ src: s.p.shots[s.shot] })),
        phone: PHONE.map((s) => (s.video ? { video: true, src: VIDEO } : { src: s.p.shots[s.shot] })),
        reduced,
        anchors: { monitor: tagMonitor.current, phone: tagPhone.current },
        box: root.current.querySelector('.hero-content'),
        onSlide: (m, p) => setNow({ m, p }),
        onProgress: (f) => setProgress(Math.round(f * 20) / 20),
        onReady: () => setLive(true),
      });
    });
    return () => { cancelled = true; stop?.(); };
  }, [reduced]);

  // Intro: the headline rises word by word, then the rest of the copy follows it in.
  // Runs before first paint so nothing flashes in its final position.
  useLayoutEffect(() => {
    if (prefersReduced()) return;
    const scope = createScope({ root }).add(() => {
      const follow = ['.hero-content .chip', '.hero-name', '.hero-lede', '.hero-content .actions > *'];
      const words = splitWords(root.current.querySelector('.hero-title'));
      utils.set(follow, { opacity: 0, translateY: 16 });
      utils.set(words, { translateY: '110%' });
      createTimeline({ defaults: { ease: 'outExpo', duration: 1100 } })
        .add('.hero-content .chip', { opacity: 1, translateY: 0, delay: 150 })
        .add('.hero-name', { opacity: 1, translateY: 0 }, '-=950')
        .add(words, { translateY: '0%', duration: 1300, delay: stagger(90) }, '-=1000')
        .add('.hero-lede', { opacity: 1, translateY: 0 }, '-=900')
        .add('.hero-content .actions > *', { opacity: 1, translateY: 0, delay: stagger(80) }, '-=950');

      // Parallax: as the hero scrolls away the stage drifts slower than the page
      // and the copy lifts and fades, like a layer further back.
      const sync = () => onScroll({ target: root.current.querySelector('.hero-stage'), enter: 'top top', leave: 'top bottom', sync: true });
      animate('.hero-media', { translateY: ['0%', '14%'], ease: 'linear', autoplay: sync() });
      animate('.hero-content', { translateY: [0, -60], opacity: [1, 0.2], ease: 'linear', autoplay: sync() });
    });
    return () => scope.revert();
  }, []);

  const m = MONITOR[now.m], p = PHONE[now.p];
  return (
    <section className={`hero ${live ? 'is-live' : live === null ? 'is-static' : ''}`} id="top" data-tone="dark" ref={root}>
      <div className="hero-stage">
        <div className="hero-media" aria-hidden="true">
          <img className="hero-poster" src="/hero/poster.jpg" alt="" fetchpriority="high" decoding="async" />
          <canvas className="hero-canvas" ref={canvas} />
        </div>
        <div className="hero-scrim" aria-hidden="true" />

        <div className="hero-content wrap">
          <div className="hero-top">
            <Glass className="chip" variant="clear">
              <span className="status-dot" aria-hidden="true" />Available for freelance
            </Glass>
            <h1 className="hero-name">{SITE.name} · Freelance game designer</h1>
            <p className="hero-title">Games for <br /><em>every screen.</em></p>
          </div>
          <div className="hero-bottom">
            <p className="hero-lede">Game design, level design and Unreal Engine development, plus environment and technical art, for PC, mobile, VR and AR. Based in {SITE.location}, working with teams anywhere.</p>
            <div className="actions">
              <a className="btn btn-primary" href="#work">See the work</a>
              <Glass as="a" variant="clear" className="btn btn-glass" href="#contact">Start a project</Glass>
            </div>
          </div>
        </div>

        {/* labels that follow the devices; the 3D stage positions them every frame */}
        <button ref={tagMonitor} className="hero-tag" onClick={() => onOpen(m.p, m.shot)} aria-label={`On the monitor: ${m.label}. Open project`}>
          <i>{m.tag}</i>{m.label}
        </button>
        <button ref={tagPhone} className="hero-tag" onClick={() => onOpen(p.p, p.shot)} aria-label={`On the phone: ${p.label}. Open project`}>
          <i>{p.tag}</i>{p.label}
        </button>
        <span className="hero-loader" aria-hidden="true" style={{ '--p': progress }}>
          <svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" /><circle className="arc" cx="10" cy="10" r="8" pathLength="1" /></svg>
          Loading the stage
        </span>
        <span className="hero-dots" aria-hidden="true">
          {MONITOR.map((_, k) => <i key={k} className={k === now.m ? 'on' : ''} />)}
        </span>
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
