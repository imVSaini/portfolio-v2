import { posts } from "@/data/posts";
import { textResponse } from "@/lib/http";
import { getRssFeed } from "@/lib/rss";

// Deterministic local content is prerendered with Cache Components and refreshed on deployment.
export function GET() {
  return textResponse(getRssFeed(posts), { type: "rss" });
}
