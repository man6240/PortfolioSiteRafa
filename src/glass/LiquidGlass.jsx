import { createElement, forwardRef, useCallback, useEffect, useRef } from 'react';

/* Liquid Glass
   ------------
   Every .glass element gets a frosted, tinted surface with a specular rim from CSS (styles.css).
   Where the browser can run an SVG filter as a backdrop-filter (Chromium), the element also gets
   real refraction: a displacement map is generated for its exact size and corner radius, so the
   content behind the rim bends like light through a thick, rounded lens while the centre stays clear.
   Safari and Firefox keep the CSS version, and "Reduce transparency" turns the glass opaque. */

const NS = 'http://www.w3.org/2000/svg';

export const canRefract = (() => {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  const chromium = /Chrome\/\d+/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  const reduce = window.matchMedia('(prefers-reduced-transparency: reduce)').matches;
  return chromium && !reduce;
})();

let defs = null;
function getDefs() {
  if (defs) return defs;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
  defs = document.createElementNS(NS, 'defs');
  svg.appendChild(defs);
  document.body.appendChild(svg);
  return defs;
}

/* Displacement map for a rounded rectangle. Red and green encode how far each pixel samples
   along x and y (128 = no shift). Inside the bezel band the sample is pulled inward along the
   surface normal, with a curve that is flat in the middle and steep at the rim, like a lens edge. */
const maps = new Map();
function displacementMap(w, h, r, bezel) {
  const key = `${w}x${h}r${r}b${bezel}`;
  if (maps.has(key)) return maps.get(key);
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(w, h);
  const d = img.data;
  const hx = Math.max(0, w / 2 - r), hy = Math.max(0, h / 2 - r);
  for (let y = 0; y < h; y++) {
    const py = y + 0.5 - h / 2, sy = Math.sign(py) || 1, qy = Math.abs(py) - hy;
    for (let x = 0; x < w; x++) {
      const px = x + 0.5 - w / 2, sx = Math.sign(px) || 1, qx = Math.abs(px) - hx;
      let dist, nx, ny;
      if (qx > 0 && qy > 0) {
        const l = Math.hypot(qx, qy);
        dist = r - l; nx = (qx / l) * sx; ny = (qy / l) * sy;
      } else if (qx > qy) {
        dist = r - qx; nx = sx; ny = 0;
      } else {
        dist = r - qy; nx = 0; ny = sy;
      }
      let m = 0;
      if (dist > 0 && dist < bezel) {
        const t = 1 - dist / bezel;
        m = t * t * t * 0.6 + t * t * 0.4;
      }
      const i = (y * w + x) * 4;
      d[i] = 128 - nx * m * 127;
      d[i + 1] = 128 - ny * m * 127;
      d[i + 2] = 128;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const url = cv.toDataURL();
  maps.set(key, url);
  return url;
}

let uid = 0;
export function useLiquidGlass(ref, opts) {
  const enabled = canRefract && opts !== null;
  const { blur = 2, scale = 56, bezel = 22, saturate = 1.7 } = opts || {};
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    const id = `lg-${++uid}`;
    const filter = document.createElementNS(NS, 'filter');
    filter.setAttribute('id', id);
    getDefs().appendChild(filter);
    let last = '';
    const update = () => {
      const w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight);
      if (!w || !h) return;
      const r = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0, w / 2, h / 2);
      const b = Math.min(bezel, Math.min(w, h) / 2);
      const key = `${w}/${h}/${r}/${b}`;
      if (key === last) return;
      last = key;
      const map = displacementMap(w, h, Math.round(r), Math.round(b));
      filter.setAttribute('x', 0); filter.setAttribute('y', 0);
      filter.setAttribute('width', w); filter.setAttribute('height', h);
      filter.setAttribute('filterUnits', 'userSpaceOnUse');
      filter.setAttribute('primitiveUnits', 'userSpaceOnUse');
      filter.setAttribute('color-interpolation-filters', 'sRGB');
      filter.innerHTML = `
        <feGaussianBlur in="SourceGraphic" stdDeviation="${blur}" result="b"/>
        <feImage href="${map}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" result="m"/>
        <feDisplacementMap in="b" in2="m" scale="${scale}" xChannelSelector="R" yChannelSelector="G" result="d"/>
        <feColorMatrix in="d" type="saturate" values="${saturate}"/>`;
      el.style.backdropFilter = `url(#${id})`;
      el.classList.add('refract');
    };
    const ro = new ResizeObserver(update);
    ro.observe(el);
    update();
    return () => {
      ro.disconnect();
      filter.remove();
      el.style.backdropFilter = '';
      el.classList.remove('refract');
    };
  }, [enabled, blur, scale, bezel, saturate, ref]);
}

/* <Glass as="button" variant="clear|regular" refract={{ blur, scale, bezel }}> */
export const Glass = forwardRef(function Glass(
  { as = 'div', variant = 'regular', refract = {}, className = '', ...rest },
  forwarded,
) {
  const local = useRef(null);
  const ref = useCallback((node) => {
    local.current = node;
    if (typeof forwarded === 'function') forwarded(node);
    else if (forwarded) forwarded.current = node;
  }, [forwarded]);
  const defaults = variant === 'clear' ? { blur: 1.5 } : { blur: 7, scale: 44 };
  useLiquidGlass(local, refract === false ? null : { ...defaults, ...refract });
  return createElement(as, { ref, className: `glass glass-${variant} ${className}`.trim(), ...rest });
});
