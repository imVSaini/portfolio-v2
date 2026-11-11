import { blog } from "@/data/blog";
import type { Post, PostBlock } from "@/data/posts";
import { site } from "@/data/site";
import { formatPostDate, getPostImageUrl } from "@/lib/posts";

/** Bound the full-content feed as the archive grows. */
const FEED_ITEM_LIMIT = 20;
/** Minutes a reader may cache the feed; matches the route's `max-age`. */
const FEED_TTL = 60;

function escapeXml(value: string): string {
  // XML 1.0 cannot represent these characters, even as numeric references.
  for (const character of value) {
    const point = character.codePointAt(0) ?? 0;
    if (!(
      point === 0x9 ||
      point === 0xa ||
      point === 0xd ||
      (point >= 0x20 && point <= 0xd7ff) ||
      (point >= 0xe000 && point <= 0xfffd) ||
      (point >= 0x10000 && point <= 0x10ffff)
    )) {
      throw new Error("RSS content contains a character forbidden by XML 1.0.");
    }
  }

  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatRssDate(value: Post["date"]): string {
  // RSS requires a time: date-only publication days consistently use midnight UTC.
  const date = new Date(`${value}T00:00:00.000Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw new Error(`Invalid RSS publication date: ${value}`);
  }
  return date.toUTCString();
}

function renderInline(text: string): string {
  return text
    .split("`")
    .map((part, index) => (index % 2 === 1 ? `<code>${escapeXml(part)}</code>` : escapeXml(part)))
    .join("");
}

function renderBlock(block: PostBlock): string {
  switch (block.type) {
    case "heading":
      return `<h2>${escapeXml(block.text)}</h2>`;
    case "paragraph":
      return `<p>${renderInline(block.text)}</p>`;
    case "list":
      return `<ul>${block.items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</ul>`;
    case "quote":
      return `<blockquote><p>${escapeXml(block.text)}</p></blockquote>`;
    case "code":
      return `<pre><code>${escapeXml(block.code)}</code></pre>`;
  }
}

function renderItem(post: Post): string {
  const url = `${site.url}/blog/${post.slug}`;
  const image = getPostImageUrl(post);
  const content = [
    ...(image ? [`<p><img src="${escapeXml(image)}" alt="" /></p>`] : []),
    ...(post.updatedAt && post.updatedAt !== post.date
      ? [`<p>Updated ${escapeXml(formatPostDate(post.updatedAt))}</p>`]
      : []),
    ...post.body.map(renderBlock),
  ].join("\n");

  // HTML is escaped once for its text nodes, then again for the enclosing XML text node.
  return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${formatRssDate(post.date)}</pubDate>
      <dc:creator>${escapeXml(site.name)}</dc:creator>
      <category>${escapeXml(post.topic)}</category>
      <description>${escapeXml(renderInline(post.excerpt))}</description>
      <content:encoded>${escapeXml(content)}</content:encoded>
    </item>`;
}

/**
 * Builds an RSS 2.0 feed with summaries and portable HTML for the latest 20 published posts.
 *
 * Publication days are normalized to midnight UTC for RSS's required date-time format.
 * `lastBuildDate` is the newest publication or revision day, so it only moves when content does.
 *
 * @param posts - Published posts from the same source used by the blog pages.
 * @returns UTF-8 XML with stable permalink GUIDs, ordered newest first.
 * @example
 * ```ts
 * return new Response(getRssFeed(posts), {
 *   headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
 * });
 * ```
 */
export function getRssFeed(posts: readonly Post[]): string {
  const latest = [...posts]
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug))
    .slice(0, FEED_ITEM_LIMIT);
  const lastChange = latest
    .map((post) => post.updatedAt ?? post.date)
    .reduce<Post["date"] | null>((newest, day) => (newest && newest > day ? newest : day), null);
  const year = (lastChange ?? new Date().toISOString()).slice(0, 4);

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(`${blog.title} — ${site.name}`)}</title>
    <link>${escapeXml(`${site.url}/blog`)}</link>
    <description>${escapeXml(blog.description)}</description>
    <language>en-IN</language>
    <copyright>${escapeXml(`© ${year} ${site.fullName}`)}</copyright>
${lastChange ? `    <lastBuildDate>${formatRssDate(lastChange)}</lastBuildDate>\n` : ""}    <ttl>${FEED_TTL}</ttl>
    <atom:link href="${escapeXml(blog.feedUrl)}" rel="self" type="application/rss+xml" />
${latest.map(renderItem).join("\n")}
  </channel>
</rss>
`;
}
