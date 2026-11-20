# Testing

The site is tested end to end with Playwright against the production build. There are no unit
tests; pure helpers are covered through the pages and feeds they produce. About 2,400 tests run
across seven projects.

## Running tests

| Command                   | Runs                                   |
| ------------------------- | -------------------------------------- |
| `npm run test:e2e`        | Everything                             |
| `npm run test:e2e:fast`   | `http`, `document` and `chromium` only |
| `npm run test:e2e:ui`     | Playwright UI mode                     |
| `npm run test:e2e:headed` | Headed, one worker                     |
| `npm run test:e2e:debug`  | The Playwright inspector               |
| `npm run test:e2e:report` | Opens the last HTML report             |

One file, project or test:

```sh
npx playwright test e2e/ui/post.spec.ts --project=chromium -g "contents"
npx playwright test e2e/ui/home.spec.ts --project=mobile-safari --repeat-each=10
```

`playwright.config.ts` runs `next build` then `next start` on port **3200**. Locally an existing
server on that port is reused, so **stop it after changing app code**, or the run tests the old
build:

```sh
lsof -ti tcp:3200 | xargs kill
```

Set `PLAYWRIGHT_BASE_URL` to run the suite against another deployment instead of a local build.

## Projects

| Project         | Folder         | Environment                        | Covers                                                              |
| --------------- | -------------- | ---------------------------------- | ------------------------------------------------------------------- |
| `http`          | `e2e/http`     | `request` only, no browser         | Status codes, headers, feeds, Markdown twins, assets, script budget |
| `document`      | `e2e/document` | Desktop Chrome, JavaScript **off** | Server HTML: metadata, JSON-LD, links, content, XML                 |
| `chromium`      | `e2e/ui`       | Desktop Chrome                     | Behaviour in a real browser                                         |
| `firefox`       | `e2e/ui`       | Desktop Firefox                    |                                                                     |
| `webkit`        | `e2e/ui`       | Desktop Safari                     |                                                                     |
| `mobile-chrome` | `e2e/ui`       | Pixel 7                            |                                                                     |
| `mobile-safari` | `e2e/ui`       | iPhone 15                          |                                                                     |

The `document` project is what crawlers and no-script readers get. Every UI spec runs on all five
browser projects.

### Spec files

- `http`: `pages`, `feeds`, `markdown`, `assets`, `budget`.
- `document`: `metadata`, `structured-data`, `content`, `posts`, `links`, `xml`.
- `ui`: `smoke`, `home`, `navigation`, `scroll`, `mobile-menu`, `appearance`, `preloader`, `blog`,
  `post`, `case-studies`, `privacy`, `responsive`, `accessibility`.

### Layouts and tags

Branch on the `layout` fixture rather than on a project name. It is derived from the viewport:
`phone` below 768px, `tablet` below 1024px, `desktop` from 1024px.

A test that only makes sense on one kind of device carries a tag instead of a runtime skip:

| Tag        | Runs on                          | For                                                |
| ---------- | -------------------------------- | -------------------------------------------------- |
| `@desktop` | `chromium`, `firefox`, `webkit`  | Wheel, End and Home, resized viewports, desktop UI |
| `@mobile`  | `mobile-chrome`, `mobile-safari` | Touch targets, phone-only UI                       |

Projects filter out the other tag with `grepInvert`, so reports show no skipped tests. Put the tag
on `test.describe` when the whole group shares it. Never `test.skip` for a browser or layout.

## Writing tests

### Fixtures (`e2e/fixtures.ts`)

Import `test` and `expect` from `e2e/fixtures.ts` in UI specs.

| Fixture or helper                                                       | Use                                                                               |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `visit(path)`                                                           | Opens a page and waits for `html[data-motion-ready]`, the hydration signal        |
| `intro`                                                                 | `"skip"` by default; `test.use({ intro: "play" })` plays the preloader            |
| `layout`                                                                | `"phone" \| "tablet" \| "desktop"`                                                |
| `tabKey`                                                                | `"Tab"`, or `"Alt+Tab"` on WebKit for macOS, which only tabs to links with Option |
| `clipboard`                                                             | Reads the clipboard across browsers                                               |
| `clickWhenSettled()`                                                    | Scrolls a link into view, waits for the smooth scroller to stop, then clicks      |
| `hoverWhenSettled()`                                                    | The same, then hovers                                                             |
| `expectScrolledTo()`                                                    | Polls until a target sits in the top of the viewport                              |
| `openMenu()`, `openSiteNav()`, `openArticleAside()`, `openAppearance()` | Open UI per layout                                                                |
| `scrollToEnd()`, `scrollThrough()`, `getOverflow()`, `findConcealed()`  | Scroll and layout checks                                                          |

