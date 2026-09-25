import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Glass } from '../glass/LiquidGlass.jsx';
import { Menu, Close } from './Icons.jsx';

const LINKS = [
  { id: 'work', label: 'Work' },
  { id: 'services', label: 'Services' },
  { id: 'experience', label: 'Experience' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'about', label: 'About' },
];

/* Floating glass bar. It re-tints for the section underneath (light or dark),
   and a selection capsule slides to the section in view, like a tab bar. */
export default function Nav() {
  const [tone, setTone] = useState('dark');
  const [active, setActive] = useState(null);
  const [open, setOpen] = useState(false);
  const linksRef = useRef(null);
  const [pill, setPill] = useState(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      const under = [...document.querySelectorAll('main [data-tone], footer[data-tone]')].find((s) => {
        const r = s.getBoundingClientRect();
        return r.top <= 36 && r.bottom > 36;
      });
      if (under) setTone(under.dataset.tone);
      const current = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean).find((s) => {
        const r = s.getBoundingClientRect();
        return r.top <= vh * 0.4 && r.bottom > vh * 0.4;
      });
      setActive(current ? current.id : null);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, []);

  useLayoutEffect(() => {
    const a = active && linksRef.current?.querySelector(`[href="#${active}"]`);
    setPill(a ? { left: a.offsetLeft, width: a.offsetWidth } : null);
  }, [active]);

  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, [open]);

  return (
    <header className="nav" data-tone={tone}>
      <Glass className="nav-bar" refract={{ blur: 3, scale: 40, bezel: 16 }}>
        <a className="nav-mark" href="#top" aria-label="Rafael Vitriago, back to top">
          <span className="monogram" aria-hidden="true">RV</span>
          <span className="nav-name">Rafael Vitriago</span>
        </a>
        <nav className="nav-links" aria-label="Sections" ref={linksRef}>
          {pill && <span className="nav-pill" style={{ transform: `translateX(${pill.left}px)`, width: pill.width }} aria-hidden="true" />}
          {LINKS.map((l) => (
            <a key={l.id} href={`#${l.id}`} aria-current={active === l.id ? 'true' : undefined}>{l.label}</a>
          ))}
        </nav>
        <a className="btn btn-primary btn-sm nav-cta" href="#contact">Contact</a>
        <button className="nav-toggle" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          {open ? <Close /> : <Menu />}
        </button>
      </Glass>
      {open && (
        <Glass className="nav-sheet" refract={{ blur: 10, scale: 50 }}>
          {[...LINKS, { id: 'contact', label: 'Contact' }].map((l) => (
            <a key={l.id} href={`#${l.id}`} onClick={() => setOpen(false)}>{l.label}</a>
          ))}
        </Glass>
      )}
    </header>
  );
}
