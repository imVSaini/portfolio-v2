<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Portfolio

A one-page personal portfolio: Next.js 16 (App Router), React 19, TypeScript (strict),
Tailwind CSS v4, GSAP and Locomotive Scroll for motion, zustand for client state, and Base UI
for accessible primitives.

## Layout

- `src/app`: routes, root layout, `globals.css` (the design system) and self-hosted fonts.
- `src/components`: `layout`, `sections`, `motion`, `scroll`, `ui`, `appearance`.
- `src/data`: typed site content (projects, experience, skills, contact, site meta).
- `src/lib`: shared helpers (`cn`, the `gsap` setup, appearance).
- `src/hooks`, `src/stores`: React hooks and zustand stores.

## Commands

- `npm run dev`: dev server
- `npm run check`: typecheck, lint and format check. Run it before calling a change done.
- `npm run lint:fix` and `npm run format`: autofix

## Working agreements

- Match the surrounding code. Do not add dependencies without asking.
- This file is the single source of rules for every agent (Cursor reads it directly; `CLAUDE.md`
  imports it). Edit only below the Next.js block above; `next dev` rewrites that block.

## TypeScript standards

The compiler runs `strict` plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` and
`noImplicitOverride`. Write code that passes them as they are; never loosen `tsconfig.json`.

### Types

- Use `type`, not `interface`.
- No `enum`. Use a string-literal union (`"load" | "scroll"`), or a `const` array plus
  `(typeof THEMES)[number]` when the values are also needed at runtime.
- No `any`, `@ts-ignore` or `@ts-expect-error`. Take `unknown` and narrow it.
- Avoid `as`. It is fine only after a runtime check has proven the type (see `read()` in
  `src/stores/appearance.ts`). Never use `!` to silence a possible `undefined`.
- Index access (`list[0]`, `record[key]`) can be `undefined`. Handle it with a guard, `?.` or `??`.
- With `exactOptionalPropertyTypes`, `prop?: T` does not accept an explicit `undefined`. Omit the
  key, or spread it in conditionally: `...(on === "scroll" && { scrollTrigger })`.
- Use `as const` for lookup objects and derive keys with `keyof typeof variants`.
- Template literal types are welcome where they catch mistakes, such as `` `#${string}` `` for
  in-page anchors.

### Functions and exports

- Named exports only. Default exports are only for files Next.js requires them in (`page.tsx`,
  `layout.tsx`, `robots.ts`, `sitemap.ts` and so on).
- Use `function` declarations for components and helpers. Arrow functions are for callbacks and
  object members.
- Exported helpers in `src/lib` and `src/hooks` declare their return type. Components and private
  helpers can let it be inferred.
- Prefix intentionally unused parameters and variables with `_`.

### Imports

- Use the `@/` alias for anything under `src/`. Relative imports are only for siblings such as
  `./globals.css` or `./fonts/...`.
- Type-only imports use `import type` or an inline `type` specifier (ESLint enforces this).
- Order groups with a blank line between them: packages, then `@/` modules, then relative files.

### Naming

- Components and their files: `PascalCase` (`RevealText.tsx` exports `RevealText`).
- Hooks: `useThing.ts` exporting `useThing`. Stores export a `useThing` hook too.
- Module-level config constants: `SCREAMING_SNAKE_CASE` (`MOTION_QUERY`, `THEME_COLORS`).
- Data and everything else: `camelCase` (`projects`, `site`).

### Comments

- Comment why, not what. A one-line `/** ... */` above an export when its purpose or units are
  not obvious (`/** 0–1 through the whole document. */`).
- No commented-out code and no `TODO` without context.

## React and Next.js

This is Next.js 16 (App Router) with React 19. APIs differ from older versions. Read the relevant
guide in `node_modules/next/dist/docs/` before using a Next.js API you have not checked here.

### Server and client components

- Components are server components by default. Add `"use client"` only when a component needs
  state, effects, event handlers, DOM refs for animation or browser APIs.
- Keep the client boundary at the leaves. A section such as `Work.tsx` stays on the server and
  renders client pieces such as `HorizontalSection`.
- Never read `window`, `document` or `localStorage` during render. Do it in effects, `useGSAP`
  or a `useSyncExternalStore` subscription with a server snapshot.

### Components

- One exported component per file, named after the file. Small private sub-components used only
  by that file can live beside it (`ProjectPanel` in `Work.tsx`).
- Declare props as `type ThingProps = { ... }` above the component and destructure them in the
  signature, with defaults there (`on = "scroll"`).
- Folders: `layout/` (page chrome), `sections/` (page sections), `motion/` (reusable animation),
  `scroll/` (smooth scroll), `ui/` (primitives), `appearance/` (theme controls).
