import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { animate, createTimeline, createScope, onScroll, stagger, utils } from 'animejs';
import { Glass } from '../glass/LiquidGlass.jsx';
import { prefersReduced } from '../motion.js';
import { SITE, PROJECTS, HERO, STATS } from '../content.js';

/* The hero: "Rafael" and "Vitriago" in giant type, a studio display over the first name and an
   iPhone over the last, each rotating through the work (a plain crossfade, the devices themselves stay put). The display is drawn in CSS; the phone is
   Apple's iPhone 17 Pro frame (public/hero) over the screenshot. */

const byId = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));
const slide = (s) => ({ ...s, p: byId[s.id], label: s.label || byId[s.id].title, video: s.shot === 'video', src: s.shot === 'video' ? null : byId[s.id].shots[s.shot] });
const MONITOR = HERO.monitor.map(slide);
const PHONE = HERO.phone.map(slide);
const FRAMES = [...new Set(PHONE.map((s) => s.frame))];
const HOLD = 5200; // each screen stays this long; the phone changes halfway between the display's changes

function Screens({ slides, now, video }) {
  return slides.map((s, k) => (s.video
    ? <video key={k} ref={video} className={k === now ? 'on' : ''} muted loop playsInline autoPlay preload="metadata" aria-hidden="true">
        <source src="/hero/flag-fiesta.mp4" type="video/mp4" />
        <source src="/hero/flag-fiesta.webm" type="video/webm" />
      </video>
    : <img key={k} className={k === now ? 'on' : ''} src={s.src} alt="" decoding="async" fetchpriority={k === 0 ? 'high' : 'low'} loading={k === 0 ? 'eager' : 'lazy'} />));
}

export default function Hero({ onOpen }) {
  const root = useRef(null);
  const video = useRef(null);
  const [m, setM] = useState(0);
  const [p, setP] = useState(0);

  // Rotation: the display and the phone take turns, so only one changes at a time.
  useEffect(() => {
    if (prefersReduced()) return;
    let t2;
    const t1 = setInterval(() => setM((v) => (v + 1) % MONITOR.length), HOLD);
    const half = setTimeout(() => { t2 = setInterval(() => setP((v) => (v + 1) % PHONE.length), HOLD); }, HOLD / 2);
    return () => { clearInterval(t1); clearInterval(t2); clearTimeout(half); };
  }, []);

  // The gameplay clip only plays while it's on screen.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (PHONE[p].video) v.play().catch(() => {}); else v.pause();
  }, [p]);

  // Depth: on a mouse, the two devices drift a little in opposite directions.
  useEffect(() => {
    const el = root.current;
    if (prefersReduced() || !window.matchMedia('(pointer: fine)').matches) return;
    let raf = 0;
    const move = (e) => {
      const x = e.clientX / window.innerWidth - 0.5, y = e.clientY / window.innerHeight - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => { el.style.setProperty('--mx', x.toFixed(3)); el.style.setProperty('--my', y.toFixed(3)); });
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => { window.removeEventListener('pointermove', move); cancelAnimationFrame(raf); };
  }, []);

  // Intro: the names rise from behind their lines, the devices drop in, the rest follows.
  // Runs before first paint so nothing flashes in its final position.
  useLayoutEffect(() => {
    if (prefersReduced()) return;
    const scope = createScope({ root }).add(() => {
      const follow = ['.hx-lede', '.hx-actions > *', '.hx-now'];
      utils.set('.hx-word > span', { translateY: '105%' });
      utils.set(['.hx-display', '.hx-phone'], { opacity: 0, translateY: 60 });
      utils.set(follow, { opacity: 0, translateY: 16 });
      createTimeline({ defaults: { ease: 'outExpo', duration: 1300 } })
        .add('.hx-word > span', { translateY: '0%', delay: stagger(140, { start: 150 }) })
        .add('.hx-display', { opacity: 1, translateY: 0, duration: 1400 }, '-=900')
        .add('.hx-phone', { opacity: 1, translateY: 0, duration: 1400 }, '-=1150')
        .add(follow, { opacity: 1, translateY: 0, delay: stagger(70) }, '-=1000');

      // Parallax as the hero scrolls away: the art lifts a little faster than the page.
      const sync = () => onScroll({ target: root.current.querySelector('.hx-stage'), enter: 'top top', leave: 'top bottom', sync: true });
      animate('.hx-art', { translateY: [0, -50], ease: 'linear', autoplay: sync() });
    });
    return () => scope.revert();
  }, []);

  const mon = MONITOR[m], ph = PHONE[p];
  return (
    <section className="hero hx" id="top" data-tone="dark" ref={root} style={{ '--glow': mon.p.palette[0] }}>
      <div className="hx-stage">
        <div className="hx-art">
          <h1 className="hx-name">
            <span className="hx-word w1"><span>Rafael</span></span>{' '}
            <span className="hx-word w2"><span>Vitriago</span></span>
            <span className="sr-only"> · Freelance game designer</span>
          </h1>

          <button className="hx-device hx-display" onClick={() => onOpen(mon.p, mon.shot)} aria-label={`On the display: ${mon.label}. Open project`}>
            <span className="hx-settle">
              <span className="hx-panel"><span className="hx-screen"><Screens slides={MONITOR} now={m} /></span></span>
              <span className="hx-arm" /><span className="hx-foot" />
            </span>
          </button>

          <button className="hx-device hx-phone" onClick={() => onOpen(ph.p, ph.video ? 0 : ph.shot)} aria-label={`On the phone: ${ph.label}. Open project`}>
            <span className="hx-settle">
              <span className="hx-pscreen"><Screens slides={PHONE} now={p} video={video} /></span>
              {FRAMES.map((f) => <img key={f} className={`hx-frame ${f === ph.frame ? 'on' : ''}`} src={`/hero/iphone-17-pro-${f}.webp`} alt="" decoding="async" />)}
              <span className="hx-island" />
            </span>
          </button>
        </div>

        <div className="hx-copy">
          <p className="hx-lede">Freelance game designer: level design and Unreal Engine development, plus environment and technical art, for PC, mobile, VR and AR. Based in {SITE.location}.</p>
          <div className="actions hx-actions">
            <a className="btn btn-primary" href="#work">See the work</a>
            <Glass as="a" variant="clear" className="btn btn-glass" href="#contact">Start a project</Glass>
          </div>
        </div>

        <div className="hx-now" aria-live="polite">
          <b>Now playing</b>
          <button onClick={() => onOpen(mon.p, mon.shot)}>{mon.label} · {mon.tag}</button>
          <button onClick={() => onOpen(ph.p, ph.video ? 0 : ph.shot)}>{ph.label} · {ph.tag}</button>
          <span className="hx-dots" aria-hidden="true">{MONITOR.map((_, k) => <i key={k} className={k === m ? 'on' : ''} />)}</span>
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
