import type { Metadata } from "next";

import { feedAlternates } from "@/data/blog";
import { site } from "@/data/site";

type PageMetadataOptions = {
  title: string;
  description: string;
  path: `/${string}`;
  /** Link-preview title, when it differs from the `<title>` the layout template builds. */
  socialTitle?: string;
  /** Site-relative path of the page's Markdown version. */
  markdownPath?: `/${string}`;
  /** Marks the page as an article; its preview card comes from its own `opengraph-image`. */
  article?: { publishedTime: string; modifiedTime?: string };
};

/**
 * Builds a page's metadata so its canonical URL, feeds and link previews always match its own
 * title and description.
 *
 * A page's `openGraph` and `twitter` replace the layout's wholesale, so every shared field is
 * set here rather than inherited.
 *
 * @param options - The page's title, description and path, plus what sets it apart.
 * @returns Metadata for the page's `metadata` export or `generateMetadata`.
 *
 * @example
 * ```ts
 * export const metadata = buildPageMetadata({
 *   title,
 *   description,
 *   path: "/blog",
 *   socialTitle: `${title} — ${site.name}`,
 * });
 * ```
 */
export function buildPageMetadata({
  title,
  description,
  path,
  socialTitle = title,
  markdownPath,
  article,
}: PageMetadataOptions): Metadata {
  const shared = {
    url: path,
    title: socialTitle,
    description,
    siteName: site.name,
    locale: "en_IN",
  };

  return {
    title,
    description,
    alternates: {
      canonical: path,
      types: markdownPath ? { ...feedAlternates, "text/markdown": markdownPath } : feedAlternates,
    },
    openGraph: article
      ? {
          ...shared,
          type: "article",
          publishedTime: article.publishedTime,
          ...(article.modifiedTime && { modifiedTime: article.modifiedTime }),
          authors: [site.name],
        }
      : { ...shared, type: "website", images: [site.ogImage] },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      ...(!article && { images: [site.ogImage] }),
    },
  };
}
