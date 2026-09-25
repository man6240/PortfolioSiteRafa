# rafavitriago.eu — v3

Portfolio site for Rafael Vitriago: level design, environment art and technical art.
It follows Apple's current design language: SF Pro type, dark cinematic sections alternating
with light `#f5f5f7` ones, and **Liquid Glass** for all the floating controls.

React + Vite. No 3D runtime: the site ships ~60 kB of gzipped JS plus images.

## Run

    npm install
    npm run dev          # local
    npm run build        # dist/  -> deploy to Cloudflare Pages (build cmd: npm run build, output: dist)
    npm run build:single # dist-single/index.html, everything inlined in one file

## Edit content

All copy, links and project data live in `src/content.js`.

Per project:
- `category`: `'games' | 'xr' | 'viz'` (drives the filter above the grid)
- `shots`: screenshots from `src/assets/shots/`, picked by filename prefix (`idunn-1.jpg`, `idunn-2.jpg`…). The first is the cover.
- `frame`: for portrait shots, `'phone'` (shown in phone frames) or `'card'` (rounded prints). Leave it out for landscape shots.
- `palette`: `[accent, light, deep]`, tints the card and the project sheet.
- `live: 'flag-fiesta'`: shows the animated placeholder phone (`src/flagFiesta.js`) until real captures exist.

The hero slideshow is `HERO` in the same file (`[projectId, shotIndex]` pairs).

## Liquid Glass

`src/glass/LiquidGlass.jsx` exports `<Glass>`. Each glass surface gets:
- **CSS material** (`.glass` in `styles.css`): tint, blur and saturation, a gradient rim that
  catches light, a soft top sheen, and a press response (swell and brighten).
- **Real refraction** in Chromium browsers: a displacement map is generated for the element's exact
  size and corner radius, and applied through an SVG filter as a `backdrop-filter`. The rim bends
  what is behind it like a thick lens; the centre stays clear.
- **Fallbacks**: Safari and Firefox get the CSS material only. *Reduce transparency* makes glass opaque;
  *Reduce motion* turns off animation.

Usage:

    <Glass as="button" variant="clear" className="btn btn-glass">Label</Glass>
    <Glass className="panel" refract={{ blur: 12, scale: 40, bezel: 18 }}>…</Glass>
    <Glass refract={false}>CSS glass only</Glass>

## Files

- `src/App.jsx`                 page order and project sheet state
- `src/components/Nav.jsx`      floating glass bar; re-tints over light sections, sliding selection capsule
- `src/components/Hero.jsx`     full-bleed slideshow, headline, stats
- `src/components/Work.jsx`     segmented filter, bento grid, phone frames
- `src/components/ProjectSheet.jsx` modal gallery (keyboard, swipe, thumbnails)
- `src/components/Sections.jsx` services, experience, reviews, about, contact, footer
- `src/styles.css`              tokens, glass material, layout
