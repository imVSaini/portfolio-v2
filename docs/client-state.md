# Client state

The site has very little client state, and none of it comes from a server. It falls into three
kinds: visitor preferences, page-wide motion state, and values that only exist in the browser.

## Stores

Shared client state uses zustand stores in `src/stores`, created with `create<State>()(...)`.
Components select only the slice they need:

```ts
const scrolled = useScroll((s) => s.scrolled);
```

| Store           | State                                             | Written by                 | Read by                                          |
| --------------- | ------------------------------------------------- | -------------------------- | ------------------------------------------------ |
| `useAppearance` | `theme`, `accent`, `tone` and their setters       | Appearance menu and drawer | `AppearanceControls`; applies itself to `<html>` |
| `useIntro`      | `done`, `handoff`, `finish()`                     | `Preloader`                | `whenIntroDone()` in hero and reveal motion      |
| `useScroll`     | `direction`, `scrolled`, `progress`, `scrollTo()` | `SmoothScroll`             | `Header`, `ScrollProgress`, `ScrollLink`         |
| `useLogo`       | `folded`                                          | Header `Logo` on scroll    | The mobile menu's copy of the logo               |

Outside React (inside GSAP callbacks or helpers), read and write with `getState()`:

```ts
useScroll.getState().scrollTo("#work");
const stopWaiting = whenIntroDone(() => intro.play());
```

### Appearance

`useAppearance` persists through zustand's `persist` middleware with a custom storage that writes
each value under its own plain-string key (`vks-theme`, `vks-accent`, `vks-tone`) instead of one
JSON blob, so the pre-paint script can read them without parsing. Values are validated against
`THEMES`, `ACCENTS` and `TONES` on read; anything else falls back to the defaults
(`system`, `gold`, `deep`). Blocked storage (private mode) keeps the choice in memory.

On every change the store calls `applyAppearance()`, which toggles `.dark`, sets `data-accent`
and `data-tone`, and updates `<meta name="theme-color">`.

### Why there is an inline script

React cannot know the stored theme during server rendering, so applying it after hydration would
flash the wrong colours. `appearanceScript` (in `src/lib/appearance.ts`, injected in the root
layout's `<head>`) runs synchronously before first paint. It:

1. Reads the three keys, validates them and applies the same classes and attributes as
   `applyAppearance()`.
2. Keeps following the OS colour scheme while the theme is `system`.
3. Adds `html.motion-ok` when the visitor has not asked for reduced motion.
4. Marks the first page of a session with `data-intro="play"`.
5. Removes `motion-ok` after four seconds if the app never signalled `data-motion-ready`.

The script and the store share their constants, so they cannot drift apart. `<html>` has
`suppressHydrationWarning` because the script changes its attributes before React hydrates.

## Browser-only values

Never read `window`, `document`, `localStorage` or the clock during render. Use a
`useSyncExternalStore` hook with a server snapshot, so the server HTML and the first client render
match:

| Hook                      | Server snapshot | Client value                     |
| ------------------------- | --------------- | -------------------------------- |
| `usePrefersReducedMotion` | `false`         | `prefers-reduced-motion: reduce` |
| `usePrefersDark`          | `false`         | `prefers-color-scheme: dark`     |
| `useIsHydrated`           | `false`         | `true`                           |
| `useCurrentYear`          | build year      | the visitor's current year       |

`CurrentYear` wraps `useCurrentYear` as a tiny client component, so the server-rendered footer can
show the year without becoming a client component itself. `LiveClock` and `DayPeriod` in the
contact section show the time in `site.timeZone` (`Asia/Kolkata`) on the client.

## What is not state

- **Content** is imported data, never fetched.
- **The URL** owns navigation and in-page position (`#hash`).
- **Base UI** owns open/closed state for menus, popovers, dialogs and drawers.
- **Next.js `<Activity>`** preserves state on recently visited pages. Effects are cleaned up while
  a page is hidden and re-run when it is shown again.
