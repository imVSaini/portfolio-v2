# Documentation

How the portfolio at [imvaibhav.com](https://www.imvaibhav.com) is built, and how to change it
safely. `AGENTS.md` at the repository root holds the coding rules; these guides explain the system
those rules protect.

| Guide                                       | Read it when you want to…                                              |
| ------------------------------------------- | ---------------------------------------------------------------------- |
| [Architecture](./architecture.md)           | understand the layers, the rendering model and how a request is served |
| [Content](./content.md)                     | add or edit a post, a case study or any site copy                      |
| [Routing and SEO](./routing-and-seo.md)     | add a page, or change metadata, feeds, the sitemap or structured data  |
| [Design system](./design-system.md)         | use colours, type, themes, accents and the custom Tailwind variants    |
| [Motion and scroll](./motion-and-scroll.md) | animate something, or work on smooth scrolling and the intro           |
| [Client state](./client-state.md)           | work with the zustand stores and browser-only values                   |
| [Performance](./performance.md)             | keep pages fast and stay inside the script budget                      |
| [Testing](./testing.md)                     | write, run or debug the Playwright suite                               |
| [Development](./development.md)             | set up, run commands, commit and deploy                                |
| [Decisions](./decisions.md)                 | see why the expensive-to-reverse choices were made                     |

## At a glance

- **Stack:** Next.js 16 (App Router, Turbopack, Cache Components), React 19, TypeScript in strict
  mode, Tailwind CSS v4, GSAP with Locomotive Scroll v5, zustand and Base UI.
- **Rendering:** every page is prerendered at build time. There is no database and no per-request
  server work.
- **Content:** typed TypeScript in `src/data`, rendered as HTML, Markdown, RSS, `llms.txt`,
  JSON-LD and Open Graph images from the same source.
- **Hosting:** Vercel, behind Cloudflare. Images live in a Cloudflare R2 bucket.
- **Quality gates:** `npm run check` (types, lint, format) and about 2,400 Playwright tests across
  seven projects, including a per-page JavaScript budget.
