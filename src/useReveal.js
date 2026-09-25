import { useEffect } from 'react';
import { arrive, riseWords, countUp, prefersReduced } from './motion.js';

/* Scroll reveals. Elements marked .reveal arrive as they enter the viewport; those entering
   together are staggered. A section headline inside one rises word by word, and stat values
   count up. Also picks up elements mounted later (e.g. cards when "More work" opens). */
export default function useReveal() {
  useEffect(() => {
    if (prefersReduced()) {
      document.documentElement.classList.add('no-motion');
      return;
    }
    const io = new IntersectionObserver((entries) => {
      const batch = entries.filter((e) => e.isIntersecting).map((e) => e.target);
      batch.forEach((el, i) => {
        io.unobserve(el);
        el.classList.remove('reveal-pending');
        const delay = i * 90;
        const isCard = el.classList.contains('card');
        arrive(el, { delay, y: isCard ? 48 : 28, scale: isCard ? 0.97 : 1 });
        const headline = el.querySelector('.headline');
        if (headline) riseWords(headline, { delay: delay + 80 });
        el.querySelectorAll('[data-count]').forEach((s, k) => countUp(s, { delay: delay + k * 120 }));
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    const scan = () => document.querySelectorAll('.reveal:not([data-watched])').forEach((el) => {
      el.dataset.watched = '';
      el.classList.add('reveal-pending');
      io.observe(el);
    });
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, []);
}
