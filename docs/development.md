# Development

## Setup

```sh
nvm use                         # Node.js 26, the version in .nvmrc
npm ci                          # install exact dependencies; also installs the git hooks (husky)
npx playwright install          # browsers for the end-to-end tests
npm run dev                     # http://localhost:3000
```

The project runs on the Node.js 26 LTS line, pinned to the major so security patches arrive
without a change here. `.nvmrc` sets it for `nvm` and for CI (`node-version-file`). In
`package.json`, `engines.node` (`26.x`) tells Vercel which runtime to deploy, and `devEngines.runtime`
(`onFail: "error"`) makes `npm install`, `npm ci` and `npm run` stop with `EBADDEVENGINES` on any
other major, since npm only warns about `engines`. `@types/node` tracks the same major. Raise all
four together when moving to a new LTS; an open range such as `>=26` would let Vercel move to a new
major on its own. There are no environment variables to set: site URLs live in
`src/data/site.ts`, and `BUILD_YEAR` is injected by `next.config.ts`.

## Commands

| Command             | Does                                                        |
| ------------------- | ----------------------------------------------------------- |
| `npm run dev`       | Dev server (Turbopack)                                      |
| `npm run build`     | Production build; every page prerendered                    |
| `npm run start`     | Serve the production build                                  |
| `npm run check`     | `typecheck`, then `lint`, then `format:check`               |
| `npm run typecheck` | `tsc --noEmit`                                              |
| `npm run lint`      | ESLint, including Tailwind class and import-direction rules |
| `npm run lint:fix`  | ESLint with autofix (sorts imports)                         |
| `npm run format`    | Prettier write (sorts Tailwind classes)                     |
| `npm run test:e2e*` | Playwright; see [Testing](./testing.md)                     |

Run `npm run check` before calling any change done.

### Dev server notes

- After editing `src/app/globals.css`, restart `next dev`; it can keep serving stale CSS.
- `next dev` rewrites the Next.js block at the top of `AGENTS.md`. Commit that change with your
  work rather than reverting it.
- Route types (`PageProps`, `LayoutProps` and typed links) are generated into `.next/types` by
  `next dev`, `next build` or `npx next typegen`. Run one of them if `typecheck` reports missing
  route types.

## Before you change code

1. Read `AGENTS.md`. It is the single source of coding rules for people and agents (Cursor reads it
   directly; `CLAUDE.md` imports it).
2. This is Next.js 16. Its APIs differ from older versions; read the matching guide in
   `node_modules/next/dist/docs/` before using an API you have not checked.
3. Do not add dependencies without agreeing it first.

## TypeScript

The compiler runs `strict` plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` and
`noImplicitOverride`. Never loosen `tsconfig.json`. In short:

- `type`, not `interface`; no `enum`, `any`, `@ts-ignore` or non-null `!`.
- Index access can be `undefined`; guard it.
- Optional props cannot take an explicit `undefined`; spread them in conditionally.
- Named exports only, except files Next.js requires to default-export.
- `@/` imports for anything under `src/`, in the order ESLint enforces.
- Exported helpers in `src/lib`, `src/hooks` and `src/stores` get a TSDoc block with an `@example`
  from real usage.

## Commits

Commits follow Conventional Commits and are checked by commitlint in the `commit-msg` hook:

```text
<type>(<scope>): <subject>

- <what changed and why>
```

- **type:** `feat`, `fix`, `refactor`, `perf`, `style`, `docs`, `test`, `build`, `ci`, `chore`,
  `revert`.
- **scope** (optional, lower case): `header`, `hero`, `work`, `scroll`, `ui`, `deps`, `seo`, …
- **subject:** imperative, lower case first letter, no full stop.
- Every line 100 characters or fewer, with a blank line after the header.
- Split unrelated changes into separate commits.

Check a message before committing:

```sh
echo "fix(header): keep the logo focus ring visible" | npx --no -- commitlint
```

The `pre-commit` hook runs lint-staged: `eslint --fix` and `prettier --write` on staged
TypeScript and JavaScript, and `prettier --write` on JSON, CSS and Markdown.

## Continuous integration

`.github/workflows/ci.yml` runs `npm run check` and the full Playwright suite on every push to
`main` and every pull request. It builds once, runs the suite in four shards against that build,
then merges the reports. The suite includes the metadata limits, the
no-JavaScript document checks and the per-page script budget, so a regression in any of them fails
the build. See [Testing](./testing.md#ci).

## Deployment

Production is hosted on Vercel and fronted by Cloudflare, at `https://www.imvaibhav.com`.

- Pull requests and pushes to `main` run `npm run check` and the Playwright suite in CI.
- Vercel builds every push to `main` straight away, but Deployment Checks (Project Settings → Build
  and Deployment → Deployment Checks) hold the build off the production domains until the `CI`
  workflow's `Required checks` job passes on that commit. The domains then move to it
  automatically. A failed or cancelled run leaves the previous deployment live; **Force Promote**
  on the deployment page overrides the hold.
- A deployment runs `next build`, which prerenders every page and the feeds. Nothing is rendered
  on demand afterwards, so any change, including content, needs a new deployment.
- Content changes (a new post or case study) are code changes and ship the same way. Dates do not
  schedule publication; a post is live as soon as the deployment that contains it passes CI.

Assets (cover images) are uploaded to the Cloudflare R2 bucket separately and referenced by bucket
path in `src/data`.

## Production checklist

- `npm run check` passes.
- The affected Playwright specs pass on all five UI projects, plus `http` and `document` when
  routes, metadata or server HTML changed.
- `npm run build` finishes without warnings.
- New pages are in `sitemap.ts` and `e2e/routes.ts`, with metadata inside the limits.
- No page exceeds the script budget, or the budget change is explained in the commit.
- Light, dark-soft and dark-deep themes, all four accents, 320px width, keyboard use and reduced
  motion all checked for UI changes.