### Rules

- Read expectations from `src/data` and `e2e/routes.ts` (`PAGE_ROUTES`, `getPostPath`, …) instead of
  repeating copy, slugs or counts. New posts and pages are then covered automatically.
- Locate by role and accessible name. `RollText` and `RevealText` split text into hidden glyphs,
  so match headings by accessible name or with `\s*` between words.
- Use web-first assertions and `expect.poll`. No `waitForTimeout`, no pixel snapshots.
- After client-side navigation, Next.js keeps the previous page mounted but hidden, so
  `page.locator("main")` can match two elements. Use `getByRole` or `.filter({ visible: true })`.
- Click in-page links below the fold with `clickWhenSettled()`; Playwright's own scroll-into-view
  races the smooth scroller.
- Test reduced motion with `test.use({ contextOptions: { reducedMotion: "reduce" } })`.
- Inside an open Base UI dialog, `locator.evaluateAll()` crashes Firefox under Playwright. Call
  `evaluate()` on one container and query its children (see `getHiddenLinks` in
  `mobile-menu.spec.ts`).
- To assert that something animates, sample `getAnimations({ subtree: true })` on every frame over
  a short window; one early sample can run before the transition starts.
- To assert how something animates (an intermediate state such as a half-open reveal), pause the
  animation and seek it with the Web Animations API (`animation.pause()`, `currentTime`), then
  measure computed styles. CI runs Linux browsers in software at a few frames per second, so
  per-frame sampling and hit testing during an animation miss intermediate states. When waiting
  for scroll-linked motion, wait until the value stops changing, not for a fixed number of frames.
- Hover or click a card at its resting state: wait for reveal animations to finish before
  pointing at it, and use `page.mouse` when an overlay (such as a stretched link) is meant to
  receive the pointer.
- A known app defect is documented with `test.fail(condition, reason)`. Use `test.fixme` only for
  timing-dependent defects. Never weaken an assertion to make a defect pass.

## Every change ships with tests

1. **Add** specs for new behaviour, including layouts, keyboard use and reduced motion.
2. **Update** assertions to match changed behaviour, and add cases the old tests missed.
3. **Delete** specs, helpers and fixtures that only served removed features.
4. **Run** the affected specs on all five UI projects, plus `http` or `document` when routes,
   metadata or server HTML changed.
5. **On failure**, decide whether the app or the test is wrong. Fix the test only when the test
   itself is faulty.
6. **Confirm** suspected flakiness by rerunning the spec on its own (`--repeat-each`) before writing
   it off, and say so. Finish with `npm run check`.

## Known flaky test

`post.spec.ts` › "post table of contents › travels to a section, records it and moves focus there"
fails about two runs in ten on `mobile-chrome`. The clicked link sometimes does not get
`aria-current="location"`. It fails at the same rate on unchanged `main`, so it is a timing issue in
the table of contents (`ArticleToc` marks the active heading with an `IntersectionObserver`) or in
the test, not a regression. It is unresolved.

## CI

`.github/workflows/e2e.yml` runs on pushes to `main` and on pull requests:

- Four shards on `ubuntu-latest`, each running `npx playwright test --shard=N/4` inside the
  official `mcr.microsoft.com/playwright:v<version>-noble` image. A first job reads the version
  from `package-lock.json` so the image always matches the installed `@playwright/test`. The image
  carries the browsers and their system libraries, so there is no `playwright install --with-deps`
  step: that step once stalled on an apt mirror until the 30-minute job timeout cancelled the run.
- In CI: two workers, two retries, `forbidOnly`, traces and video on the first retry.
- A final job merges the blob reports into one HTML report, kept for 14 days as the
  `playwright-report` artifact.
