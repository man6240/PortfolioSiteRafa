import { useEffect, useRef, useState } from 'react';
import { Glass } from '../glass/LiquidGlass.jsx';
import { Star, Mail, Copy, Check, ArrowUpRight } from './Icons.jsx';
import { SITE, DISCIPLINES, TOOLS, EXPERIENCE, REVIEWS, ABOUT, PROJECTS } from '../content.js';

/* The second half of the page as one scroll-driven story.

   Desktop: a tall container with a pinned, full-screen stage. Chapters are stacked layers in
   the stage; the scroll position gives each one a local progress `--l` (about 0 as it arrives,
   1 as it leaves) and CSS turns that into crossfades, push-ins, letters flying in and lines
   drawing, all reversible. Phones and "Reduce motion": the chapters flow as ordinary
   full-height sections that animate in once, without pinning. */

const H = 1.1; // scroll length of one chapter, in viewport heights
const START = 0.35; // local progress of the first chapter when the stage pins

const shot = (id, i) => PROJECTS.find((p) => p.id === id).shots[i];
const pad = (n) => String(n).padStart(2, '0');

/* ---- small building blocks ---- */

/* A heading whose letters rise into place in sequence (and fly off again on the way out). */
function Letters({ text, as: Tag = 'h2', s = 0, step = 0.012, className = '' }) {
  let i = 0;
  return (
    <Tag className={`letters ${className}`} aria-label={text}>
      <span aria-hidden="true">
        {text.split(' ').map((word, w) => (
          <span key={w}>
            {w > 0 && ' '}
            <span className="lw">
              {[...word].map((ch) => <span key={i} className="ch" style={{ '--s': (s + step * i++).toFixed(3) }}>{ch}</span>)}
            </span>
          </span>
        ))}
      </span>
    </Tag>
  );
}

/* Anything that pops in at local progress `s`. */
function Pop({ s = 0, as: Tag = 'div', className = '', style, children, ...rest }) {
  return <Tag className={`pop ${className}`} style={{ ...style, '--s': s }} {...rest}>{children}</Tag>;
}

/* A thin callout line with a dot at the subject end and a pill label. */
function Callout({ s, x, y, dx = 90, dy = -50, children }) {
  const left = dx < 0;
  return (
    <Pop s={s} className={`callout ${left ? 'to-l' : 'to-r'}`} style={{ left: `${x}%`, top: `${y}%`, '--dx': `${dx}px`, '--dy': `${dy}px` }}>
      <i className="callout-dot" />
      <svg className="callout-line" width={Math.abs(dx)} height={Math.abs(dy) || 1} style={{ [left ? 'right' : 'left']: 0, [dy < 0 ? 'bottom' : 'top']: 0 }} aria-hidden="true">
        <path pathLength="1" d={
          (left ? `M${Math.abs(dx)} ` : 'M0 ') + (dy < 0 ? Math.abs(dy) : 0) + ' C ' +
          `${Math.abs(dx) / 2} ${dy < 0 ? Math.abs(dy) : 0} ${Math.abs(dx) / 2} ${dy < 0 ? 0 : Math.abs(dy)} ` +
          (left ? '0 ' : `${Math.abs(dx)} `) + (dy < 0 ? 0 : Math.abs(dy))
        } />
      </svg>
      <span className="callout-pill">{children}</span>
    </Pop>
  );
}

/* ---- graphics ---- */

