# Client state

The site has very little client state, and none of it comes from a server. It falls into three
kinds: visitor preferences, page-wide motion state, and values that only exist in the browser.

## The store

Shared client state lives in one zustand store, `useAppStore` (`src/stores/index.ts`), built with
the [slices pattern](https://zustand.docs.pmnd.rs/learn/guides/slices-pattern). Each feature owns
one file holding its state type, its initial values and its actions:

```
src/stores/
  index.ts            useAppStore, AppStore, AppSlice, whenIntroDone()
  appearanceSlice.ts  theme, accent, tone; the split localStorage adapter
  introSlice.ts       preloader handover
  logoSlice.ts        header logo fold
  scrollSlice.ts      scroll state and scrollTo()
```

| Slice        | State                                             | Written by                 | Read by                                     |
| ------------ | ------------------------------------------------- | -------------------------- | ------------------------------------------- |
| `appearance` | `theme`, `accent`, `tone` and their setters       | Appearance menu and drawer | `AppearanceControls`; applied to `<html>`   |
| `intro`      | `done`, `handoff`, `finish()`                     | `Preloader`                | `whenIntroDone()` in hero and reveal motion |
| `scroll`     | `direction`, `scrolled`, `progress`, `scrollTo()` | `SmoothScroll`             | `Header`, `ScrollProgress`, `ScrollLink`    |
| `logo`       | `folded`                                          | Header `Logo` on scroll    | The mobile menu's copy of the logo          |

Components select one field per call, or several through `useShallow`. The store changes on
every scroll frame, so `useAppStore()` with no selector would re-render on every frame:

```ts
const scrolled = useAppStore((s) => s.scrolled);
const { theme, setTheme } = useAppStore(useShallow(({ theme, setTheme }) => ({ theme, setTheme })));
```

Outside React (inside GSAP callbacks or helpers), read and write with `getState()`:

```ts
useAppStore.getState().scrollTo("#work");
const stopWaiting = whenIntroDone(() => intro.play());
```

### Adding a slice

1. Create `src/stores/thingSlice.ts` exporting `type ThingSlice` and
   `createThingSlice: AppSlice<ThingSlice>`. `AppSlice` types `set` and `get` against the whole
   store, so a slice can read another slice's state.
2. Add `ThingSlice` to `AppStore` and spread `createThingSlice(...a)` into `useAppStore`.
3. Keep field names distinct across slices: the store is flat, and a repeated key silently
   overwrites the earlier slice's.
4. Put middleware on the combined store only. Zustand warns that middleware inside a slice can
   lead to unexpected issues.

### Appearance

`useAppStore` persists the appearance values through zustand's `persist` middleware
(`partialize` keeps only `theme`, `accent` and `tone`) with a custom storage that writes
each value under its own plain-string key (`vks-theme`, `vks-accent`, `vks-tone`) instead of one
JSON blob, so the pre-paint script can read them without parsing. Values are validated against
`THEMES`, `ACCENTS` and `TONES` on read; anything else falls back to the defaults
(`system`, `gold`, `deep`). Blocked storage (private mode) keeps the choice in memory.

`persist` calls the storage after every change to the store, scroll reports included, so the
adapter remembers what it last wrote and skips writes when the three values have not changed.

When `theme`, `accent` or `tone` changes, the store calls `applyAppearance()`, which toggles
`.dark`, sets `data-accent` and `data-tone`, and updates `<meta name="theme-color">`.

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
