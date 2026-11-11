import { posts } from "@/data/posts";
import { getRssFeed } from "@/lib/rss";

// Deterministic local content is prerendered with Cache Components and refreshed on deployment.
export function GET() {
  return new Response(getRssFeed(posts), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
