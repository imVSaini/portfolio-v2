# 0003. Locomotive Scroll v5 runs on GSAP's ticker

- Status: Accepted
- Date: 2026-11-20 (recorded after the fact; the decision predates this record)

## Context

The home page pins sections, scrubs timelines against scroll and uses `data-scroll-speed`
parallax. Smooth scrolling, ScrollTrigger and parallax each want their own animation frame loop,
and when they disagree, pinned sections jitter or land short.

## Decision

Use Locomotive Scroll v5, which is Lenis underneath, and drive it from `gsap.ticker` through
`initCustomTicker` so smooth scrolling, parallax and every ScrollTrigger share one frame loop
(`src/components/scroll/SmoothScroll.tsx`). All programmatic scrolling goes through
`useScroll().scrollTo`, which falls back to a native jump until the scroller boots and under
reduced motion.

The main alternatives are GSAP's ScrollSmoother and plain Lenis. Plain Lenis would mean rebuilding
the `data-scroll-speed` parallax that Locomotive provides.

## Consequences

- One frame loop, so pins and scrubs stay in step with the smoothed position.
- Only `SmoothScroll.tsx` imports Locomotive. Swapping the scroller touches that file, the scroll
  store, the `lenis` styles in `globals.css` and the components that use `data-scroll-speed`.
- GSAP and Locomotive load on every page, including pages with little motion (see 0005 for the
  budget that keeps this in check).
