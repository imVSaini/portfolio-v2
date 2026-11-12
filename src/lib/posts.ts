import type { Post } from "@/data/posts";
import { getAssetUrl } from "@/lib/asset";

const DATE_FORMAT = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * Formats a post's ISO date for display.
 *
 * @param date - The post's `date`, as `YYYY-MM-DD`.
 * @returns The date as day, short month and year.
 *
 * @example
 * ```ts
 * formatPostDate("2026-10-28");
 * // => "28 Oct 2026"
 * ```
 */
export function formatPostDate(date: Post["date"]): string {
  return DATE_FORMAT.format(new Date(date));
}

/**
 * Builds the absolute URL of a post's own cover image when one is available.
 *
 * @param post - The post to describe.
 * @returns The cover in the assets bucket, or null when the post only has inline artwork.
 *
 * @example
 * ```ts
 * const image = getPostImageUrl(post) ?? site.ogImage;
 * ```
 */
export function getPostImageUrl(post: Post): string | null {
  return post.cover ? getAssetUrl(post.cover) : null;
}
