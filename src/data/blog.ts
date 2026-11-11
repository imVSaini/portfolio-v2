import { site } from "@/data/site";

export const blog = {
  title: "Blog",
  description: `Notes by ${site.name} on backend architecture, performance and frontend craft, written from products in production.`,
  /** Site-relative, for links that should stay on the current host. */
  feedPath: "/rss.xml",
  feedUrl: new URL("/rss.xml", site.url).href,
} as const;

/** Reuse on routes that replace the root layout's `alternates` metadata. */
export const feedAlternates = {
  "application/rss+xml": [{ url: blog.feedUrl, title: `${blog.title} — ${site.name}` }],
};
