import { blog } from "@/data/blog";
import { caseStudiesPage, type CaseStudy } from "@/data/caseStudies";
import { contact } from "@/data/contact";
import type { Post } from "@/data/posts";
import { site } from "@/data/site";
import { getCaseStudyPath } from "@/lib/caseStudies";
import { getPostImageUrl } from "@/lib/posts";

type NodeReference = { "@id": string };

type PersonNode = NodeReference & {
  "@type": "Person";
  name: string;
  alternateName?: string;
  url: string;
  jobTitle?: string;
  sameAs?: string[];
};

type WebSiteNode = NodeReference & {
  "@type": "WebSite";
  url: string;
  name: string;
  description: string;
  inLanguage: string;
  publisher: NodeReference;
};

type BlogNode = NodeReference & {
  "@type": "Blog";
  url: string;
  name: string;
  description: string;
  inLanguage: string;
  publisher: NodeReference;
  isPartOf: NodeReference;
  blogPost?: BlogPostingNode[];
};

type WebPageNode = NodeReference & {
  "@type": "WebPage" | "CollectionPage";
  url: string;
  name: string;
  description: string;
  inLanguage: string;
  isPartOf: NodeReference;
  mainEntity?: NodeReference;
  breadcrumb?: NodeReference;
  primaryImageOfPage?: { "@type": "ImageObject"; url: string };
};

type BlogPostingNode = NodeReference & {
  "@type": "BlogPosting";
  headline: string;
  description: string;
  image?: string;
  datePublished: Post["date"];
  dateModified?: Post["date"];
  articleSection: string;
  inLanguage: string;
  url: string;
  mainEntityOfPage: NodeReference;
  author: PersonNode;
  publisher: NodeReference;
  isPartOf: NodeReference;
};

type ArticleNode = NodeReference & {
  "@type": "Article";
  headline: string;
  description: string;
  image: string;
  datePublished: CaseStudy["date"];
  articleSection: string;
  keywords: string;
  inLanguage: string;
  url: string;
  mainEntityOfPage: NodeReference;
  author: PersonNode;
  publisher: NodeReference;
};

type BreadcrumbNode = NodeReference & {
  "@type": "BreadcrumbList";
  itemListElement: {
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }[];
};

type ItemListNode = NodeReference & {
  "@type": "ItemList";
  itemListElement: {
    "@type": "ListItem";
    position: number;
    name: string;
    url: string;
  }[];
};

/** The subset of Schema.org used by this site's page graphs. */
export type JsonLdNode =
  | PersonNode
  | WebSiteNode
  | BlogNode
  | WebPageNode
  | BlogPostingNode
  | ArticleNode
  | BreadcrumbNode
  | ItemListNode;

type Crumb = {
  name: string;
  url: string;
};

/** Stable `@id`s so every page's graph points at the same person, site and blog. */
const JSON_LD_IDS = {
  person: `${site.url}/#person`,
  website: `${site.url}/#website`,
  blog: `${site.url}/blog#blog`,
} as const;

/**
 * Serialises a structured-data graph for a `<script type="application/ld+json">` tag.
 *
 * `JSON.stringify` alone leaves `<` intact, so a value containing `</script>` could close the tag
 * early. Escaping it as `\u003c` preserves the parsed value while making it safe to inline.
 *
 * @param nodes - The schema.org nodes for the page, linked to each other by `@id`.
 * @returns The JSON string to pass to `dangerouslySetInnerHTML`.
 *
 * @example
 * ```tsx
 * <script
 *   type="application/ld+json"
 *   dangerouslySetInnerHTML={{ __html: serializeJsonLd(nodes) }}
 * />
 * ```
 */
export function serializeJsonLd(nodes: readonly JsonLdNode[]): string {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": nodes }).replace(
    /</g,
    "\\u003c",
  );
}

/**
 * Describes the site owner and the site, the two nodes every page's graph refers back to.
 *
 * @returns A `Person` and a `WebSite` node with their shared `@id`s.
 *
 * @example
 * ```ts
 * serializeJsonLd([...getSiteNodes(), page]);
 * ```
 */
