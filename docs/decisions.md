# Decisions

A log of the choices that are expensive to reverse: what was decided, why, and what it costs. Add
an entry when a change alters how the site is built, not for routine features. Never rewrite an
old entry; mark it superseded and add a new one.

Entries 1 to 3 were recorded on 20 November 2026, after the decisions were made. They describe
what the code does and the trade-offs it carries, not the original discussion.

| #   | Decision                                                                                                               | Status   |
| --- | ---------------------------------------------------------------------------------------------------------------------- | -------- |
| 1   | [Content is typed TypeScript blocks](#1-content-is-typed-typescript-blocks)                                            | Accepted |
| 2   | [Every page is prerendered; CSP avoids nonces](#2-every-page-is-prerendered-csp-avoids-nonces)                         | Accepted |
| 3   | [Locomotive Scroll runs on GSAP's ticker](#3-locomotive-scroll-runs-on-gsaps-ticker)                                   | Accepted |
| 4   | [Animated sections stay on the server](#4-animated-sections-stay-on-the-server)                                        | Accepted |
| 5   | [Architecture rules are enforced by tooling](#5-architecture-rules-are-enforced-by-tooling)                            | Accepted |
| 6   | [ESLint 10 runs the Next.js presets through a compat shim](#6-eslint-10-runs-the-nextjs-presets-through-a-compat-shim) | Accepted |
| 7   | [Client state is one store built from slices](#7-client-state-is-one-store-built-from-slices)                          | Accepted |
| 8   | [CI builds outside the Playwright image](#8-ci-builds-outside-the-playwright-image)                                    | Accepted |

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
- `e2e/http/script-budget.spec.ts` fails any page above 330 KB of gzipped script, in CI.
- `typedRoutes` makes a link to a missing route a type error.
- `buildPageMetadata()`, `getPostPath()` and `getCaseStudyPath()` are the only ways pages build
  metadata and article URLs.

**Consequences.**

- Layer breaks, heavy dependencies and broken links fail `npm run check` or CI instead of review.
- The budget sits about 3% above the heaviest page (322 KB). Raising it is a deliberate change in
  the commit that needs it, with the reason in the message.

## 6. ESLint 10 runs the Next.js presets through a compat shim

- Date: 21 November 2026

**Context.** ESLint 9 reached end of life on 6 August 2026 and npm marks it deprecated.
`eslint-config-next` supports ESLint 10 from 16.4.0, but it bundles `eslint-plugin-import` 2.32.0,
whose `import/order` calls `sourceCode.getTokenOrCommentAfter()`. ESLint 10 removed that method, so
the rule crashes the whole lint run as soon as it has an import to report. A clean tree hides it.
The upstream fix (import-js/eslint-plugin-import#3230) is merged but not released.
`eslint-plugin-react` and `eslint-plugin-jsx-a11y` also still cap their peer range at ESLint 9.

**Decision.**

- Run ESLint 10 and wrap the `eslint-config-next` presets in `fixupConfigRules()` from
  `@eslint/compat`, the ESLint team's shim that restores the removed APIs for older plugins.
- Keep `eslint-plugin-import` and every `import/*` rule name. `eslint-plugin-import-x` was the
  alternative, but it renames every rule, needs its own resolver setup, and `eslint-config-next`
  would still load the original plugin.

**Consequences.**

- Lint results match ESLint 9 rule for rule, autofix included. Lint time is unchanged.
- `package.json` `overrides` scopes `"eslint": "$eslint"` to `eslint-plugin-import`,
  `eslint-plugin-jsx-a11y` and `eslint-plugin-react`, the documented npm way to point a child's
  dependency at a direct dependency's spec. It accepts ESLint 10 as their peer, so installs print
  no `ERESOLVE overriding peer dependency` warnings. It is safe only because the shim makes those
  plugins work on ESLint 10.
- `react/jsx-uses-vars` and `react/jsx-uses-react` are off. ESLint 10 counts a JSX tag as a
  reference to its variable, which the v10 migration guide says makes `jsx-uses-vars` redundant,
  and the automatic JSX runtime never needs `React` in scope. These stay off after the shim goes.
- Remove `@eslint/compat`, the wrapper and the three overrides together once `eslint-config-next`
  ships plugin releases that declare ESLint 10. Before removing it, lint a file with a misordered import: a clean tree passes
  even while the rule is broken.

## 7. Client state is one store built from slices

- Date: 21 November 2026

**Context.** Client state lived in four separate zustand stores (`useAppearance`, `useIntro`,
`useLogo`, `useScroll`), one file each. The alternative layout seen in other projects splits each
store by kind (`actions.ts`, `selectors.ts`, `state.ts`, `types.ts`), which spreads one feature
across five files.

**Decision.** One store, `useAppStore`, combined from one slice file per feature, following
zustand's slices pattern and its advice that global state belongs in a single store. Each slice is
an `AppSlice<Slice>` (a `StateCreator` typed against the whole store). `persist` wraps the combined
store and `partialize` keeps only the appearance values.

**Consequences.**

- A feature's state, actions and types stay in one file; a new feature is one file plus two lines
  in `index.ts`.
- Every `set` notifies every subscriber, and `persist` calls the storage after every `set`,
  including per-frame scroll reports. The appearance adapter skips unchanged writes, the
  `applyAppearance` subscriber compares the three values, and components must select one field or
  use `useShallow`. `e2e/ui/appearance.spec.ts` checks that scrolling never writes storage.
- The store is flat, so field names must be unique across slices.
- The store stays a module-level `create()` store rather than zustand's Next.js per-request
  provider. That guide guards against request data leaking between visitors through a server
  module; this store holds only browser state, is never written during a server render, and is read
  through `getState()` outside React (GSAP callbacks, `scrollToAnchor`, `whenIntroDone`), which a
  context-scoped store would not allow. Revisit if server data ever seeds the store.
- Slices type themselves with `[["zustand/persist", unknown]]`; the precise persisted type does not
  infer through `create<AppStore>()(persist(...))`, which zustand's TypeScript guide anticipates.
- Revisit if a slice needs its own middleware or lifecycle, for example a separately persisted
  slice. That slice would move back to its own store.

---

## 8. CI builds outside the Playwright image

- Date: 22 November 2026

**Context.** The `build` job ran inside `mcr.microsoft.com/playwright:v<version>-noble`, so it
needed the `version` job first and then pulled the browser image, only to run `next build`. The
reason given was that `.next` records absolute paths, which differ between the runner
(`/home/runner/work/...`) and the container (`/__w/...`). The only production files that record
them are `required-server-files.json` and `.js`, which only the standalone server reads;
`next start` does not. A build served from a different absolute path passed the `http`,
`document`, smoke and navigation suites.

**Decision.** `build` runs on `ubuntu-latest` with no `needs`. The shards stay in the Playwright
image and still need `version` and `build`. The `.next/cache` key carries `runner.os`, so the
first run does not restore a cache written inside the container.

**Consequences.**

- `build` starts alongside `gate`, `check` and `version`, without the image pull.
- Build and shards share Node (`.nvmrc`), Ubuntu 24.04 and the lockfile, but not the exact image.
- Revisit if the build starts producing native or path-bound output, such as
  `output: "standalone"`. Move `build` back into the image then.