- Content that repeats or might change (projects, skills, links, site meta) lives in
  `src/data/*.ts` as typed data. Components read it rather than hard-coding it.
- For accessible primitives (menus, popovers, toggles) use `@base-ui/react` rather than building
  them by hand.

### Hooks and state

- Custom hooks live in `src/hooks`. Subscribe to browser state with `useSyncExternalStore`
  (see `usePrefersReducedMotion`).
- Shared client state uses zustand stores in `src/stores`, created with `create<State>()(...)`.
  Select only the slice a component needs.

### Next.js specifics

- Use the global route type helpers (`LayoutProps<"/">`, `PageProps<"/...">`) for route props.
- Metadata goes through the `metadata` and `viewport` exports, built from `src/data/site.ts`.
- Fonts are self-hosted with `next/font/local`. Do not add Google Fonts links.

### Accessibility

- Use semantic elements (`section`, `article`, `nav`, `ul`) and keep one `h1` per page.
- External links: `target="_blank" rel="noreferrer"` and an `aria-label` that says the link opens
  in a new tab.
- Decorative glyphs and duplicated text get `aria-hidden="true"`.
- Every interactive element must work by keyboard and show focus. Use the `intent:` variant.

## Styling (Tailwind CSS v4)

There is no `tailwind.config`. The design system lives in `src/app/globals.css` (`@theme`,
`@custom-variant`, `@utility`).

### Tokens

- Colours: only the theme palette. The default Tailwind palette is switched off
  (`--color-*: initial`), so `gray-500` and similar do not exist. Use `manila-light`, `faded-black`,
  `soot`, `accent`, `muted`, `surface`, `line`, `line-strong` and the rest. No raw hex values or
  arbitrary colours in class names.
- Type scale: `text-h1`–`text-h4` for headings, `text-p1`–`text-p4` for body. `font-display` is
  Clash Display; the default sans is Satoshi.
- Add a token or utility to `globals.css` (`@theme` or `@utility`) instead of repeating an
  arbitrary value in several places.

### Variants

- Use `intent:` (hover plus keyboard focus) for interactive states instead of `hover:` on its own.
- `dark:` is class-based (`.dark` on `<html>`). Check every new colour in both themes.
- Base UI state: `data-[...]`, `starting-style:` and `ending-style:`.

### Class names

- Combine conditional or overriding classes with `cn()` from `@/lib/cn`, never with string
  concatenation.
- Component variants are an `as const` map typed with `keyof typeof` (see `ui/Button.tsx`).
- Do not hand-sort classes. Prettier (`prettier-plugin-tailwindcss`) orders them.
- Hooks for scripts are `data-*` attributes (`data-reveal`, `data-h-panel`). If a class is
  unavoidable, prefix it `js-`, which ESLint allows.
- Layouts must work from 320px wide up, with no horizontal page scroll.

## Motion (GSAP and smooth scroll)

- Import `gsap`, its plugins and `useGSAP` only from `@/lib/gsap`, which registers the plugins
  once. Never import from `"gsap"` or `"gsap/*"` in a component. Register any new plugin there.
- Run GSAP code inside `useGSAP(() => { ... }, { scope: ref })`, not `useEffect`.
- Wrap animations in `gsap.matchMedia()` with `MOTION_QUERY`, or `DESKTOP_MOTION_QUERY` for
  md+-only effects. Return cleanup from every context (`mm.revert()`, `split.revert()`).
- Content must be readable and usable with motion off. Do not hide something in CSS that only an
  animation can reveal unless the reduced-motion path shows it too.
- For motion GSAP does not drive (CSS, SVG), respect `usePrefersReducedMotion`.
- Scroll programmatically through `useScroll().scrollTo` or the `ScrollLink` component, never
  `window.scrollTo` directly. The store swaps in the smooth scroller when it boots.
- Animate `transform` and `opacity`. Avoid animating layout properties.

## Commit messages

Commit messages must pass commitlint (`.commitlintrc`, Conventional Commits). The `commit-msg`
hook rejects anything else.

```
<type>(<scope>): <subject>

- <what changed and why>
```

- **type**: `feat`, `fix`, `refactor`, `perf`, `style`, `docs`, `test`, `build`, `ci`, `chore` or
  `revert`, in lower case.
- **scope** (optional, lower case): the area touched, such as `header`, `hero`, `work`, `scroll`,
  `ui` or `deps`.
- **subject**: imperative ("add", not "added"), starts in lower case, no full stop.
- Every line is 100 characters or fewer, with a blank line after the header.
- If the staged changes are unrelated, suggest splitting them into separate commits.
- Check a message before committing: `echo "<message>" | npx --no -- commitlint`.
