import { useCallback, useState } from 'react';
import Nav from './components/Nav.jsx';
import Hero from './components/Hero.jsx';
import Work from './components/Work.jsx';
import ProjectSheet from './components/ProjectSheet.jsx';
import { Services, Experience, Reviews, About, Contact, Footer } from './components/Sections.jsx';
import useReducedMotion from './useReducedMotion.js';
import useReveal from './useReveal.js';

export default function App() {
  const reduced = useReducedMotion();
  const [sheet, setSheet] = useState(null);
  const open = useCallback((p, i = 0) => setSheet({ p, i }), []);
  const close = useCallback(() => setSheet(null), []);
  useReveal();

  return (
    <>
      <a className="skip" href="#work">Skip to work</a>
      <div className="classic"><Nav /></div>
      <main>
        <div className="classic"><Hero reduced={reduced} onOpen={open} /></div>
        <Work reduced={reduced} onOpen={open} />
        <div className="classic">
          <Services />
          <Experience />
          <Reviews />
          <About />
          <Contact />
        </div>
      </main>
      <div className="classic"><Footer /></div>
      <ProjectSheet state={sheet} onClose={close} reduced={reduced} />
    </>
  );
}
