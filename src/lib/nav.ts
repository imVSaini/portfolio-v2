/**
 * Points a home-page section anchor at the home route, so it still works from other pages.
 *
 * @param href - Section anchor on the home page.
 * @returns `/` for `#top`, otherwise the anchor on `/`.
 *
 * @example
 * ```ts
 * getHomeHref("#work");
 * // => "/#work"
 * ```
 */
export function getHomeHref(href: `#${string}`): `/${string}` {
  return href === "#top" ? "/" : `/${href}`;
}