function getSiteNodes(): (PersonNode | WebSiteNode)[] {
  return [
    {
      "@type": "Person",
      "@id": JSON_LD_IDS.person,
      name: site.name,
      alternateName: site.fullName,
      url: site.url,
      jobTitle: site.role,
      sameAs: contact.links.map((link) => link.href),
    },
    {
      "@type": "WebSite",
      "@id": JSON_LD_IDS.website,
      url: site.url,
      name: site.name,
      description: site.description,
      inLanguage: "en-IN",
      publisher: { "@id": JSON_LD_IDS.person },
    },
  ];
}

/**
 * Describes the blog itself, which every post's graph points to with `isPartOf`.
 *
 * @returns A `Blog` node with its shared `@id`, published by the site owner.
 *
 * @example
 * ```ts
 * serializeJsonLd([...getSiteNodes(), { ...getBlogNode(), blogPost }]);
 * ```
 */
function getBlogNode(): BlogNode {
  return {
    "@type": "Blog",
    "@id": JSON_LD_IDS.blog,
    url: `${site.url}/blog`,
    name: `${site.name}’s blog`,
    description: blog.description,
    isPartOf: { "@id": JSON_LD_IDS.website },
    inLanguage: "en-IN",
    publisher: { "@id": JSON_LD_IDS.person },
  };
}

/**
 * Builds a `BreadcrumbList` from the home page down to the current page.
 *
 * @param id - The node's `@id`, usually the page URL plus `#breadcrumb`.
 * @param crumbs - Each step's name and absolute URL, from the top level down.
 * @returns A `BreadcrumbList` node with positions starting at 1.
 *
 * @example
 * ```ts
 * getBreadcrumbNode(`${url}#breadcrumb`, [
 *   { name: "Home", url: site.url },
 *   { name: "Blog", url: `${site.url}/blog` },
 * ]);
 * ```
 */
