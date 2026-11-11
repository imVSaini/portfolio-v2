import { site } from "@/data/site";

const CONTENT_TYPES = {
  markdown: "text/markdown; charset=utf-8",
  text: "text/plain; charset=utf-8",
  rss: "application/rss+xml; charset=utf-8",
} as const;

const CACHE_CONTROL = "public, max-age=3600, s-maxage=3600";

type TextResponseOptions = {
  type: keyof typeof CONTENT_TYPES;
  canonical?: `/${string}`;
};

/**
 * Wraps a generated text document (Markdown, plain text or RSS) in a cacheable response.
 *
 * @param body - The document to send.
 * @param options - The content type, plus the canonical page for Markdown mirrors.
 * @returns A response with the content type, cache policy and, when given, a canonical `Link`.
 *
 * @example
 * ```ts
 * return textResponse(getPostMarkdown(post), {
 *   type: "markdown",
 *   canonical: `/blog/${post.slug}`,
 * });
 * ```
 */
export function textResponse(body: string, { type, canonical }: TextResponseOptions): Response {
  const headers = new Headers({
    "Content-Type": CONTENT_TYPES[type],
    "Cache-Control": CACHE_CONTROL,
  });

  if (canonical) headers.set("Link", `<${new URL(canonical, site.url).href}>; rel="canonical"`);
  if (type === "markdown") headers.set("Vary", "Accept");

  return new Response(body, { headers });
}
