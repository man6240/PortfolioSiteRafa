# rafavitriago.eu — v3

Portfolio site for Rafael Vitriago: level design, environment art and technical art.
One visual language across the page, built around the product-shot "scene": every section is a panel on a
deep navy page, framed with crop marks and a monospace bar, with big Space Grotesk words, white bracketed
callout tags and square white buttons. The hero and each featured project float a phone or screen at the
centre of a scene tinted in their own colours; the other sections use the same frame. Content spans up to
1920px so wide screens are filled.

**Liquid Glass** is used for the floating controls throughout.

React + Vite + Anime.js v4. No 3D runtime: the site ships ~85 kB of gzipped JS plus images.

## Run

    npm install
    npm run dev          # local
    npm run build        # dist/  -> deploy to Cloudflare Pages (build cmd: npm run build, output: dist)
    npm run build:single # dist-single/index.html, everything inlined in one file

## Edit content

All copy, links and project data live in `src/content.js`.

Per project:
- `featured: true`: shown as a full-width panel, copy on one side and the work on the other, alternating.
  Projects without it sit in the grid behind the "More work" button. Order in `PROJECTS` is display order.
- `panel`: `[from, to, text]` for featured phone projects: the saturated gradient behind the phones and the text colour on it.
  Landscape projects use their screenshots as the panel instead.
- `category`: `'games' | 'xr' | 'viz'`
- `shots`: screenshots from `src/assets/shots/`, picked by filename prefix (`idunn-1.jpg`, `idunn-2.jpg`…). The first is the cover.
- `frame`: for portrait shots, `'phone'` (shown in phone frames) or `'card'` (rounded prints). Leave it out for landscape shots.
- `palette`: `[accent, light, deep]`, tints the card and the project sheet.
- `scene` (featured projects): `words` (three, around the object), `tags` (three callouts), `colors`
  (`base`, `deep`, `glow`) and `decor` (`'bunting'`, `'confetti'`, `'embers'` or `'motes'`). Phone projects
  float a phone; landscape ones float a screen over a blurred backdrop of their own render.
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

## Motion

All motion is Anime.js v4, defined in `src/motion.js`:
- **Hero intro** (`Hero.jsx`): a timeline where the headline rises word by word from behind a mask (`splitText`), then the copy and buttons follow.
- **Hero parallax**: `onScroll({ sync: true })` drifts the image and lifts the copy as the hero scrolls away.
- **Scroll reveals** (`useReveal.js`): anything with `.reveal` arrives staggered; a `.headline` inside it rises word by word; `[data-count]` stats count up.
- **Panel parallax**: the phones in featured panels drift up slightly as the panel scrolls in.
- **Springs**: the nav selection capsule springs between slots and briefly stretch like liquid (`moveCapsule`); the project sheet springs open.
- **Reduce motion** skips all of it and shows the final state.

## Files

- `src/App.jsx`                 page order and project sheet state
- `src/components/Nav.jsx`      floating glass bar; sliding selection capsule
- `src/components/Hero.jsx`     hero scene (renders on a floating screen) and stats
- `src/components/Work.jsx`     featured scenes and the "More work" grid
- `src/components/Scene.jsx`    the scene system: crop marks, callout tags, decor, pointer depth, and the featured-project scene
- `src/components/Devices.jsx`  phone frame, live Flag Fiesta screen, slideshow
- `src/components/ProjectSheet.jsx` modal gallery (keyboard, swipe, thumbnails)
- `src/components/Sections.jsx` services, experience, reviews, about, contact, footer (scene panels)
- `src/motion.js`               Anime.js springs, word rise, count-up, capsule motion
- `src/useReveal.js`            scroll-triggered entrances
- `src/styles.css`              tokens, glass material, layout
