import { useEffect } from 'react';

/* Fades .reveal elements up as they enter the viewport, including ones mounted later
   (e.g. cards after a filter change). Reduced motion shows everything immediately (CSS). */
export default function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    const scan = () => document.querySelectorAll('.reveal:not(.in):not([data-watched])').forEach((el) => {
      el.dataset.watched = '';
      io.observe(el);
    });
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, []);
}
