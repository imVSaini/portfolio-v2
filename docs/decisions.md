# Decisions

A log of the choices that are expensive to reverse: what was decided, why, and what it costs. Add
an entry when a change alters how the site is built, not for routine features. Never rewrite an
old entry; mark it superseded and add a new one.

Entries 1 to 3 were recorded on 20 November 2026, after the decisions were made. They describe
what the code does and the trade-offs it carries, not the original discussion.

| #   | Decision                                                                                       | Status   |
| --- | ---------------------------------------------------------------------------------------------- | -------- |
| 1   | [Content is typed TypeScript blocks](#1-content-is-typed-typescript-blocks)                    | Accepted |
| 2   | [Every page is prerendered; CSP avoids nonces](#2-every-page-is-prerendered-csp-avoids-nonces) | Accepted |
| 3   | [Locomotive Scroll runs on GSAP's ticker](#3-locomotive-scroll-runs-on-gsaps-ticker)           | Accepted |
| 4   | [Animated sections stay on the server](#4-animated-sections-stay-on-the-server)                | Accepted |
| 5   | [Architecture rules are enforced by tooling](#5-architecture-rules-are-enforced-by-tooling)    | Accepted |

---

## 1. Content is typed TypeScript blocks

**Context.** Each article is published as HTML, Markdown, RSS, part of `llms-full.txt`, JSON-LD and
an Open Graph card. All of those need the article's structure, not just rendered HTML.

**Decision.** Posts and case studies are typed objects in `src/data` with bodies built from
`TextBlock | DiagramBlock` helpers. Each output is a plain function over the blocks. The main
alternatives are MDX (directly, or through Velite or Content Collections) and a hosted CMS.

**Consequences.**

- One source feeds every output; diagram and cover names are literal unions mapped through
  `Record`s, so a missing drawing fails the build.
- No content build step or content dependency.
- Prose sits in string literals, and inline formatting is limited to what `TextBlock` supports.
- A new block type has to be handled by each renderer and by `readMinutes`.
- Revisit if the post count reaches the hundreds or someone other than the author edits content.

## 2. Every page is prerendered; CSP avoids nonces

**Context.** Nothing on the site varies per request. Theme preferences live in `localStorage`.

**Decision.** Build with `cacheComponents` and prerender every route. Visitor-specific values are
resolved in the browser through the pre-paint script or `useSyncExternalStore`. A future
Content-Security-Policy must not depend on per-request nonces, because the Next.js CSP guide notes
nonces require dynamic rendering. A strict `script-src` should go through the experimental
Subresource Integrity support instead.

**Consequences.**

- Pages are rendered at build time with nothing computed per request.
- Anything visitor-specific must avoid hydration mismatches.
- A nonce-based CSP is ruled out while this stands.

## 3. Locomotive Scroll runs on GSAP's ticker

**Context.** Pinned sections, scroll-scrubbed timelines and `data-scroll-speed` parallax each want
their own frame loop. When they disagree, pins jitter or land short.

**Decision.** Use Locomotive Scroll v5 (Lenis underneath), driven by `gsap.ticker` through
`initCustomTicker`, so everything shares one frame loop. All programmatic scrolling goes through
the scroll store. The main alternatives are GSAP's ScrollSmoother and plain Lenis; plain Lenis
would mean rebuilding the parallax Locomotive provides.

**Consequences.**

- Pins and scrubs stay in step with the smoothed position.
- Only `SmoothScroll.tsx` imports Locomotive. Swapping it touches that file, the scroll store, the
  `lenis` styles in `globals.css` and the components using `data-scroll-speed`.
- GSAP and Locomotive load on every page.

## 4. Animated sections stay on the server

- Date: 20 November 2026

**Context.** `Hero`, `Approach`, `Experience` and `Footer` were client components only so
`useGSAP` could hold a ref on their outer element, which made their children and data client code
too.

**Decision.** Each section stays a Server Component and renders its outer element through a client
wrapper (`HeroMotion`, `ApproachMotion`, `ExperienceMotion`, `FooterMotion`) that owns the ref and
the animation and receives the markup as `children`. Targets are found by `data-*` attributes.

**Consequences.**

- The home page lost 7.7 KB of gzipped script and every other page 1.6 KB.
- Motion and markup live in two files, linked by attribute names.
- New animated sections follow the same split.

## 5. Architecture rules are enforced by tooling

- Date: 20 November 2026

**Context.** Rules that live only in `AGENTS.md` drift. The direction of imports and the weight of
each page are the easiest to break without noticing.

**Decision.**

- ESLint `no-restricted-imports` enforces `data → lib, hooks, stores → components → app`.
- `e2e/http/budget.spec.ts` fails any page above 330 KB of gzipped script, in CI.
- `typedRoutes` makes a link to a missing route a type error.
- `buildPageMetadata()`, `getPostPath()` and `getCaseStudyPath()` are the only ways pages build
  metadata and article URLs.

**Consequences.**

- Layer breaks, heavy dependencies and broken links fail `npm run check` or CI instead of review.
- The budget sits about 3% above the heaviest page (322 KB). Raising it is a deliberate change in
  the commit that needs it, with the reason in the message.
