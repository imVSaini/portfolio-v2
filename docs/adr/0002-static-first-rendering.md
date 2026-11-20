# 0002. Every page is prerendered; CSP avoids nonces

- Status: Accepted
- Date: 2026-11-20 (recorded after the fact; the decision predates this record)

## Context

The site has no per-visitor data. Theme preferences live in `localStorage` and are applied by an
inline script before first paint (`appearanceScript`), so the server never needs to know them.

## Decision

Build with `cacheComponents` and prerender every route, including each post and case study through
`generateStaticParams`. Server Components are the default; client code is limited to motion,
browser state and interactive primitives.

A Content-Security-Policy, when added, must not depend on per-request nonces: the Next.js CSP guide
notes nonces require dynamic rendering, which would give up the static shell. A strict
`script-src` should go through the experimental Subresource Integrity support instead.

## Consequences

- Pages are rendered at build time, with nothing computed per request.
- Anything that varies by visitor (theme, current year, clock) must be resolved on the client
  without a hydration mismatch, through an inline script or `useSyncExternalStore` with a server
  snapshot.
- A nonce-based CSP is ruled out while this decision stands.
