# Content

Copy lives in `src/data` as typed TypeScript, except article bodies, which are Markdown files in
`src/content`. Components read both; nothing user-facing is hard-coded in a component that might
change. This guide covers the content model and the steps for adding a post or a case study.

## Where everything lives

| File                        | Holds                                                            |
| --------------------------- | ---------------------------------------------------------------- |
| `src/data/site.ts`          | Name, role, location, URLs, default description, OG card, nav    |
| `src/data/contact.ts`       | Email and social links                                           |
| `src/data/projects.ts`      | Home "Work" projects and the `ProjectTint` colours               |
| `src/data/experience.ts`    | Roles on the home timeline                                       |
| `src/data/skills.ts`        | Skill groups and the marquee                                     |
| `src/data/blog.ts`          | Blog title, description, feed URLs and `feedAlternates`          |
| `src/data/posts/`           | One metadata file per post, the `schema.ts` types and `index.ts` |
| `src/data/caseStudies/`     | One metadata file per study, `schema.ts` and the `index.ts` list |
| `src/content/posts/`        | One body per post, `<slug>.md`                                   |
| `src/content/case-studies/` | One body per study, `<slug>.md`                                  |
| `src/data/notFound.ts`      | 404 copy, the way-home link and the seal phrases                 |

`src/data` may only import other `src/data` modules (enforced by ESLint), so content stays plain
data that any renderer, test or feed can read. Bodies are kept out of those objects on purpose:
Playwright imports `src/data`, and it cannot import `.md` files.

## Article bodies