/* An isometric greybox level, drawn from a list of boxes. */
const S = 30, CX = 500, CY = 150;
const iso = (x, y, z = 0) => [CX + (x - y) * 0.866 * S, CY + (x + y) * 0.5 * S - z * S];
const pt = (p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
function boxFaces(x, y, w, d, h) {
  const A = iso(x, y, h), B = iso(x + w, y, h), C = iso(x + w, y + d, h), D = iso(x, y + d, h);
  const B0 = iso(x + w, y), C0 = iso(x + w, y + d), D0 = iso(x, y + d);
  return [
    { f: 'top', d: `M${pt(A)} L${pt(B)} L${pt(C)} L${pt(D)} Z` },
    { f: 'right', d: `M${pt(B)} L${pt(C)} L${pt(C0)} L${pt(B0)} Z` },
    { f: 'left', d: `M${pt(D)} L${pt(C)} L${pt(C0)} L${pt(D0)} Z` },
  ];
}
const BOXES = [
  [1, 1, 3, 3, 0.3], [5, 0.5, 1, 4.5, 2.2], [10, 1, 2, 2, 4], [8, 6, 4, 3, 1.2],
  [6.2, 6.6, 0.8, 2, 0.4], [7, 6.6, 1, 2, 0.8], [2.6, 7, 1, 1, 0.8], [3.6, 9.2, 1.4, 1, 0.8], [13, 9.4, 1, 1, 3],
];
const PATH = [[2.5, 2.5, 0.35], [4.2, 5.4, 0], [6.6, 7.6, 0.45], [9.4, 7.6, 1.25], [11.6, 8.2, 1.25], [13.5, 11, 0]];
function Blockout() {
  const floor = [];
  for (let x = 0; x <= 15; x++) floor.push(`M${pt(iso(x, 0))} L${pt(iso(x, 12))}`);
  for (let y = 0; y <= 12; y++) floor.push(`M${pt(iso(0, y))} L${pt(iso(15, y))}`);
  const boxes = BOXES.map((b) => boxFaces(...b));
  const path = PATH.map((p) => iso(...p));
  return (
    <svg className="blockout" viewBox="0 0 1000 640" aria-hidden="true">
      <path className="bo-floor draw" pathLength="1" d={floor.join(' ')} style={{ '--s': 0.02 }} />
      {boxes.map((faces, k) => faces.map(({ f, d }) => (
        <path key={`${k}${f}`} className={`bo-face ${f} draw`} pathLength="1" d={d} style={{ '--s': (0.08 + k * 0.035).toFixed(3) }} />
      )))}
      <path className="bo-path draw" pathLength="1" d={`M${path.map(pt).join(' L')}`} style={{ '--s': 0.42 }} />
      {path.map((p, k) => <circle key={k} className="bo-node pop" cx={p[0]} cy={p[1]} r={k === path.length - 1 ? 7 : 4} style={{ '--s': (0.44 + k * 0.03).toFixed(3) }} />)}
    </svg>
  );
}

/* A jittered triangle mesh, laid over the render as its "wireframe". */
function Mesh() {
  const cols = 18, rows = 10, W = 1600, Hh = 900;
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5);
  const P = [];
  for (let r = 0; r <= rows; r++) {
    P.push([]);
    for (let c = 0; c <= cols; c++) {
      const edge = r === 0 || c === 0 || r === rows || c === cols;
      P[r].push([(c / cols) * W + (edge ? 0 : rnd() * 50), (r / rows) * Hh + (edge ? 0 : rnd() * 50)]);
    }
  }
  const seg = [];
  for (let r = 0; r <= rows; r++) for (let c = 0; c <= cols; c++) {
    const p = P[r][c];
    if (c < cols) seg.push(`M${pt(p)} L${pt(P[r][c + 1])}`);
    if (r < rows) seg.push(`M${pt(p)} L${pt(P[r + 1][c])}`);
    if (c < cols && r < rows) seg.push(`M${pt(p)} L${pt(P[r + 1][c + 1])}`);
  }
  return (
    <svg className="mesh" viewBox={`0 0 ${W} ${Hh}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <path d={seg.join(' ')} />
    </svg>
  );
}

/* Where the story has been: a dotted map with the moves drawn as arcs. */
const PLACES = [
  { name: 'Venezuela', x: 440, y: 530, lx: 16, ly: 6 },
  { name: 'Canada', x: 310, y: 160, lx: 16, ly: -8 },
  { name: 'United States', x: 150, y: 250, lx: 0, ly: 40, anchor: 'middle' },
  { name: 'Jaén, Spain', x: 1062, y: 222, lx: -16, ly: -14, anchor: 'end' },
];
function Journey() {
  const arc = (a, b, lift) => `M${a.x} ${a.y} Q ${(a.x + b.x) / 2} ${Math.min(a.y, b.y) - lift} ${b.x} ${b.y}`;
  const arcs = [arc(PLACES[0], PLACES[1], 90), arc(PLACES[1], PLACES[2], 60), arc(PLACES[2], PLACES[3], 180)];
  return (
    <svg className="journey" viewBox="0 0 1200 600" aria-hidden="true">
      <defs>
        <pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.4" /></pattern>
      </defs>
      <rect className="journey-dots" width="1200" height="600" fill="url(#dots)" />
      {arcs.map((d, k) => <path key={k} className="journey-arc draw" pathLength="1" d={d} style={{ '--s': (0.14 + k * 0.1).toFixed(2) }} />)}
      {PLACES.map((p, k) => (
        <g key={p.name} className="pop" style={{ '--s': (0.1 + k * 0.1).toFixed(2) }}>
          <circle className="journey-ring" cx={p.x} cy={p.y} r="14" />
          <circle className="journey-dot" cx={p.x} cy={p.y} r="6" />
          <text x={p.x + p.lx} y={p.y + p.ly} textAnchor={p.anchor || 'start'}>{p.name}</text>
        </g>
      ))}
    </svg>
  );
}

/* ---- the chapters ---- */

function ChapterLevel() {
  const d = DISCIPLINES[0];
  return (
    <>
      <div className="ch-bg blueprint" />
      <div className="art bo-art">
        <Blockout />
        <Callout s={0.5} x={73.4} y={35.2} dx={90} dy={-44}>Landmark</Callout>
        <Callout s={0.55} x={54.7} y={57.4} dx={110} dy={56}>Critical path</Callout>
        <Callout s={0.6} x={38.6} y={44.5} dx={-90} dy={-44}>Cover</Callout>
      </div>
      <div className="ch-copy">
        <Pop s={0} as="p" className="ch-kicker">What I do · 01 / 03</Pop>
        <Letters text="Level design." className="ch-title" s={0.02} />
        <Pop s={0.18} as="p" className="ch-body">{d.body}</Pop>
        <Pop s={0.24} as="p" className="ch-tools">{d.tools}</Pop>
      </div>
    </>
  );
}

function ChapterEnvironment() {
  const d = DISCIPLINES[1];
  return (
    <>
      <div className="ch-bg zoom">
        <img className="unlit" src={shot('idunn', 0)} alt="" loading="lazy" decoding="async" />
        <img className="lit" src={shot('idunn', 0)} alt="" loading="lazy" decoding="async" />
      </div>
      <div className="ch-shade left" />
      <div className="ch-copy">
        <Pop s={0} as="p" className="ch-kicker">What I do · 02 / 03</Pop>
        <Letters text="Environment art and lighting." className="ch-title" s={0.02} step={0.008} />
        <Pop s={0.2} as="p" className="ch-body">{d.body}</Pop>
        <Pop s={0.26} as="p" className="ch-tools">{d.tools}</Pop>
      </div>
      <Callout s={0.5} x={72} y={30} dx={-90} dy={-40}>Lumen lighting</Callout>
      <Callout s={0.56} x={80} y={60} dx={70} dy={40}>Set dressing</Callout>
      <Callout s={0.62} x={60} y={76} dx={-80} dy={30}>Materials</Callout>
    </>
  );
}

function ChapterTech() {
  const d = DISCIPLINES[2];
  return (
    <>
      <div className="ch-bg zoom scan">
        <img className="shaded" src={shot('vr', 0)} alt="" loading="lazy" decoding="async" />
        <Mesh />
      </div>
      <div className="ch-shade left" />
      <div className="ch-copy">
        <Pop s={0} as="p" className="ch-kicker">What I do · 03 / 03</Pop>
        <Letters text="Technical art, VR and AR." className="ch-title" s={0.02} step={0.009} />
        <Pop s={0.2} as="p" className="ch-body">{d.body}</Pop>
        <Pop s={0.3} as="p" className="ch-kicker small">Toolkit</Pop>
        <ul className="ch-chips">
          {TOOLS.map((t, i) => <Pop key={t} as="li" s={0.33 + i * 0.03}>{t}</Pop>)}
        </ul>
      </div>
      <Callout s={0.52} x={70} y={28} dx={80} dy={-36}>PCVR</Callout>
      <Callout s={0.58} x={78} y={52} dx={70} dy={30}>Standalone headsets</Callout>
      <Callout s={0.64} x={62} y={72} dx={-80} dy={32}>Phone GPUs</Callout>
    </>
  );
}

const STRIP = ['idunn', 'vr', 'kodex', 'archviz', 'vrtour', 'trailer'].flatMap((id) => PROJECTS.find((p) => p.id === id).shots.slice(0, 3));
function ChapterExperience() {
  return (
    <>
      <div className="ch-bg strips">
        {[0, 1].map((r) => (
          <div key={r} className={`strip r${r}`}>
            {(r ? [...STRIP].reverse() : STRIP).map((src, k) => <img key={k} src={src} alt="" loading="lazy" decoding="async" />)}
          </div>
        ))}
      </div>
      <div className="ch-shade full" />
      <div className="ch-copy wide st-exp">
        <div>
          <Pop s={0} as="p" className="ch-kicker">Experience</Pop>
          <Letters text="Studios, clients and shipped titles." className="ch-title" s={0.02} step={0.007} />
        </div>
        <ol className="roles">
          {EXPERIENCE.map((e, i) => (
            <Pop key={e.where} as="li" s={0.2 + i * 0.09}>
              <span className={`role-when ${i === 0 ? 'now' : ''}`}>{e.when}</span>
              <div>
                <h3>{e.role}</h3>
                <p className="role-where">{e.where}</p>
                <p className="role-body">{e.body}</p>
              </div>
            </Pop>
          ))}
        </ol>
      </div>
    </>
  );
}

function ChapterReviews() {
  return (
    <>
      <div className="ch-bg zoom warm"><img src={shot('vr', 1)} alt="" loading="lazy" decoding="async" /></div>
      <div className="ch-shade full" />
      <div className="ch-copy wide st-reviews">
        <div className="st-score">
          <Pop s={0} as="p" className="ch-kicker">Client reviews</Pop>
          <Letters as="p" text={REVIEWS.score} className="score-num" s={0.04} step={0.05} />
          <div className="score-stars" aria-label="5 out of 5 stars">
            {[0, 1, 2, 3, 4].map((k) => <Pop key={k} as="span" s={0.14 + k * 0.03}><Star size={22} /></Pop>)}
          </div>
          <Pop s={0.2} as="p" className="ch-body">{REVIEWS.jobs}, every one rated five stars.</Pop>
        </div>
        <div className="quotes">
          {REVIEWS.items.map((r, i) => (
            <Pop key={r.project} s={0.26 + i * 0.07}>
              <Glass as="figure" className="quote" refract={false}>
                <blockquote>“{r.quote}”</blockquote>
                <figcaption>{r.project}</figcaption>
              </Glass>
            </Pop>
          ))}
        </div>
      </div>
    </>
  );
}

function ChapterAbout() {
  return (
    <>
      <div className="ch-bg night" />
      <div className="art jr-art"><Journey /></div>
      <div className="ch-shade left" />
      <div className="ch-copy about">
        <Pop s={0} as="p" className="ch-kicker">About</Pop>
        <Letters text="Spaces that carry the narrative." className="ch-title" s={0.02} step={0.007} />
        {ABOUT.body.map((t, i) => <Pop key={i} s={0.2 + i * 0.07} as="p" className={`ch-body ${i ? 'dim' : ''}`}>{t}</Pop>)}
        <dl className="facts">
          {ABOUT.facts.map((f, k) => (
            <Pop key={k} s={0.36 + k * 0.05} className={f.label ? '' : 'cont'}>
              {f.label && <dt>{f.label}</dt>}
              <dd>{f.value}{f.sub && <span>{f.sub}</span>}</dd>
            </Pop>
          ))}
        </dl>
      </div>
    </>
  );
}

function ChapterContact() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SITE.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${SITE.email}`;
    }
  };
  return (
    <>
      <div className="ch-bg zoom fire"><img src={shot('trailer', 3)} alt="" loading="lazy" decoding="async" /></div>
      <div className="ch-shade full" />
      <div className="ch-copy center st-contact">
        <Pop s={0} as="p" className="ch-kicker">Contact</Pop>
        <Letters text="Let’s build worlds." className="ch-title xl" s={0.02} step={0.012} />
        <Pop s={0.22} as="p" className="ch-body">Have a level, a world or a VR build that needs a hand? I’m available for freelance and contract work, remotely, in English or Spanish.</Pop>
        <Pop s={0.3}><a className="contact-email" href={`mailto:${SITE.email}`}>{SITE.email}</a></Pop>
        <Pop s={0.36} className="contact-actions">
          <a className="btn btn-primary" href={`mailto:${SITE.email}`}><Mail size={18} />Email me</a>
          <Glass as="button" variant="clear" className="btn btn-glass" onClick={copy} aria-live="polite" refract={false}>
            {copied ? <><Check size={18} />Copied</> : <><Copy size={18} />Copy address</>}
          </Glass>
        </Pop>
        <Pop s={0.42} as="ul" className="contact-links">
          {SITE.links.map((l) => (
            <li key={l.label}>
              <Glass as="a" variant="clear" className="btn btn-glass btn-sm" href={l.href} target="_blank" rel="noreferrer" refract={false}>
                {l.label}<ArrowUpRight size={15} stroke={2} />
              </Glass>
            </li>
          ))}
        </Pop>
      </div>
    </>
  );
}

