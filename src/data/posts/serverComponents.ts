import type { Post } from "@/data/posts/schema";

export const serverComponents: Post = {
  slug: "server-components-in-production",
  title: "React Server Components in production: boundaries, streaming and explicit caching",
  excerpt:
    "Server Components change where code runs, not just how it is written. After running them in production, the patterns that matter are clear: keep a server tree with small client leaves, prerender a static shell and stream the slow parts, make caching explicit with Next.js 16’s Cache Components, and treat every server action as a public API endpoint.",
  metaTitle: "Server Components in production",
  metaDescription:
    "A server tree with client leaves, a prerendered shell with streamed holes, explicit use cache with tags, and server actions treated as public endpoints.",
  topic: "Frontend",
  date: "2026-11-04",
  tint: "orange",
  art: "tree",
};
