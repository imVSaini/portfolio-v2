# Development

## Setup

```sh
npm ci                          # install exact dependencies; also installs the git hooks (husky)
npx playwright install          # browsers for the end-to-end tests
npm run dev                     # http://localhost:3000
```

Use the Node.js version in `.nvmrc` (26); CI reads the same file. There are no environment
variables to set: site URLs live in
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

`.github/workflows/ci.yml` runs on every push to `main` and every pull request:

| Job         | Does                                                                                |
| ----------- | ----------------------------------------------------------------------------------- |
| `quality`   | `npm run check` (types, ESLint, Prettier) and commitlint on the pushed commits      |
| `build`     | One `next build`, with `.next/cache` restored between runs, uploaded as an artifact |
| `e2e`       | The Playwright suite in four shards against that build                              |
| `report`    | Merges the shard reports into one HTML report                                       |
| `workflows` | zizmor 1.32.0 audits the workflow files and Dependabot config for security issues   |

`next build` no longer runs ESLint in Next.js 16, so the `quality` job is the only place lint and
formatting are enforced for every commit; the local `pre-commit` hook only checks staged files and
can be skipped.

Supply chain:

- Every action is pinned to a full commit SHA, with the release in a trailing comment. A moved or
  hijacked tag cannot change what runs.
- Checkouts use `persist-credentials: false`, and workflows only get `contents: read`.
- Dependabot (`.github/dependabot.yml`) opens weekly pull requests for npm packages (minor and patch
  grouped) and for the pinned actions, with a seven-day cooldown so a version is only proposed
  once it has been public for a week. Malicious releases are usually caught and pulled within
  days. Dependabot's commit bodies do not follow commitlint's line limit, so the commit-message
  step skips them.
- Dependency install scripts are allowlisted in `package.json` (`allowScripts`). npm 11 warns about
  unreviewed scripts and npm 12 blocks them. `unrs-resolver` is denied: its `postinstall` only
  fetches a native binding that `npm ci` already installs from its optional dependencies. When a
  new package with an install script appears, review it and record the decision with
  `npm install-scripts approve <pkg>` or `npm install-scripts deny <pkg>`.
- The `workflows` job runs zizmor on every push. Check workflow changes locally first with
  `uvx zizmor@1.32.0 --offline .github`.

`.github/workflows/production.yml` checks the live site every night. See
[Testing](./testing.md#ci).

## Deployment

Production is hosted on Vercel and fronted by Cloudflare, at `https://www.imvaibhav.com`.

- Pushes to `main` and pull requests run the CI workflow.
- Production deployments should wait for CI. In the Vercel project, open **Settings → Deployment
  Checks**, add **GitHub** as the provider and select the `CI` workflow as required. A production
  deployment is then held until it passes, and promoted automatically when it does.
  **Force Promote** on the deployment page bypasses the checks in an emergency.
- A deployment runs `next build`, which prerenders every page and the feeds. Nothing is rendered
  on demand afterwards, so any change, including content, needs a new deployment.
- Content changes (a new post or case study) are code changes and ship the same way. Dates do not
  schedule publication; a post is live as soon as the deployment that contains it is.

Assets (cover images) are uploaded to the Cloudflare R2 bucket separately and referenced by bucket
path in `src/data`.

## Rolling back

Vercel keeps earlier production deployments, and rolling back reroutes traffic to one in seconds
with no rebuild. When the live site is broken, roll back first and investigate second.

1. In the Vercel project, open **Deployments** and choose the last good production deployment. On
   the Hobby plan only the deployment immediately before the current one is eligible; Pro and
   Enterprise can use any earlier production deployment.
2. Choose **Instant Rollback** from its menu, or run `vercel rollback <deployment-url>`.
3. Confirm the fix with a manual run of **Production check** from the Actions tab.
4. Fix forward on `main`. After a rollback Vercel stops assigning production domains to new
   deployments, so pushes will not go live until you promote a deployment again from its menu,
   which turns automatic assignment back on.

## Production checklist

- `npm run check` passes.
- The affected Playwright specs pass on all five UI projects, plus `http` and `document` when
  routes, metadata or server HTML changed.
- `npm run build` finishes without warnings.
- New pages are in `sitemap.ts` and `e2e/routes.ts`, with metadata inside the limits.
- No page exceeds the script budget, or the budget change is explained in the commit.
- Light, dark-soft and dark-deep themes, all four accents, 320px width, keyboard use and reduced
  motion all checked for UI changes.
