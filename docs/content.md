# Content

All copy lives in `src/data` as typed TypeScript. Components read it; nothing user-facing is
hard-coded in a component that might change. This guide covers the content model and the steps
for adding a post or a case study.

## Where everything lives

| File                     | Holds                                                            |
| ------------------------ | ---------------------------------------------------------------- |
| `src/data/site.ts`       | Name, role, location, URLs, default description, OG card, nav    |
| `src/data/contact.ts`    | Email and social links                                           |
| `src/data/projects.ts`   | Home "Work" projects and the `ProjectTint` colours               |
| `src/data/experience.ts` | Roles on the home timeline                                       |
| `src/data/skills.ts`     | Skill groups and the marquee                                     |
| `src/data/blog.ts`       | Blog title, description, feed URLs and `feedAlternates`          |
| `src/data/article.ts`    | Block types and helpers shared by posts and case studies         |
| `src/data/posts/`        | One file per post, the `schema.ts` types and the `index.ts` list |
| `src/data/caseStudies/`  | One file per study, `schema.ts` and the `index.ts` list          |
| `src/data/notFound.ts`   | 404 copy, the way-home link and the seal phrases                 |

`src/data` may only import other `src/data` modules (enforced by ESLint), so content stays plain
data that any renderer, test or feed can read.

## Article bodies

Posts and case studies share one block model from `src/data/article.ts`:

```ts
type TextBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "code"; language: string; code: string };

type DiagramBlock<Name extends string> = {
  type: "diagram";
  name: Name;
  caption: string;
  alt: string;
};
```

Write bodies with the helpers rather than object literals:

```ts
import { code, h2, p, quote, ul } from "@/data/article";
import { diagram } from "@/data/posts/schema";

body: [
  p("Opening paragraph. Inline `code` goes in backticks."),
  h2("A section heading"),
  ul("First point.", "Second point."),
  code("sql", `SELECT … FOR UPDATE SKIP LOCKED`),
  diagram("skipLocked", "Caption shown under the figure.", "Alt text describing the drawing."),
  quote("A pull quote."),
];
```

- `h2` headings become the table of contents. Their ids come from `getHeadingId()`, so two headings
  in one article must not have the same text.
- Paragraph and list text may wrap inline code in backticks. Quotes are plain text.
- `code()` trims the source, so a template literal can start on its own line.
- Every diagram needs both a caption (visible) and alt text (what the drawing shows, for readers who
  cannot see it).

The same blocks are rendered by `ArticleBody` (HTML), `renderBlock` in `src/lib/llms.ts`
(Markdown) and `renderBlock` in `src/lib/rss.ts` (feed HTML), and counted by `readMinutes`. A new
block type has to be handled in all four.

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
| `body`            | Array of blocks.                                                                                  |

`readMinutes` is derived at 220 words a minute. The newest post is featured on `/blog`.

### Adding a post

1. Create `src/data/posts/<camelName>.ts` exporting a `PostSource`. Copy the shape of an existing
   post such as `postgresDefault.ts`.
2. Add it to the `sources` array in `src/data/posts/index.ts`. Order there does not matter; posts
   are sorted by `date`.
3. Pick an existing `art` name, or add a new one:
   - add the name to `PostArtName` in `src/data/posts/schema.ts`;
   - add the drawing to the `art` map in `src/components/blog/PostArt.tsx`. The map is a
     `Record<PostArtName, …>`, so the build fails until it exists.
4. For each new diagram:
   - add the name to `PostDiagramName`;
   - add the drawing to the topic file in `src/components/blog/diagrams/` and a title to `TITLES`
     in `src/components/blog/PostDiagram.tsx`.
5. Measure `metaTitle` and `metaDescription` before writing them. `e2e/document/metadata.spec.ts`
   fails any page over the limits.
6. Run the post specs (see [Testing](./testing.md)). Tests read posts from `src/data`, so a new
   post is covered automatically.

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
| `overview`             | Blocks before the decisions: problem, constraints, architecture.       |
| `decisions`            | `{ title, context, chose, cost }` entries, rendered as their own list. |
| `outcome`              | Blocks after the decisions: where it stands and what would change.     |

### Adding a case study

1. Create `src/data/caseStudies/<camelName>.ts` exporting a `CaseStudy`.
2. Add it to `caseStudies` in `src/data/caseStudies/index.ts`. **Order matters**: it is the display
   order, and each study links to the next one, wrapping round to the first.
3. New `art` names need a drawing in `CaseStudyCover` and a label in its `WINDOW_LABELS`. New
   diagram names need a drawing in `CaseStudyDiagramArt` and a title in `CaseStudyDiagram`.
4. Keep in-house products generic. Case studies use a descriptive product name, never the real
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
