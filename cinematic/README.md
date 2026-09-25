# rafavitriago.eu — cinematic hero variant

A single-page hero: fullscreen looping background video, glass navigation and serif display type.
React + Vite + TypeScript + Tailwind CSS v4 + shadcn/ui. Separate from the main site in the repo root.

## Run

    npm install
    npm run dev
    npm run build          # dist/
    npm run build:single   # dist-single/index.html, one self-contained file

## Edit

- `src/App.tsx`: video URL (`VIDEO_SRC`), email, nav links, headline and copy.
- `src/index.css`: theme colours (HSL CSS variables), the `.liquid-glass` class and the fade-rise animations.
- Fonts: Instrument Serif and Inter from Google Fonts (`index.html`).

## shadcn/ui

Set up by hand to match `shadcn init` (`components.json`, `src/lib/utils.ts`, `src/components/ui/button.tsx`),
so `npx shadcn@latest add <component>` works for adding more components.

## Notes

- The background video streams from a third-party CloudFront URL. For production, host your own file
  (e.g. `public/hero.mp4`) and point `VIDEO_SRC` at it so the page does not depend on someone else's link.
- The design has no overlay on the video, so it relies on dark footage for text contrast.
