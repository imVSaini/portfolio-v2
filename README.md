# Vaibhav Kumar Saini — Portfolio

Next.js 16 (App Router, Turbopack), TypeScript (strict), Tailwind CSS v4, Zustand, GSAP + Locomotive Scroll v5.

## Scripts

| Command                 | What it does                                       |
| ----------------------- | -------------------------------------------------- |
| `npm run dev`           | Dev server                                         |
| `npm run build`         | Production build (fully static)                    |
| `npm run check`         | Typecheck + ESLint + Prettier check                |
| `npm run lint:fix`      | ESLint autofix (incl. Tailwind class rules)        |
| `npm run format`        | Prettier write (sorts Tailwind classes)            |
| `npm run test:e2e`      | Playwright end-to-end tests (all browsers)         |
| `npm run test:e2e:fast` | Playwright: HTTP, no-JS document and Chromium only |
| `npm run test:e2e:ui`   | Playwright UI mode                                 |

## Where things live

- `src/data/*` — all content (projects, experience, skills, contact, site meta). Edit copy here.
- `src/app/globals.css` — palette (from videojs.org), light/dark/deep-tone and accent tokens, type scale, custom variants.
- `src/lib/asset.ts` — `getAssetUrl()` builds image URLs on the Cloudflare R2 bucket (`site.assetsUrl`), which `next.config.ts` allows in `images.remotePatterns`.
- `src/lib/appearance.ts` + `src/stores/appearance.ts` — theme/accent/tone model, the pre-paint `<head>` script, and the persisted Zustand store.
- `src/components/appearance/*` — the Appearance popover (Theme · Dark tone · Accent).
- `src/components/scroll/*` — Locomotive/Lenis smooth scroll on GSAP's ticker, `ScrollLink`, and the pinned `HorizontalSection`.
- `src/components/motion/*` — `RevealText` (SplitText line reveal), `ScrubWords`, velocity `Marquee`.

## Motion hooks

- `data-scroll data-scroll-speed="0.1"` — vertical parallax (Locomotive; desktop only, disabled on touch).
- Inside `HorizontalSection`: `data-h-panel` (panel), `data-h-parallax="14"` (drift in xPercent), `data-h-reveal` (rise in).
- Everything falls back to native scroll and static layout under `prefers-reduced-motion`.

## RSS

- `/rss.xml` serves RSS 2.0 with the newest 20 published posts from `src/data/posts`, including summaries and full article HTML. `src/lib/rss.ts` owns serialization; the route only sets response headers.
- The feed is prerendered with Cache Components and refreshed on deployment. Its HTTP cache lifetime is one hour. Adding a post to the shared posts collection publishes it to both the site and feed; dates do not schedule publication.
- Discovery links use `feedAlternates` from `src/data/blog.ts`. Include it whenever a route overrides `metadata.alternates`, because Next.js replaces that nested object. The footer has a visible subscription link on every page.
- Permalink URLs are RSS GUIDs. Keep a published post's slug stable so edits do not create duplicate feed entries.
- RSS requires RFC-822 date-times. Date-only publication values use midnight UTC as a normalization convention, not a recorded publication time. Publication dates and GUIDs stay unchanged when an article is edited.
- Set `updatedAt` only to a known substantive revision date. The sitemap emits that date directly and omits unknown modification dates. The feed's `lastBuildDate` is the newest publication or `updatedAt` day, so it only moves when content does.
- XML text and embedded HTML are escaped separately. Invalid calendar dates and XML-forbidden characters fail generation rather than producing a broken feed.

References: [RSS specification](https://www.rssboard.org/rss-specification), [RSS best practices](https://www.rssboard.org/rss-profile), [autodiscovery](https://www.rssboard.org/rss-autodiscovery), [RSS date format](https://validator.w3.org/feed/docs/error/InvalidRFC2822Date.html).