Posts and case studies keep their bodies in `src/content/<posts|case-studies>/<slug>.md`, written
in [Markdoc](https://markdoc.dev/docs/syntax) syntax: CommonMark plus `{% %}` tags.

````md
Opening paragraph with `inline code`, **bold**, _emphasis_ and [a link](https://example.com).

## A section heading

- First point.
- Second point.

```sql
SELECT … FOR UPDATE SKIP LOCKED
```

{% diagram name="skipLocked" caption="Caption shown under the figure." alt="What the drawing shows." /%}

> A pull quote.
````

- The site renders only what the design has: paragraphs, `##` headings, `-` lists, `>` quotes,
  fenced code, inline code, bold, emphasis, links and the tags below. Anything else (`#` or `###`
  headings, numbered lists, tables, images) fails the build with the file and line.
- `##` headings become the table of contents. Their ids come from `getHeadingId()`, so two headings
  in one article must not have the same text.
- `{% diagram %}` needs `name`, `caption` (visible) and `alt` (what the drawing shows, for readers
  who cannot see it). An unknown name fails the build.
- Case studies place their decisions list with one `{% decisions /%}` line between the overview
  and the outcome.
- Links to other sites open in a new tab with an accessible label that says so.
- Code fences need a language Shiki loads in `src/lib/highlight.ts` (`markdown`, `python`, `sql`,
  `ts`, `tsx`, `yaml`). Add the language there before using a new one.
- Markdoc reads `{% %}` even inside code fences. A sample that contains that syntax needs
  `{% process=false %}` after the language.
- Prettier formats these files but leaves code samples alone (`embeddedLanguageFormatting: off`).

`src/lib/articleSources.ts` loads every body when the module first runs (during `next build`),
checks each one against its slug, and parses it with `parseArticle` from `src/lib/markdoc.ts`. The same
syntax tree feeds `ArticleBody` (HTML), `renderBlock` in `src/lib/rss.ts` (feed HTML),
`toPortableMarkdown` (the Markdown twin and `llms-full.txt`, with tags written out as text) and
`getReadMinutes`.

## Posts

### Fields

| Field             | Rules                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| `slug`            | URL segment and RSS GUID. Never change it after publishing.                                       |
| `title`           | Headline on the page, cards, RSS and JSON-LD.                                                     |
| `excerpt`         | Card and RSS summary, JSON-LD description.                                                        |
| `metaTitle`       | `<title>` and link-preview title. **39 characters at most** (the layout adds ` — Vaibhav Saini`). |
| `metaDescription` | Meta description and link-preview text. **155 characters at most.**                               |
| `topic`           | Category label; related posts prefer the same topic.                                              |
| `date`            | `YYYY-MM-DD`. Sorts posts newest first. It does not schedule publication.                         |
| `updatedAt`       | Optional. Only a real, substantive revision date. Feeds the sitemap and `dateModified`.           |
| `tint`            | Background of the generated cover (`ProjectTint`).                                                |
| `art`             | Line drawing on the cover (`PostArtName`).                                                        |
| `cover`           | Optional bucket path such as `/blog/outbox.webp`. Replaces the drawn cover and OG card.           |

Reading time is derived from the body at 220 words a minute (`getReadMinutes`). The newest post is
featured on `/blog`.

### Adding a post

1. Create `src/data/posts/<camelName>.ts` exporting a `Post`. Copy the shape of an existing post
   such as `postgresDefault.ts`.
2. Add it to the `sources` array in `src/data/posts/index.ts`. Order there does not matter; posts
   are sorted by `date`.
3. Write the body in `src/content/posts/<slug>.md`. The file name must match `slug` exactly.
4. Pick an existing `art` name, or add a new one:
   - add the name to `PostArtName` in `src/data/posts/schema.ts`;
   - add the drawing to the `art` map in `src/components/blog/PostArt.tsx`. The map is a
     `Record<PostArtName, …>`, so the build fails until it exists.
5. For each new diagram:
   - add the name to `POST_DIAGRAM_NAMES`;
   - add the drawing to the topic file in `src/components/blog/diagrams/` and a title to `TITLES`
     in `src/components/blog/PostDiagram.tsx`.
6. Measure `metaTitle` and `metaDescription` before writing them. `e2e/document/metadata.spec.ts`
   fails any page over the limits.
7. Run the post specs (see [Testing](./testing.md)). Tests read posts from `src/data` and bodies
   through `e2e/articles.ts`, so a new post is covered automatically.

Publishing a post updates the page, `/blog`, the sitemap, `/rss.xml` (latest 20), `/llms.txt`,
`/llms-full.txt`, its `index.md` twin, its JSON-LD and its Open Graph card in one deploy.

## Case studies

### Fields

| Field                  | Rules                                                                  |
| ---------------------- | ---------------------------------------------------------------------- |
| `slug`, `title`        | As for posts. The page title is `${title} case study`.                 |
| `category`, `headline` | Label and one-sentence subtitle on the index and the study.            |
| `summary`              | Meta description and link-preview text (155 characters at most).       |
| `date`                 | Publication date, `YYYY-MM-DD`.                                        |
| `tint`, `art`          | Cover colour and product mock-up (`CaseStudyArtName`).                 |
| `facts`, `metrics`     | Key–value facts and display-type metrics such as `80` or `60s`.        |
| `stack`                | Technologies used.                                                     |
| `decisions`            | `{ title, context, chose, cost }` entries, rendered as their own list. |

### Adding a case study

1. Create `src/data/caseStudies/<camelName>.ts` exporting a `CaseStudy`. Decision fields may use
   inline Markdown.
2. Add it to `caseStudies` in `src/data/caseStudies/index.ts`. **Order matters**: it is the display
   order, and each study links to the next one, wrapping round to the first.
3. Write the body in `src/content/case-studies/<slug>.md`: the problem, constraints and
   architecture, then `{% decisions /%}`, then where it stands and what would change.
4. New `art` names need a drawing in `CaseStudyCover` and a label in its `WINDOW_LABELS`. New
   diagram names go in `CASE_STUDY_DIAGRAM_NAMES` and need a drawing in `CaseStudyDiagramArt` and a
   title in `CaseStudyDiagram`.
5. Keep in-house products generic. Case studies use a descriptive product name, never the real
   brand.

## Images

Remote images live in the Cloudflare R2 bucket at `site.assetsUrl`. Store the bucket path in data
(`"/work/studio.webp"`) and build the URL with `getAssetUrl()`. Never write the domain into data or
components; `next.config.ts` allows it in `images.remotePatterns` from the same value.

## Site copy and SEO copy

Search copy and display copy are kept apart:

- Posts: `metaTitle` and `metaDescription` for search and previews; `title` and `excerpt` for the
  page, cards, RSS and JSON-LD.
- Case studies: `summary` is the meta description.
- Section pages read `description` from `blog`, `caseStudiesPage` and `site`.

See [Routing and SEO](./routing-and-seo.md) for how these become metadata.