function getBreadcrumbNode(id: string, crumbs: Crumb[]): BreadcrumbNode {
  return {
    "@type": "BreadcrumbList",
    "@id": id,
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

function getPostNode(post: Post): BlogPostingNode {
  const url = `${site.url}/blog/${post.slug}`;
  const image = getPostImageUrl(post) ?? `${url}/opengraph-image/card`;

  return {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.excerpt,
    image,
    datePublished: post.date,
    ...(post.updatedAt && { dateModified: post.updatedAt }),
    articleSection: post.topic,
    inLanguage: "en-IN",
    url,
    mainEntityOfPage: { "@id": url },
    author: { "@type": "Person", "@id": JSON_LD_IDS.person, name: site.name, url: site.url },
    publisher: { "@id": JSON_LD_IDS.person },
    isPartOf: { "@id": JSON_LD_IDS.blog },
  };
}

/**
 * Builds the homepage graph describing the portfolio, site and owner.
 *
 * @returns The homepage's self-contained structured-data nodes.
 * @example
 * ```tsx
 * <JsonLd nodes={getHomeJsonLd()} />
 * ```
 */
export function getHomeJsonLd(): JsonLdNode[] {
  return [
    ...getSiteNodes(),
    {
      "@type": "WebPage",
      "@id": site.url,
      url: site.url,
      name: `${site.name} — ${site.role}`,
      description: site.description,
      inLanguage: "en-IN",
      isPartOf: { "@id": JSON_LD_IDS.website },
      mainEntity: { "@id": JSON_LD_IDS.person },
    },
  ];
}

/**
 * Builds the blog index graph from the posts displayed on that page.
 *
 * @param posts - The visible posts in display order.
 * @returns The collection, blog, post summaries, breadcrumbs and shared entities.
 * @example
 * ```tsx
 * <JsonLd nodes={getBlogJsonLd(posts)} />
 * ```
 */
export function getBlogJsonLd(posts: readonly Post[]): JsonLdNode[] {
  const url = `${site.url}/blog`;

  return [
    ...getSiteNodes(),
    {
      "@type": "CollectionPage",
      "@id": url,
      url,
      name: `${blog.title} — ${site.name}`,
      description: blog.description,
      inLanguage: "en-IN",
      isPartOf: { "@id": JSON_LD_IDS.website },
      mainEntity: { "@id": JSON_LD_IDS.blog },
      breadcrumb: { "@id": `${url}#breadcrumb` },
    },
    getBreadcrumbNode(`${url}#breadcrumb`, [
      { name: "Home", url: site.url },
      { name: blog.title, url },
    ]),
    { ...getBlogNode(), blogPost: posts.map(getPostNode) },
  ];
}

/**
 * Builds an article graph from the same post data used to render its page.
 *
 * @param post - The article displayed on the current route.
 * @returns The article, page, breadcrumbs, blog and shared entities.
 * @example
 * ```tsx
 * <JsonLd nodes={getPostJsonLd(post)} />
 * ```
 */
export function getPostJsonLd(post: Post): JsonLdNode[] {
  const article = getPostNode(post);
  const url = article.url;

  return [
    ...getSiteNodes(),
    getBlogNode(),
    {
      "@type": "WebPage",
      "@id": url,
      url,
      name: post.title,
      description: post.excerpt,
      inLanguage: "en-IN",
      isPartOf: { "@id": JSON_LD_IDS.website },
      mainEntity: { "@id": article["@id"] },
      breadcrumb: { "@id": `${url}#breadcrumb` },
      ...(article.image && {
        primaryImageOfPage: { "@type": "ImageObject", url: article.image },
      }),
    },
    getBreadcrumbNode(`${url}#breadcrumb`, [
      { name: "Home", url: site.url },
      { name: blog.title, url: `${site.url}/blog` },
      { name: post.title, url },
    ]),
    article,
  ];
}

/**
 * Builds the case studies index graph from the studies listed on that page.
 *
 * @param studies - The visible case studies in display order.
 * @returns The collection page, its breadcrumbs, the ordered list and shared entities.
 * @example
 * ```tsx
 * <JsonLd nodes={getCaseStudiesJsonLd(caseStudies)} />
 * ```
 */
export function getCaseStudiesJsonLd(studies: readonly CaseStudy[]): JsonLdNode[] {
  const url = `${site.url}${caseStudiesPage.path}`;

  return [
    ...getSiteNodes(),
    {
      "@type": "CollectionPage",
      "@id": url,
      url,
      name: `${caseStudiesPage.title} — ${site.name}`,
      description: caseStudiesPage.description,
      inLanguage: "en-IN",
      isPartOf: { "@id": JSON_LD_IDS.website },
      mainEntity: { "@id": `${url}#list` },
      breadcrumb: { "@id": `${url}#breadcrumb` },
    },
    getBreadcrumbNode(`${url}#breadcrumb`, [
      { name: "Home", url: site.url },
      { name: caseStudiesPage.title, url },
    ]),
    {
      "@type": "ItemList",
      "@id": `${url}#list`,
      itemListElement: studies.map((study, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: study.title,
        url: `${site.url}${getCaseStudyPath(study)}`,
      })),
    },
  ];
}

/**
 * Builds a case study's graph from the same data used to render its page.
 *
 * @param study - The case study displayed on the current route.
 * @returns The article, page, breadcrumbs and shared entities.
 * @example
 * ```tsx
 * <JsonLd nodes={getCaseStudyJsonLd(study)} />
 * ```
 */
export function getCaseStudyJsonLd(study: CaseStudy): JsonLdNode[] {
  const url = `${site.url}${getCaseStudyPath(study)}`;
  const image = `${url}/opengraph-image/card`;

  return [
    ...getSiteNodes(),
    {
      "@type": "WebPage",
      "@id": url,
      url,
      name: `${study.title} case study`,
      description: study.summary,
      inLanguage: "en-IN",
      isPartOf: { "@id": JSON_LD_IDS.website },
      mainEntity: { "@id": `${url}#article` },
      breadcrumb: { "@id": `${url}#breadcrumb` },
      primaryImageOfPage: { "@type": "ImageObject", url: image },
    },
    getBreadcrumbNode(`${url}#breadcrumb`, [
      { name: "Home", url: site.url },
      { name: caseStudiesPage.title, url: `${site.url}${caseStudiesPage.path}` },
      { name: study.title, url },
    ]),
    {
      "@type": "Article",
      "@id": `${url}#article`,
      headline: `${study.title} case study`,
      description: study.summary,
      image,
      datePublished: study.date,
      articleSection: study.category,
      keywords: study.stack.join(", "),
      inLanguage: "en-IN",
      url,
      mainEntityOfPage: { "@id": url },
      author: { "@type": "Person", "@id": JSON_LD_IDS.person, name: site.name, url: site.url },
      publisher: { "@id": JSON_LD_IDS.person },
    },
  ];
}
