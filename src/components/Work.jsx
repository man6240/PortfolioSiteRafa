import { useState } from 'react';
import { Glass } from '../glass/LiquidGlass.jsx';
import { Plus, ChevronRight } from './Icons.jsx';
import { PROJECTS } from '../content.js';
import { PhoneFrame, LiveScreen } from './Devices.jsx';
import Scene, { Crops } from './Scene.jsx';

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
      <Crops />
      <span className="card-tag tag-box">{p.kind}</span>
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
  const toggle = () => {
    setMore((v) => !v);
    if (more) document.getElementById('more-toggle')?.scrollIntoView({ block: 'center' });
  };

  return (
    <section className="work section" id="work" data-tone="dark">
      <div className="wrap">
        <header className="sec-head reveal">
          <div className="sec-bar"><span>Selected work</span><span>{String(FEATURED.length).padStart(2, '0')} featured · {String(MORE.length).padStart(2, '0')} more</span></div>
          <h2 className="sec-title"><span>Worlds</span> <span className="dim">I’ve built</span></h2>
        </header>

        <div className="scenes">
          {FEATURED.map((p, i) => <Scene key={p.id} p={p} index={i} total={FEATURED.length} reduced={reduced} onOpen={onOpen} />)}
        </div>

        <div className="more">
          <button id="more-toggle" className="box-btn ghost" aria-expanded={more} aria-controls="more-work" onClick={toggle}>
            {more ? 'Show less' : `More work · ${MORE.length} projects`}
            <ChevronRight size={16} stroke={2.2} className={`more-chevron ${more ? 'up' : ''}`} />
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
