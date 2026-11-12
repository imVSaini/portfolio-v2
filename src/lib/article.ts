/**
 * Builds the anchor id of a heading inside an article, shared by the body and its table of contents.
 *
 * @param text - The heading text.
 * @returns A lower-case, hyphenated id.
 *
 * @example
 * ```ts
 * getHeadingId("What you actually buy");
 * // => "what-you-actually-buy"
 * ```
 */
export function getHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
