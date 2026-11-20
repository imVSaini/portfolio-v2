# 0005. Layering and script weight are enforced by tooling

- Status: Accepted
- Date: 2026-11-20

## Context

Rules that live only in `AGENTS.md` drift. Two properties of this codebase matter most and are
easy to break without noticing: the direction of imports between layers, and how much JavaScript
each page loads.

## Decision

- **Import direction.** ESLint `no-restricted-imports` enforces
  `data → lib, hooks, stores → components → app`: `src/data` imports only `src/data`; `src/lib`,
  `src/hooks` and `src/stores` never import components or routes; components never import routes.
- **Script budget.** `e2e/http/budget.spec.ts` fetches every page's `<script src>` files, gzips
  them and fails when a page exceeds the budget. It runs in the `http` project, so CI enforces it
  with the rest of the Playwright suite.
- **Typed links.** `typedRoutes` makes a link to a route that does not exist a type error.

## Consequences

- Breaking a layer, adding a heavy dependency or misspelling a route fails `npm run check` or CI
  rather than review.
- The budget was set at 330 KB, about 3% above the heaviest page when measured (322 KB on posts).
  Raising it is a deliberate change in the same commit as the code that needs it, with the reason
  in the commit message.
- About 139 KB of that weight is one shared chunk holding GSAP with every registered plugin,
  Locomotive, Base UI and zustand. Splitting rarely used plugins out of `@/lib/gsap` is the main
  lever for lowering the budget.
