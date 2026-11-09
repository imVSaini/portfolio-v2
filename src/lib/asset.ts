import { site } from "@/data/site";

/**
 * Builds the absolute URL of a file stored in the Cloudflare R2 assets bucket.
 *
 * @param path - Path from the bucket root, starting with `/`.
 * @returns The absolute URL on {@link site.assetsUrl}.
 *
 * @example
 * ```ts
 * getAssetUrl("/work/studio.webp");
 * // => "https://assets.imvaibhav.com/work/studio.webp"
 * ```
 */
export function getAssetUrl(path: `/${string}`): string {
  return new URL(path, site.assetsUrl).href;
}
