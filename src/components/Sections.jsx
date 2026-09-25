import { useState } from 'react';
import { LevelIcon, EnvironmentIcon, XrIcon, Star, Mail, Copy, Check, ArrowUpRight } from './Icons.jsx';
import { SITE, DISCIPLINES, TOOLS, EXPERIENCE, REVIEWS, ABOUT } from '../content.js';

const ICONS = { level: LevelIcon, environment: EnvironmentIcon, xr: XrIcon };

/* Every section opens the same way: a numbered mono label over a hairline, then a heading. */
function Head({ n, label, title, sub }) {
  return (
    <header className="sec-head reveal">
      <p className="sec-label mono-label"><span>{n}</span>{label}</p>
      <h2 className="sec-title">{title}</h2>
      {sub && <p className="sec-sub">{sub}</p>}
    </header>
  );
}

export function Services() {
  return (
    <section className="section" id="services" data-tone="dark">
      <div className="wrap">
        <Head n="02" label="What I do" title="From blockout to final light" />
        <div className="disc-grid reveal">
          {DISCIPLINES.map((d) => {
            const Icon = ICONS[d.icon];
            return (
              <article key={d.title} className="disc">
                <span className="disc-icon"><Icon /></span>
                <h3>{d.title}</h3>
                <p>{d.body}</p>
                <p className="disc-tools mono-label">{d.tools}</p>
              </article>
            );
          })}
        </div>
        <div className="toolkit reveal">
          <span className="mono-label">Toolkit</span>
          <ul className="tag-list">{TOOLS.map((t) => <li key={t} className="tag-box ghost">{t}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}

export function Experience() {
  return (
    <section className="section" id="experience" data-tone="dark">
      <div className="wrap split">
        <Head n="03" label="Experience" title="Studios, clients and shipped titles" />
        <ol className="timeline reveal">
          {EXPERIENCE.map((e) => (
            <li key={e.where}>
              <span className="mono-label">{e.when}</span>
              <div>
                <h3>{e.role}</h3>
                <p className="where">{e.where}</p>
                <p className="body">{e.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Reviews() {
  return (
    <section className="section" id="reviews" data-tone="dark">
      <div className="wrap">
        <div className="reviews-head">
          <Head n="04" label="Client reviews" title="What clients say" />
          <div className="score reveal">
            <strong>{REVIEWS.score}</strong>
            <div>
              <span className="stars" aria-label="5 out of 5 stars">{[0, 1, 2, 3, 4].map((k) => <Star key={k} size={18} />)}</span>
              <p className="mono-label">{REVIEWS.jobs}</p>
            </div>
          </div>
        </div>
        <div className="review-grid">
          {REVIEWS.items.map((r) => (
            <figure key={r.project} className="review reveal">
              <blockquote>“{r.quote}”</blockquote>
              <figcaption className="mono-label">{r.project}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function About() {
  return (
    <section className="section" id="about" data-tone="dark">
      <div className="wrap split">
        <div>
          <Head n="05" label="About" title="Spaces that carry the narrative" />
          <div className="about-body reveal">{ABOUT.body.map((t, i) => <p key={i}>{t}</p>)}</div>
        </div>
        <dl className="facts reveal">
          {ABOUT.facts.map((f, k) => (
            <div key={k} className={f.label ? '' : 'cont'}>
              <dt className="mono-label">{f.label}</dt>
              <dd>{f.value}{f.sub && <span>{f.sub}</span>}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function Contact() {
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
    <section className="section contact" id="contact" data-tone="dark">
      <div className="wrap">
        <div className="contact-card reveal">
          <p className="sec-label mono-label"><span>06</span>Contact</p>
          <h2 className="contact-title">Have a level, a world or a VR build that needs a hand?</h2>
          <a className="contact-email" href={`mailto:${SITE.email}`}>{SITE.email}<ArrowUpRight size={28} stroke={1.6} /></a>
          <div className="contact-row">
            <div className="box-row">
              <a className="box-btn" href={`mailto:${SITE.email}`}><Mail size={16} />Email me</a>
              <button className="box-btn ghost" onClick={copy} aria-live="polite">
                {copied ? <><Check size={16} />Copied</> : <><Copy size={16} />Copy address</>}
              </button>
            </div>
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
