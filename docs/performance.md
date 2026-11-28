# Performance

The site is static, so the cost that matters is what the browser downloads and runs. The main
levers are keeping code on the server and keeping the shared JavaScript small.

## Script budget

`e2e/http/script-budget.spec.ts` reads every page's `<script src>` tags from the server HTML,
downloads each script, gzips it and fails when a page's total goes over `SCRIPT_BUDGET_KB`
(**330 KB**). It runs in the `http` project, so it needs no browser and runs on every push and pull
request in CI.

Measured on 20 November 2026:

| Page                        | Gzipped script |
| --------------------------- | -------------- |
| `/`                         | 320.2 KB       |
| `/blog/[slug]`              | 322.0 KB       |
| `/blog`                     | 316.6 KB       |
| `/case-studies/[slug]`      | 316.9 KB       |
| `/case-studies`, `/privacy` | 311.1 KB       |

When the budget fails:

1. Find what grew. Build, start the server and list the chunks a page loads with their gzipped
   sizes (the spec's `getScriptKilobytes` shows how).
2. Move code back to the server, lazy-load it, or drop the dependency.
3. Raise `SCRIPT_BUDGET_KB` only when the weight is worth it, in the same commit as the code that
   needs it, with the reason in the commit message.

## Where the weight is

About 160 KB is React, React DOM and Next.js, which every page needs. Almost all of the rest is one
shared chunk of about 139 KB that holds GSAP with its four registered plugins, Locomotive Scroll,
Base UI and zustand.

Every page uses most of that chunk: the header `Logo` uses `MorphSVGPlugin`, `OverscrollReveal`
uses `Observer`, `RevealText` uses `SplitText` and every page smooth-scrolls. The candidates worth
measuring are the Base UI primitives behind controls that start closed (the mobile menu, the
appearance popover and drawer), which could load on first open instead of with the page.

## Keeping code off the client

- Server Components are the default. Add `"use client"` only for state, effects, events, animation
  refs or browser APIs.
- Animated sections use client wrappers and pass their markup as `children`
  (see [Architecture](./architecture.md#the-client-boundary)). Moving four sections to this pattern
  cut 7.7 KB from the home page and 1.6 KB from every other page.
- Content (`src/data/posts`, `src/data/caseStudies`, `src/content`) and the helpers that read it
  (`src/lib/articleSources.ts`, `src/lib/markdoc.ts`, `src/lib/highlight.ts`) must never be
  imported by a client component; they would ship every article, Markdoc and Shiki to the browser.
  The `*.md` rule in `next.config.ts` skips browser code, so importing a body there fails the build.
- Prefer CSS for simple motion. `RollText` is pure CSS and runs on the server.

## Rendering and caching

- Every page is prerendered at build time (`cacheComponents`), and served with
  `x-nextjs-prerender: 1` from Vercel behind Cloudflare.
- Text routes (RSS, Markdown, `llms.txt`) send `Cache-Control: public, max-age=3600,
s-maxage=3600`.
- `partialPrefetching` is on, so links prefetch the static shell of their target.

## Fonts and images

- Fonts are self-hosted WOFF2 through `next/font/local` with `display: swap`, so there are no
  third-party font requests.
- `SmoothScroll` calls `ScrollTrigger.refresh()` once fonts load, so swapped fonts do not leave
  scroll triggers measuring stale positions.
- Post cover images come from the R2 bucket through `next/image` in `PostCover`, with explicit
  `sizes`. Covers above the fold pass `eager`. Generated covers, case-study mock-ups and diagrams are
  inline SVG, so they cost no requests.

## Runtime cost

- Animate `transform` and `opacity` only. Use `gsap.quickSetter` or `quickTo` for values that
  change every frame.
- One frame loop: Locomotive runs on `gsap.ticker`, so scrolling and ScrollTrigger never compete.
- Scroll state is pushed to the store only when it changes meaningfully (`report()` in
  `src/stores/scrollSlice.ts`), so subscribed components do not re-render every frame.
- Heavy effects (pins, parallax, overscroll) only run on md-and-up viewports with motion allowed.

## Not yet measured

There is no field data on Core Web Vitals. The browser APIs for layout shift and interaction
latency are Chromium-only, which conflicts with the rule that every UI spec runs on all five
browser projects. Real-user monitoring (`useReportWebVitals`) or a dedicated Chromium-only
Playwright project are the two ways to add it.
