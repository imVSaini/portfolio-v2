# Design system

There is no `tailwind.config`. The whole design system lives in `src/app/globals.css` as Tailwind
CSS v4 `@theme` tokens, `@custom-variant`s and `@utility`s. Components use only these tokens.

## Colour

The default Tailwind palette is switched off (`--color-*: initial`), so classes such as
`gray-500` do not exist and fail lint. Use the theme palette.

### Brand palette

| Token                              | Value                                      | Use                              |
| ---------------------------------- | ------------------------------------------ | -------------------------------- |
| `manila-light`                     | `#f3e7d2`                                  | Light page background, dark text |
| `manila-25` … `manila-dark`        | `#e7ddc6` … `#bfb39e`                      | Light surfaces and rules         |
| `faded-black`                      | `#1e1d1d` (`#151414` deep)                 | Light text, dark page background |
| `soot`, `warm-gray`                | `#32302f`, `#403c38`                       | Dark surfaces                    |
| `orange`, `gold`, `red`, `magenta` | `#ff6200`, `#ffa81b`, `#eb3132`, `#cc3566` | Accents and tints                |
| `bright-yellow`, `magenta-dark`    | `#ffca18`, `#922e4f`                       | The overscroll colour bands      |

### Semantic tokens

These resolve through CSS variables, so they change with the theme. Prefer them over raw palette
colours for anything structural.

| Token                       | Light                      | Dark                          |
| --------------------------- | -------------------------- | ----------------------------- |
| `surface`, `surface-raised` | manila mixed with white    | `soot`, `warm-gray`           |
| `line`, `line-strong`       | `manila-75`, `manila-dark` | manila at 10% and 18%         |
| `muted`                     | faded-black at 65%         | manila at 60%                 |
| `hover`                     | `manila-50`                | `warm-gray`                   |
| `accent`                    | follows `data-accent`      | follows `data-accent`, lifted |
| `info`                      | `#26769b`                  | `#6bb9dc`                     |
| `code-*`                    | Light+ syntax colours      | Dark+ syntax colours          |

No raw hex values or arbitrary colours in class names. If a value repeats, add a token.

## Appearance: theme, tone and accent

Visitors choose three things in the Appearance menu. Each is an attribute on `<html>`:

| Setting | Values                             | Default  | Effect                                                                                      |
| ------- | ---------------------------------- | -------- | ------------------------------------------------------------------------------------------- |
| Theme   | `system`, `light`, `dark`          | `system` | Toggles the `.dark` class (`system` follows the OS)                                         |
| Tone    | `soft`, `deep`                     | `deep`   | `data-tone="deep"` darkens `faded-black`, `soot`, `warm-gray` in dark mode                  |
| Accent  | `gold`, `orange`, `red`, `magenta` | `gold`   | `data-accent` re-points `--color-accent`; lightness is tuned per theme with `oklch(from …)` |

The values are defined once in `src/lib/appearance.ts` (`THEMES`, `TONES`, `ACCENTS`). The
pre-paint script and the store both read from there. `<meta name="theme-color">` follows the
resolved surface. See [Client state](./client-state.md) for how the choice is stored and applied.

Check every new colour in light, dark-soft and dark-deep, and against all four accents.

## Typography

Two self-hosted fonts, loaded with `next/font/local` in `src/app/layout.tsx`:

- `font-display`: **Clash Display** (400–700). All headings use it by default.
- `font-sans`: **Satoshi** (400, 400 italic, 500, 700, 900). The body default.

The type scale is fluid and set as tokens with their own line height and tracking:

| Class                | Size                                    | Use                      |
| -------------------- | --------------------------------------- | ------------------------ |
| `text-h1`            | `clamp(3rem, min(8.4vw, 15svh), 10rem)` | One per page             |
| `text-h2`            | up to `7rem`                            | Section titles           |
| `text-h3`            | `clamp(1.875rem, 3.6vw, 3.25rem)`       | Article titles, subheads |
| `text-h4`            | `clamp(1.375rem, 2vw, 1.75rem)`         | Card titles              |
| `text-p1`            | `clamp(1.1875rem, 1.6vw, 1.5rem)`       | Lead paragraphs          |
| `text-p2`            | `1rem`                                  | Body                     |
| `text-p3`, `text-p4` | `0.875rem`, `0.75rem`                   | Small text and labels    |
| `text-prose`         | `1.125rem` / 1.75                       | Article bodies           |

Do not add Google Fonts links. New weights go into `src/app/fonts` as `.woff2`. Keep the two
`.ttf` files there: the Open Graph renderer cannot read WOFF2.

## Custom variants

| Variant                            | Matches                                                                    |
| ---------------------------------- | -------------------------------------------------------------------------- |
| `intent:`                          | Hover on devices that can hover, or keyboard focus on or within            |
| `group-intent:`                    | The same, for a parent marked `group`                                      |
| `dark:`                            | Inside `.dark` (class-based, not the media query)                          |
| `starting-style:`, `ending-style:` | Base UI enter and exit states (`data-starting-style`, `data-ending-style`) |
| `tall:`                            | Viewports at least `37.5rem` tall                                          |

Use `intent:` instead of `hover:` alone, so every interactive state also shows for keyboard users.
Plain `:focus-within` is avoided on purpose: Base UI returns focus to a popover's trigger after a
mouse click, which would leave it highlighted.

## Utilities

| Utility                | Does                                                         |
| ---------------------- | ------------------------------------------------------------ |
| `container-page`       | Centred, max `90rem`, with the fluid `--page-gutter` padding |
| `text-stroke-<colour>` | Outlined display type in a palette colour                    |
| `diagram-dots`         | The dotted grid behind article diagrams                      |
| `corner-squircle`      | `corner-shape: squircle` where supported                     |

`--header-h` (`4.5rem`) sizes the fixed header and sets `scroll-padding-top`, so anchored headings
land below it.

## Global details

- A fixed SVG noise layer (`body::after`) adds paper grain, blended differently in dark mode.
- Focus rings are a 2px gold outline with a 2px offset, everywhere.
- `html.motion-ok [data-reveal]` hides split-text targets until GSAP reveals them. The class is only
  added when motion will run, so text is never hidden for no-script or reduced-motion visitors.

## Writing classes

- **Mobile first.** A bare class styles phones; add `sm:`, `md:` and `lg:` upwards. No `max-*`
  variants.
- **Lengths in `rem`.** Anything over 2px is a `rem` value; only hairlines of 2px or less stay `px`.
- **Combine with `cn()`.** Conditional or overriding classes go through `cn()` from `@/lib/cn`
  (`clsx` plus `tailwind-merge`), never string concatenation.
- **Variants as maps.** Component variants are an `as const` object keyed with `keyof typeof`, as
  in `ui/Button.tsx`.
- **Don't hand-sort.** Prettier's Tailwind plugin orders classes; `eslint-plugin-better-tailwindcss`
  rejects unknown classes.
- **Script hooks are attributes.** Use `data-*` attributes for anything scripts select. If a class
  is unavoidable, prefix it `js-`.
- **320px and up.** Layouts must work from 320px wide with no horizontal page scroll.
- **Stay on theme.** Sections use the site's own type-led language: no inverted slabs or generic
  card, pill or step templates on the home page. (The blog index's card grid is the exception.)
- After editing `globals.css`, restart `next dev`; it can keep serving stale CSS.