const CHAPTERS = [
  { key: 'level', C: ChapterLevel, anchor: 'services' },
  { key: 'environment', C: ChapterEnvironment },
  { key: 'tech', C: ChapterTech },
  { key: 'experience', C: ChapterExperience, anchor: 'experience' },
  { key: 'reviews', C: ChapterReviews, anchor: 'reviews' },
  { key: 'about', C: ChapterAbout, anchor: 'about' },
  { key: 'contact', C: ChapterContact, anchor: 'contact' },
];
const N = CHAPTERS.length;

export default function Story() {
  const root = useRef(null);

  useEffect(() => {
    const el = root.current;
    const layers = [...el.querySelectorAll('.chapter')];
    const marks = [...el.querySelectorAll('.story-mark')];
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let mode = '', raf = 0;

    // flow mode: the animated items and the progress range each one needs
    const sOf = (e) => parseFloat(e.style.getPropertyValue('--s')) || 0;
    const items = [...el.querySelectorAll('.pop, .letters, .art')]
      .filter((e) => e.classList.contains('art') || !e.closest('.art'))
      .map((e) => {
        if (e.classList.contains('art')) return { el: e, a: 0, b: 0.9 };
        if (e.classList.contains('letters')) {
          const ch = e.querySelectorAll('.ch');
          return { el: e, a: sOf(ch[0]), b: sOf(ch[ch.length - 1]) + 0.16 };
        }
        return { el: e, a: sOf(e), b: sOf(e) + 0.18 };
      });

    const layout = () => {
      const next = reduced.matches ? 'still' : (window.innerWidth < 900 || window.innerHeight < 620) ? 'flow' : 'pinned';
      if (next !== mode) {
        mode = next; el.dataset.mode = mode;
        if (mode !== 'flow') items.forEach(({ el: e }) => e.style.removeProperty('--l'));
      }
      const vh = window.innerHeight;
      // nav anchors: in pinned mode each sits where its chapter is fully on screen
      marks.forEach((m) => {
        const i = +m.dataset.i;
        if (mode === 'pinned') { m.style.top = `${(i + 0.1) * H * vh}px`; m.style.height = `${H * vh}px`; }
        else { m.style.top = `${layers[i].offsetTop}px`; m.style.height = `${layers[i].offsetHeight}px`; }
      });
      update();
    };

    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      if (mode === 'pinned') {
        const y = -el.getBoundingClientRect().top;
        const base = y / (H * vh) + START;
        layers.forEach((layer, i) => {
          const l = Math.max(-1.5, Math.min(2, base - i));
          layer.style.setProperty('--l', l.toFixed(4));
          layer.classList.toggle('live', l > -0.25 && (l < 1.1 || i === N - 1));
        });
      } else if (mode === 'flow') {
        layers.forEach((layer) => {
          const r = layer.getBoundingClientRect();
          const l = Math.max(-1, Math.min(0.75, ((vh - r.top) / vh) * 0.8 - 0.35));
          layer.style.setProperty('--l', l.toFixed(4));
          layer.classList.add('live');
        });
        // each item is timed by its own position, so content low in a tall chapter still animates in view
        items.forEach(({ el, a, b }) => {
          const p = Math.max(0, Math.min(1, (vh * 0.95 - el.getBoundingClientRect().top) / (vh * 0.35)));
          el.style.setProperty('--l', (a + p * (b - a)).toFixed(4));
        });
      } else {
        layers.forEach((layer) => { layer.style.setProperty('--l', '0.75'); layer.classList.add('live'); });
      }
    };

    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    layout();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', layout);
    reduced.addEventListener('change', layout);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', layout);
      reduced.removeEventListener('change', layout);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="story" ref={root} data-tone="dark" style={{ '--n': N, '--h': H, '--start': START }} aria-label="What I do, experience, reviews, about and contact">
      {CHAPTERS.filter((c) => c.anchor).map((c) => (
        <div key={c.anchor} id={c.anchor} className="story-mark" data-i={CHAPTERS.indexOf(c)} data-tone="dark" aria-hidden="true" />
      ))}
      <div className="story-stage">
        {CHAPTERS.map(({ key, C }, i) => (
          <article key={key} className={`chapter ch-${key} ${i === 0 ? 'live' : ''}`} style={{ '--l': i === 0 ? START : -1, zIndex: i + 1 }}>
            <C />
          </article>
        ))}
      </div>
    </section>
  );
}
