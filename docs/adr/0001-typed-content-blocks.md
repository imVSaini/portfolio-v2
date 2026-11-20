# 0001. Content is typed TypeScript blocks, not MDX or a CMS

- Status: Accepted
- Date: 2026-11-20 (recorded after the fact; the decision predates this record)

## Context

Posts and case studies are read by more than browsers. The same article is rendered as HTML, as
Markdown at `index.md`, as RSS, inside `llms-full.txt`, as JSON-LD and as an Open Graph card.
Every one of those outputs needs the article's structure (headings, lists, code, diagrams), not
just rendered HTML.

## Decision

Content lives in `src/data` as typed TypeScript: `PostSource` and `CaseStudy` objects whose
bodies are arrays of `TextBlock | DiagramBlock` built with small helpers (`h2`, `p`, `ul`).
Each output is a plain function over those blocks (`ArticleBody`, `renderBlock` in
`src/lib/llms.ts` and `src/lib/rss.ts`).

The main alternatives are MDX (directly, or through Velite or Content Collections) and a hosted
CMS.

## Consequences

- One source feeds every output. Adding a block type means updating each renderer (`ArticleBody`,
  `src/lib/llms.ts`, `src/lib/rss.ts`, `readMinutes`).
- Diagram and cover names are string-literal unions, so a missing drawing fails the build.
- No content build step and no content dependency.
- Writing is less pleasant than Markdown: prose sits in string literals, and inline formatting is
  limited to what `TextBlock` supports.
- All content ships in the server bundle. That is fine at this size; revisit if posts reach the
  hundreds or someone other than the author needs to edit them.
