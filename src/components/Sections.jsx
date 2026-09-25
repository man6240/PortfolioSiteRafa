import { useRef, useState } from 'react';
import { Glass } from '../glass/LiquidGlass.jsx';
import { LevelIcon, EnvironmentIcon, XrIcon, Star, Mail, Copy, Check, ArrowUpRight } from './Icons.jsx';
import { SITE, DISCIPLINES, TOOLS, EXPERIENCE, REVIEWS, ABOUT, PROJECTS } from '../content.js';
import { Crops, usePointerDepth } from './Scene.jsx';

const ICONS = { level: LevelIcon, environment: EnvironmentIcon, xr: XrIcon };
const shot = (id, i) => PROJECTS.find((p) => p.id === id).shots[i];
const pad = (n) => String(n).padStart(2, '0');

/* A section panel: the same frame as the project scenes (glow, grain, crop marks, mono bar). */
function Panel({ id, colors, bar, className = '', backdrop, children }) {
  const vars = { '--s-base': colors[0], '--s-deep': colors[1], '--s-glow': colors[2] };
  return (
    <section className="section" id={id} data-tone="dark">
      <div className="wrap">
        <div className={`panel plain ${className} reveal`} style={vars}>
          <div className="scene-bg" aria-hidden="true" />
          {backdrop && <div className="scene-backdrop sharp" aria-hidden="true"><img src={backdrop} alt="" loading="lazy" decoding="async" /></div>}
          <Crops />
          <div className="scene-bar">
            <span>{bar[0]}</span>
            <span className="scene-bar-mid">{bar[1]}</span>
            <span className="scene-bar-end">{bar[2]}</span>
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}

export function Services() {
  return (
    <Panel id="services" colors={['#1A2346', '#090D1D', '#7361E0']} bar={['What I do', `${pad(DISCIPLINES.length)} disciplines`, `${pad(TOOLS.length)} tools`]}>
      <h2 className="panel-title"><span>From blockout</span> <span className="dim">to final light</span></h2>
      <div className="disc-grid">
        {DISCIPLINES.map((d, i) => {
          const Icon = ICONS[d.icon];
          return (
            <article key={d.title} className="disc">
              <div className="disc-top">
                <span className="disc-num">{pad(i + 1)}</span>
                <span className="disc-icon"><Icon /></span>
              </div>
              <h3>{d.title}</h3>
              <p>{d.body}</p>
              <ul className="tag-list">{d.tools.split(', ').map((t) => <li key={t} className="tag-box">{t}</li>)}</ul>
            </article>
          );
        })}
      </div>
      <div className="toolkit">
        <span className="mono-label">Toolkit</span>
        <ul className="tag-list">{TOOLS.map((t) => <li key={t} className="tag-box ghost">{t}</li>)}</ul>
      </div>
    </Panel>
  );
}

export function Experience() {
  return (
    <Panel id="experience" colors={['#15303A', '#07121A', '#3FA3A0']} bar={['Experience', `${pad(EXPERIENCE.length)} roles`, 'Freelance · Studios · Clients']}>
      <div className="exp-grid">
        <h2 className="panel-title"><span>Studios,</span> <span>clients</span> <span className="dim">and shipped titles</span></h2>
        <ol className="timeline">
          {EXPERIENCE.map((e, i) => (
            <li key={e.where}>
              <span className={`tag-box ${i === 0 ? '' : 'ghost'}`}>{e.when}</span>
              <div>
                <h3>{e.role}</h3>
                <p className="where">{e.where}</p>
                <p className="body">{e.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Panel>
  );
}

export function Reviews() {
  return (
    <Panel id="reviews" className="reviews-panel" colors={['#3A2012', '#0E0704', '#E08A3C']} backdrop={shot('vr', 2)} bar={['Client reviews', 'Upwork', `${REVIEWS.score} / 5`]}>
      <div className="score">
        <strong>{REVIEWS.score}</strong>
        <div>
          <span className="stars" aria-label="5 out of 5 stars">{[0, 1, 2, 3, 4].map((k) => <Star key={k} size={22} />)}</span>
          <p className="scene-copy">{REVIEWS.jobs}, every one rated five stars.</p>
        </div>
      </div>
      <div className="review-grid">
        {REVIEWS.items.map((r, i) => (
          <Glass as="figure" key={r.project} className="review bracket reveal" refract={{ blur: 16, scale: 36, bezel: 20 }}>
            <span className="review-idx">{pad(i + 1)}</span>
            <blockquote>“{r.quote}”</blockquote>
            <figcaption>{r.project}</figcaption>
          </Glass>
        ))}
      </div>
    </Panel>
  );
}

export function About() {
  return (
    <Panel id="about" colors={['#2A1F3E', '#0C0914', '#B45C9C']} bar={['About', SITE.location, 'English · Spanish']}>
      <div className="about-grid">
        <div>
          <h2 className="panel-title"><span>Spaces that carry</span> <span className="dim">the narrative</span></h2>
          <div className="about-body">{ABOUT.body.map((t, i) => <p key={i}>{t}</p>)}</div>
        </div>
        <dl className="facts">
          {ABOUT.facts.map((f, k) => (
            <div key={k} className={f.label ? '' : 'cont'}>
              <dt>{f.label}</dt>
              <dd>{f.value}{f.sub && <span>{f.sub}</span>}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Panel>
  );
}

export function Contact() {
  const [copied, setCopied] = useState(false);
  const root = useRef(null);
  usePointerDepth(root);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SITE.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${SITE.email}`;
    }
  };
  const vars = { '--s-base': '#3A1A0C', '--s-deep': '#0D0503', '--s-glow': '#E0612E' };
  return (
    <section className="section" id="contact" data-tone="dark">
      <div className="wrap">
        <div className="scene panel contact-scene reveal" style={vars} ref={root}>
          <div className="scene-bg" aria-hidden="true" />
          <div className="scene-backdrop sharp" aria-hidden="true"><img src={shot('trailer', 3)} alt="" loading="lazy" decoding="async" /></div>
          <Crops />
          <div className="scene-bar">
            <span>Contact</span>
            <span className="scene-bar-mid">Freelance & contract</span>
            <span className="scene-bar-end"><i className="status-dot" aria-hidden="true" />Available now</span>
          </div>

          <p className="scene-word w1" aria-hidden="true">Let’s</p>
          <p className="scene-word w2" aria-hidden="true">build</p>

          <div className="contact-core">
            <h2 className="contact-q">Have a level, a world or a VR build that needs a hand?</h2>
            <a className="contact-email" href={`mailto:${SITE.email}`}>{SITE.email}</a>
            <div className="box-row">
              <a className="box-btn" href={`mailto:${SITE.email}`}><Mail size={16} />Email me</a>
              <button className="box-btn ghost" onClick={copy} aria-live="polite">
                {copied ? <><Check size={16} />Copied</> : <><Copy size={16} />Copy address</>}
              </button>
            </div>
          </div>

          <p className="scene-word w3" aria-hidden="true">worlds</p>

          <div className="scene-foot">
            <p className="scene-copy">Remote, worldwide. English or Spanish.</p>
            <ul className="link-list">
              {SITE.links.map((l) => (
                <li key={l.label}><a href={l.href} target="_blank" rel="noreferrer">{l.label}<ArrowUpRight size={13} stroke={2} /></a></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="foot" data-tone="dark">
      <div className="wrap foot-inner">
        <span>© {new Date().getFullYear()} {SITE.name}</span>
        <span>{SITE.title}</span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
}
