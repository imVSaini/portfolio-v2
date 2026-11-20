# Motion and scroll

Motion is GSAP plus Locomotive Scroll v5 (Lenis underneath), sharing one frame loop. Every effect
is an enhancement: the page is complete and usable with JavaScript off or with
`prefers-reduced-motion: reduce`.

## The GSAP entry point

Import GSAP, its plugins and `useGSAP` only from `@/lib/gsap`. It registers `ScrollTrigger`,
`SplitText`, `Observer`, `MorphSVGPlugin` and `useGSAP` once, and exports two media queries:

| Constant               | Query                                                                       |
| ---------------------- | --------------------------------------------------------------------------- |
| `MOTION_QUERY`         | `(prefers-reduced-motion: no-preference)`                                   |
| `DESKTOP_MOTION_QUERY` | the above, plus `min-width: 768px` and `min-height: 600px` (pins, parallax) |

Never import from `"gsap"` or `"gsap/*"` in a component. A new plugin is registered in
`src/lib/gsap.ts`.

## Writing an animation

```tsx
useGSAP(
  () => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_QUERY, () => {
      gsap.from("[data-thing]", { y: 24, opacity: 0, scrollTrigger: { trigger: ref.current } });
    });
    return () => mm.revert();
  },
  { scope: ref },
);
```

- Run GSAP inside `useGSAP` with a `scope`, never in `useEffect`. Everything created inside reverts
  when the component unmounts or is hidden by `<Activity>`.
- Wrap effects in `gsap.matchMedia()` with `MOTION_QUERY`, or `DESKTOP_MOTION_QUERY` for md-and-up
  effects, and return the cleanup (`mm.revert()`, `split.revert()`).
- Select targets with `data-*` attributes scoped to the ref, not classes.
- Animate `transform` and `opacity`, not layout properties.
- Don't hide content in CSS that only an animation reveals, unless the reduced-motion path shows
  it too.
- For CSS or SVG motion GSAP does not drive, respect `usePrefersReducedMotion` or
  `motion-reduce:` classes.

### Animating a section

Sections stay Server Components. Put the `useGSAP` block in a client wrapper beside the section
that renders its outer element and takes the markup as `children`:

| Section      | Wrapper                                    | What it animates                                                        |
| ------------ | ------------------------------------------ | ----------------------------------------------------------------------- |
| `Hero`       | `sections/hero/HeroMotion.tsx`             | Fades `data-hero-fade` in after the intro, sinks the headline on scroll |
| `Approach`   | `sections/approach/ApproachMotion.tsx`     | Scrubs manifesto words, stacks principle cards                          |
| `Experience` | `sections/experience/ExperienceMotion.tsx` | Draws the timeline spine, lifts each role in                            |
| `Footer`     | `layout/FooterMotion.tsx`                  | Raises the wordmark, pointer lift on hover                              |

Do not add `"use client"` to a section to animate it. See [Architecture](./architecture.md#the-client-boundary).

## Reusable motion components

| Component           | Kind   | Does                                                                                                                              |
| ------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `RevealText`        | client | Masked line-by-line rise with SplitText, re-split on reflow. `on="load"` waits for the intro; `on="scroll"` waits for the element |
| `RollText`          | server | Per-character roll on hover or focus of the nearest `group`, pure CSS                                                             |
| `Marquee`           | client | Infinite loop that speeds up with scroll velocity and flips with direction                                                        |
| `HorizontalSection` | client | Pins a section and turns vertical scroll into sideways travel (Work)                                                              |
| `OverscrollReveal`  | client | Wheeling past the page end lifts the page over colour bands, then springs back                                                    |

`RevealText` and `RollText` split text into `aria-hidden` glyphs and keep the full string for
screen readers.

### `HorizontalSection` attributes

Inside it, mark panels with `data-h-panel`, layers that drift with `data-h-parallax="<xPercent>"`
and pieces that rise in with `data-h-reveal`. They ride the pinned tween as a
`containerAnimation`. Below md the track stacks vertically; from md without the pin (short viewport
or reduced motion) it becomes a two-column grid.

## Smooth scroll

`SmoothScroll` (mounted by `PageShell` on every page) starts Locomotive Scroll and drives it from
`gsap.ticker`, so smooth scrolling, `data-scroll-speed` parallax and every ScrollTrigger share one
frame loop. `gsap.ticker.lagSmoothing(0)` keeps them in step.

- Under reduced motion it never starts; a passive native scroll listener reports progress instead.
- It sets `html[data-motion-ready]` once mounted, the signal tests wait for.
- When webfonts finish loading it calls `ScrollTrigger.refresh()` and re-applies any `#hash`
  target, because new line boxes move every trigger.
- Vertical parallax: `data-scroll data-scroll-speed="0.1"` on an element.

### Scrolling from code

Never call `window.scrollTo`. Use `useScroll().scrollTo(target, { offset, immediate })` or the
`ScrollLink` component:

```tsx
<ScrollLink href="#work">Work</ScrollLink>;
useScroll.getState().scrollTo("#contact");
```

The store's `scrollTo` jumps natively until Locomotive boots, then is replaced with an eased glide
that offsets for the fixed header. Lenis fixes an element's destination when the glide starts, so
if the layout above the target changes during the glide (a panel still opening, a late image), the
scroll would stop short. When a glide to an element ends away from its target, one short corrective
glide follows. `ScrollLink` also moves keyboard focus to the target and
updates the URL hash, as native fragment navigation would (`scrollToAnchor` in `src/lib`).

## The intro

`Preloader` lives on the home page only. The wordmark inks in letter by letter (MorphSVG), waits for
fonts and hydration (at most 2s after hydration), then flies into the header logo and lifts away.

When it plays:

1. The pre-paint script sets `html.motion-ok` unless the visitor prefers reduced motion.
2. On the first page load of a browser session it sets `sessionStorage["vks-intro"]` and
   `html[data-intro="play"]`. Later loads in the session skip it, and so does a session that
   started on another page.
3. While it plays, the header, `main` and footer are `inert`.
4. It ends by calling `useIntro.getState().finish(handoff)`. Page motion that must wait, such as
   the hero fade and `RevealText on="load"`, uses `whenIntroDone()`.

Safety net: if `data-motion-ready` has not appeared four seconds after first paint, the pre-paint
script removes `motion-ok`, so hidden reveal targets show even if JavaScript failed.

## Reduced motion checklist

- GSAP effects sit inside `MOTION_QUERY` or `DESKTOP_MOTION_QUERY`.
- CSS transitions have `motion-reduce:transition-none` (or similar) where they move things.
- Smooth scroll, the intro, overscroll and pinning do not run.
- Diagrams show their finished drawing and no replay control.
- Tests cover it with `test.use({ contextOptions: { reducedMotion: "reduce" } })`.
