# rafavitriago.eu — v3

Portfolio site for Rafael Vitriago: level design, environment art and technical art.
The first design (SF/Inter type, a 3D hero, light `#f5f5f7` and white sections, blue
pill buttons, rounded cards) with the work section as its centrepiece: Flag Fiesta and Sugoi are staged as
product-shot scenes (floating phones, big words, rounded callout tags on curved leader lines), and Ashes of Idunn and the VR Experience
are full-width rounded panels with the render behind the copy. The first design's section styles are scoped
under `.classic` in `styles.css`.

**Liquid Glass** is used for the floating controls throughout.

React + Vite + Anime.js v4, plus three.js for the hero only: the page ships ~90 kB of gzipped JS, and the
3D stage (~290 kB gzipped, `src/hero3d.js`) loads after the page is up.

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
- `scene` (optional, featured phone projects): stages the project as a product-shot scene: `words` (three,
  around the phone), `tags` (three callouts), `colors` (`base`, `deep`, `glow`), `decor: 'bunting'` (flag
  string, Flag Fiesta only), `shot` (which screenshot sits on the phone) and `variant`: `'split'` (words around
  one phone, Flag Fiesta) or `'stack'` (rounded words stacked on the left, two phones on the right, Sugoi).
- `live: 'flag-fiesta'`: shows the animated placeholder phone (`src/flagFiesta.js`) until real captures exist.

The hero's two screens are `HERO` in the same file: `monitor` and `phone` lists of `[projectId, shotIndex, tag, label]`
(`'video'` as the shot plays the Flag Fiesta gameplay clip).

Featured landscape projects (Idunn, VR) take a `headline`: `{ words: [line 1, line 2], line: one-sentence pitch }`,
shown as big Cinzel title words over the render with the pitch in the caption, at the same height as the phone scenes.

## 3D hero

`src/hero3d.js` (three.js) stages a studio display and an iPhone on a stone ledge under one shaft of light; the monitor
rotates through PC and VR work, the phone through the mobile games, and the glow behind them takes the colour of
what's on screen. Everything is built in code except:
- `public/hero/iphone-17-pro.glb`: “iPhone 17 Pro” by Ibrahim.Bhl, CC BY 4.0 (credited in the footer), compressed
  with gltf-transform (meshopt + WebP, 8.4 MB → 0.8 MB).
- `public/hero/flag-fiesta.mp4` / `.webm`: the gameplay clip on the phone.
- `public/hero/poster.jpg`: a still render of the stage, shown until the 3D is running and when WebGL isn't available.
  Re-render it if the scene changes.

It renders only while the hero is on screen, caps the pixel ratio, and with *Reduce motion* holds the camera still
and swaps screens without crossfades. Antialiasing comes from a multisampled render target.

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
- **Hero parallax**: `onScroll({ sync: true })` drifts the 3D stage and lifts the copy as the hero scrolls away.
- **Scroll reveals** (`useReveal.js`): anything with `.reveal` arrives staggered; a `.headline` inside it rises word by word; `[data-count]` stats count up.
- **Panel parallax**: the phones in featured panels drift up slightly as the panel scrolls in.
- **Springs**: the nav selection capsule springs between slots and briefly stretch like liquid (`moveCapsule`); the project sheet springs open.
- **Reduce motion** skips all of it and shows the final state.

## Files

- `src/App.jsx`                 page order and project sheet state
- `src/components/Nav.jsx`      floating glass bar; sliding selection capsule
- `src/components/Hero.jsx`     headline, labels and stats over the 3D stage
- `src/hero3d.js`               the hero's three.js scene (loaded on demand)
- `src/components/Work.jsx`     featured projects (panels or scenes), phone frames and the "More work" grid
- `src/components/Scene.jsx`    the product-shot scene (Flag Fiesta, Sugoi): callout tags, bunting, confetti, pointer depth
- `src/components/ProjectSheet.jsx` modal gallery (keyboard, swipe, thumbnails)
- `src/components/Story.jsx`    the scroll story after the work: level design, environment art, technical art, experience,
                                reviews, about and contact as full-screen chapters on a pinned stage
- `src/components/Sections.jsx` footer
- `src/motion.js`               Anime.js springs, word rise, count-up, capsule motion
- `src/useReveal.js`            scroll-triggered entrances
- `src/styles.css`              tokens, glass material, layout

## Scroll story

Everything after the work section is one pinned, full-screen stage (`Story.jsx`). The scroll position
gives each chapter a progress value `--l` (≈0 arriving, 1 leaving), and CSS derives every effect from it:
crossfades, push-ins, letters rising, lines drawing, the render getting lit. It all reverses on the way back.
Each chapter plays its entrance over `ANIM` screens, then holds still, complete, for `HOLD` screens (a chapter in `CHAPTERS` can set its own `hold`). On phones, short screens and with *Reduce motion* the chapters flow as
normal full-height sections instead of pinning.

## SEO

- `npm run build` prerenders the page (`src/entry-server.jsx` + `scripts/prerender.mjs`), so `dist/index.html`
  already contains all the text and project names; search engines and link previews don't need JavaScript.
  The browser then hydrates it (`src/main.jsx`).
- `index.html` holds the title, description, canonical URL, Open Graph / Twitter preview tags and JSON-LD
  structured data (Person, ProfessionalService, WebSite). **If the domain is not `rafavitriago.eu`, replace it
  there and in `public/robots.txt` and `public/sitemap.xml`.**
- `public/og.jpg` is the 1200×630 image shown when the link is shared.
- After deploying: add the site to Google Search Console and Bing Webmaster Tools, submit
  `https://rafavitriago.eu/sitemap.xml`, and link the site from LinkedIn, Upwork, Behance and ArtStation.

## Hidden pages

- `public/flag-fiesta/privacy/index.html` → `https://rafavitriago.eu/flag-fiesta/privacy/`: Flag Fiesta's privacy
  policy (for Google Play). Not linked from the site, not in the sitemap, and marked `noindex`.
