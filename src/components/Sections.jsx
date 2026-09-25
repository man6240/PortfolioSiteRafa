import { useState } from 'react';
import { Glass } from '../glass/LiquidGlass.jsx';
import { LevelIcon, EnvironmentIcon, XrIcon, Star, Mail, Copy, Check, ArrowUpRight } from './Icons.jsx';
import { SITE, DISCIPLINES, TOOLS, EXPERIENCE, REVIEWS, ABOUT, PROJECTS } from '../content.js';

const ICONS = { level: LevelIcon, environment: EnvironmentIcon, xr: XrIcon };
const shot = (id, i) => PROJECTS.find((p) => p.id === id).shots[i];

export function Services() {
  return (
    <section className="services section-light" id="services" data-tone="light">
      <div className="wrap">
        <header className="section-head reveal">
          <p className="eyebrow">What I do</p>
          <h2 className="headline">From blockout<br />to final light.</h2>
        </header>
        <div className="tiles">
          {DISCIPLINES.map((d) => {
            const Icon = ICONS[d.icon];
            return (
              <article key={d.title} className="tile reveal">
                <span className={`tile-icon ${d.icon}`}><Icon /></span>
                <h3>{d.title}</h3>
                <p>{d.body}</p>
                <p className="tile-tools">{d.tools}</p>
              </article>
            );
          })}
        </div>
        <div className="toolkit reveal">
          <h3>Toolkit</h3>
          <ul>{TOOLS.map((t) => <li key={t}>{t}</li>)}</ul>
        </div>
      </div>
    </section>
  );
}

export function Experience() {
  return (
    <section className="experience section-white" id="experience" data-tone="light">
      <div className="wrap exp-grid">
        <header className="section-head reveal">
          <p className="eyebrow">Experience</p>
          <h2 className="headline">Studios, clients and shipped titles.</h2>
        </header>
        <ol className="timeline">
          {EXPERIENCE.map((e) => (
            <li key={e.where} className="reveal">
              <p className="when">{e.when}</p>
              <div>
                <h3>{e.role}</h3>
                <p className="where">{e.where}</p>
                <p>{e.body}</p>
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
    <section className="reviews" id="reviews" data-tone="dark">
      <div className="reviews-bg" aria-hidden="true"><img src={shot('vr', 2)} alt="" loading="lazy" /></div>
      <div className="wrap">
        <header className="section-head centered reveal">
          <p className="eyebrow">Client reviews</p>
          <div className="score">
            <strong>{REVIEWS.score}</strong>
            <span className="stars" aria-label="5 out of 5 stars">{[0, 1, 2, 3, 4].map((k) => <Star key={k} />)}</span>
          </div>
          <p className="section-sub">{REVIEWS.jobs}, every one rated five stars.</p>
        </header>
        <div className="review-grid">
          {REVIEWS.items.map((r) => (
            <Glass as="figure" key={r.project} className="review reveal" refract={{ blur: 16, scale: 36, bezel: 24 }}>
              <span className="stars small" aria-hidden="true">{[0, 1, 2, 3, 4].map((k) => <Star key={k} size={14} />)}</span>
              <blockquote>“{r.quote}”</blockquote>
              <figcaption>{r.project}</figcaption>
            </Glass>
          ))}
        </div>
      </div>
    </section>
  );
}

export function About() {
  return (
    <section className="about section-light" id="about" data-tone="light">
      <div className="wrap about-grid">
        <div className="reveal">
          <p className="eyebrow">About</p>
          <h2 className="headline">Spaces that carry<br />the narrative.</h2>
          <div className="about-body">{ABOUT.body.map((t, i) => <p key={i}>{t}</p>)}</div>
        </div>
        <dl className="inset-list reveal">
          {ABOUT.facts.map((f, k) => (
            <div key={k} className={f.label ? '' : 'cont'}>
              <dt>{f.label}</dt>
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
    <section className="contact" id="contact" data-tone="dark">
      <div className="contact-bg" aria-hidden="true"><img src={shot('trailer', 3)} alt="" loading="lazy" /></div>
      <div className="wrap contact-inner reveal">
        <p className="eyebrow">Contact</p>
        <h2 className="headline">Have a level, a world or a VR build that needs a hand?</h2>
        <p className="section-sub">Available for freelance and contract work, remotely, in English or Spanish.</p>
        <div className="actions center">
          <a className="btn btn-primary" href={`mailto:${SITE.email}`}><Mail size={18} />Email me</a>
          <Glass as="button" variant="clear" className="btn btn-glass" onClick={copy} aria-live="polite">
            {copied ? <><Check size={18} />Copied</> : <><Copy size={18} />Copy address</>}
          </Glass>
        </div>
        <p className="contact-email">{SITE.email}</p>
        <ul className="elsewhere">
          {SITE.links.map((l) => (
            <li key={l.label}>
              <Glass as="a" variant="clear" className="btn btn-glass btn-sm" href={l.href} target="_blank" rel="noreferrer">
                {l.label}<ArrowUpRight size={15} stroke={2} />
              </Glass>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="foot" data-tone="light">
      <div className="wrap foot-inner">
        <p>Copyright © {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
        <p>{SITE.title} · {SITE.location}</p>
      </div>
    </footer>
  );
}
