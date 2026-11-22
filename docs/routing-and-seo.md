# Routing and SEO

Every route is prerendered. Each page gets a unique title and description, a canonical URL, Open
Graph and Twitter cards, an RSS discovery link and, for articles, JSON-LD and a Markdown twin.

## Routes

| Path                                   | Source                                          | Notes                                   |
| -------------------------------------- | ----------------------------------------------- | --------------------------------------- |
| `/`                                    | `src/app/page.tsx`                              | Home; has a preloader and Markdown twin |
| `/blog`                                | `src/app/blog/page.tsx`                         | Featured post plus card grid            |
| `/blog/[slug]`                         | `src/app/blog/[slug]/page.tsx`                  | Unknown slugs return `404`              |
| `/blog/[slug]/index.md`                | `src/app/blog/[slug]/index.md/route.ts`         | Markdown twin                           |
| `/blog/[slug]/opengraph-image`         | `src/app/blog/[slug]/opengraph-image.tsx`       | 1200×630 PNG                            |
| `/case-studies`                        | `src/app/case-studies/page.tsx`                 | Index in display order                  |
| `/case-studies/[slug]`                 | `src/app/case-studies/[slug]/page.tsx`          | Unknown slugs return `404`              |
| `/case-studies/[slug]/index.md`        | `src/app/case-studies/[slug]/index.md/route.ts` | Markdown twin                           |
| `/case-studies/[slug]/opengraph-image` | `.../opengraph-image.tsx`                       | 1200×630 PNG                            |
| `/privacy`                             | `src/app/privacy/page.tsx`                      |                                         |
| `/rss.xml`                             | `src/app/(feeds)/rss.xml/route.ts`              | RSS 2.0, latest 20 posts                |
| `/llms.txt`, `/llms-full.txt`          | `src/app/(feeds)/…`                             | Site summary for language models        |
| `/index.md`                            | `src/app/(feeds)/index.md/route.ts`             | Home profile as Markdown                |
| `/sitemap.xml`, `/robots.txt`          | `src/app/sitemap.ts`, `src/app/robots.ts`       |                                         |

`(feeds)` is a route group: it organises files without adding a URL segment.

### Typed links

`typedRoutes` is on in `next.config.ts`. Every `href` passed to `next/link` is checked against the
real routes, so a misspelt path fails `npm run typecheck`. Build article paths with the helpers
rather than template strings:

```ts
getPostPath(post); // "/blog/zero-downtime-schema-migrations"
getCaseStudyPath(study); // "/case-studies/lead-management-crm"
getHomeHref("#work"); // "/#work" — a home section, from any page
```

### Adding a page

1. Create `src/app/<path>/page.tsx` with a default-exported component wrapped in `PageShell`, and
   one `h1`.
2. Export metadata with `buildPageMetadata()` (below).
3. Add the URL to `src/app/sitemap.ts`, and to `STATIC_ROUTES` in `e2e/routes.ts` so the metadata,
   link and budget specs cover it.
4. Add it to `nav` in `src/data/site.ts` if it belongs in the header.

## Metadata

The root layout sets defaults and a title template, `%s — Vaibhav Saini`. Pages build their own
metadata with `buildPageMetadata()` from `src/lib/metadata.ts`:

```ts
// A section page
export const metadata = buildPageMetadata({
  title,
  description,
  path: "/blog",
  socialTitle: `${title} — ${site.name}`,
});

// An article
return buildPageMetadata({
  title: post.metaTitle,
  description: post.metaDescription,
  path: getPostPath(post),
  markdownPath: getPostMarkdownPath(post),
  article: { publishedTime: post.date, ...(post.updatedAt && { modifiedTime: post.updatedAt }) },
});
```

It sets the canonical URL, the RSS alternate (plus the Markdown alternate when given), and Open
Graph and Twitter fields that repeat the page's own title and description. Next.js replaces a
layout's `openGraph`, `twitter` and `alternates` objects wholesale, which is why every shared field
is set here rather than inherited. Website pages use the default card at `site.ogImage`; article
pages get theirs from their `opengraph-image` route.

### Limits

| Field                   | Limit                                                 |
| ----------------------- | ----------------------------------------------------- |
| Rendered `<title>`      | 55 characters, so a page's own `title` has 39 at most |
| Meta description        | 155 characters                                        |
| Titles and descriptions | Unique across every page                              |

`e2e/document/metadata.spec.ts` checks all of this on every route in `PAGE_ROUTES`.

## Open Graph images

`opengraph-image.tsx` renders a card with `ImageResponse` and the `OgCard` component. A post with a
`cover` uses that image instead. The card is set in Clash Display and Satoshi loaded by
`getOgFonts()` from the `.ttf` files in `src/app/fonts`. Those must stay `.ttf`: the renderer
(Satori) reads TTF, OTF and WOFF but not WOFF2.

## Structured data

`src/lib/jsonLd.ts` builds one JSON-LD graph per page, rendered by `JsonLd`. Every graph starts
with the shared `Person` and `WebSite` nodes, then adds:

| Page         | Page-specific nodes                                                    |
| ------------ | ---------------------------------------------------------------------- |
| Home         | `ProfilePage`                                                          |
| `/blog`      | `CollectionPage`, `BreadcrumbList`, `Blog` with its `BlogPosting` list |
| Post         | `Blog`, `WebPage`, `BreadcrumbList`, `BlogPosting`                     |
| Case studies | `CollectionPage`, `BreadcrumbList`, `ItemList`                         |
| Case study   | `WebPage`, `BreadcrumbList`, `Article`                                 |

Nodes reference each other by `@id`. `e2e/document/structured-data.spec.ts` checks that every
reference resolves.

## Feeds and machine-readable output

- **RSS.** `getRssFeed()` in `src/lib/rss.ts` returns RSS 2.0 with the latest 20 posts, summaries
  and full article HTML. Permalinks are the GUIDs, so slugs must stay stable. Dates are normalised
  to midnight UTC. Invalid dates and XML-forbidden characters fail the build rather than produce
  a broken feed. `lastBuildDate` only moves when content does.
- **Markdown twins.** Each post and case study has `index.md`. `next.config.ts` rewrites `/`,
  `/blog/:slug` and `/case-studies/:slug` to their Markdown when a request sends
  `Accept: text/markdown`. Responses carry `Vary: Accept` and a `Link: rel="canonical"` header.
- **`llms.txt` and `llms-full.txt`.** A short index and a full-text dump of the site for language
  models, built in `src/lib/llms.ts`.
- **Discovery.** Every page links the feed through `feedAlternates`. Include it whenever a route
  sets its own `alternates`; `buildPageMetadata()` already does.

All text routes respond through `textResponse()` in `src/lib/http.ts`, which sets the content type
and `Cache-Control: public, max-age=3600, s-maxage=3600`.

## Sitemap and robots

`sitemap.ts` lists the home page, the section pages, every case study (with `lastModified` from its
date), every post (`updatedAt` or `date`) and `/privacy`. `robots.ts` allows everything and points
to the sitemap. The 404 page is marked `noindex`.

## Not-found page

`src/app/not-found.tsx` renders every unknown URL and every `notFound()` call. Its header and
`main` fill exactly one small-viewport height (`min-h-svh`, with the header inside the top padding),
so the footer starts just below the fold. The "4 ◎ 4" numeral, the heading, the message and the "Go to homepage" button sit
centred in one column, the numeral sized by the smaller of the viewport's width and height so it
fits short screens; anything shorter still lets `main` grow rather than clip. Its copy comes from
`src/data/notFound.ts`, and `e2e/ui/not-found.spec.ts` checks the centring and the one-screen fit
at common sizes.
