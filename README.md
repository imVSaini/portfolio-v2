# Vaibhav Kumar Saini — Portfolio

Next.js 16 (App Router, Turbopack), TypeScript (strict), Tailwind CSS v4, Zustand, GSAP + Locomotive Scroll v5.

## Scripts

| Command            | What it does                                |
| ------------------ | ------------------------------------------- |
| `npm run dev`      | Dev server                                  |
| `npm run build`    | Production build (fully static)             |
| `npm run check`    | Typecheck + ESLint + Prettier check         |
| `npm run lint:fix` | ESLint autofix (incl. Tailwind class rules) |
| `npm run format`   | Prettier write (sorts Tailwind classes)     |

## Where things live

- `src/data/*` — all content (projects, experience, skills, contact, site meta). Edit copy here.
- `src/app/globals.css` — palette (from videojs.org), light/dark/deep-tone and accent tokens, type scale, custom variants.
- `src/lib/appearance.ts` + `src/stores/appearance.ts` — theme/accent/tone model, the pre-paint `<head>` script, and the persisted Zustand store.
- `src/components/appearance/*` — the Appearance popover (Theme · Dark tone · Accent).
- `src/components/scroll/*` — Locomotive/Lenis smooth scroll on GSAP's ticker, `ScrollLink`, and the pinned `HorizontalSection`.
- `src/components/motion/*` — `RevealText` (SplitText line reveal), `ScrubWords`, velocity `Marquee`.

## Motion hooks

- `data-scroll data-scroll-speed="0.1"` — vertical parallax (Locomotive; desktop only, disabled on touch).
- Inside `HorizontalSection`: `data-h-panel` (panel), `data-h-parallax="14"` (drift in xPercent), `data-h-reveal` (rise in).
- Everything falls back to native scroll and static layout under `prefers-reduced-motion`.
