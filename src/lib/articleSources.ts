import { caseStudies, type CaseStudy } from "@/data/caseStudies";
import { posts, type Post } from "@/data/posts";
import { getReadMinutes, parseArticle, type ArticleKind, type ArticleNode } from "@/lib/markdoc";

export type Article = {
  source: string;
  ast: ArticleNode;
  readMinutes: number;
};

function readSource(path: string, file: unknown): string {
  if (typeof file === "object" && file !== null && "default" in file) {
    const text: unknown = file.default;
    if (typeof text === "string") return text;
  }
  throw new Error(`${path} did not load as text. Check the *.md rule in next.config.ts.`);
}

function loadArticles(
  files: Record<string, unknown>,
  folder: `/${string}/`,
  slugs: readonly string[],
  kind: ArticleKind,
): ReadonlyMap<string, Article> {
  const articles = new Map<string, Article>();
  for (const [path, file] of Object.entries(files)) {
    const slug = path.slice(folder.length, -".md".length);
    if (!slugs.includes(slug)) throw new Error(`${path} has no matching entry in src/data.`);
    const source = readSource(path, file);
    const ast = parseArticle(source, kind, path.slice(1));
    articles.set(slug, { source, ast, readMinutes: getReadMinutes(ast) });
  }
  const missing = slugs.filter((slug) => !articles.has(slug));
  if (missing.length > 0) {
    throw new Error(`Missing body files in ${folder}: ${missing.map((s) => `${s}.md`).join(", ")}`);
  }
  return articles;
}

const POST_ARTICLES = loadArticles(
  import.meta.glob("/src/content/posts/*.md", { eager: true }),
  "/src/content/posts/",
  posts.map(({ slug }) => slug),
  "post",
);

const CASE_STUDY_ARTICLES = loadArticles(
  import.meta.glob("/src/content/case-studies/*.md", { eager: true }),
  "/src/content/case-studies/",
  caseStudies.map(({ slug }) => slug),
  "caseStudy",
);

function pick(articles: ReadonlyMap<string, Article>, slug: string): Article {
  const article = articles.get(slug);
  if (!article) throw new Error(`No body file for ${slug}.`);
  return article;
}

/**
 * Returns a post's parsed body. Every body is read and validated when this module loads, so a
 * missing, extra or invalid file fails the build.
 *
 * @param post - The post whose body to read.
 * @returns The raw Markdown, its syntax tree and the reading time.
 *
 * @example
 * ```ts
 * const { ast, readMinutes } = getPostArticle(post);
 * ```
 */
export function getPostArticle(post: Post): Article {
  return pick(POST_ARTICLES, post.slug);
}

/**
 * Returns a case study's parsed body, including where its decisions list sits.
 *
 * @param study - The case study whose body to read.
 * @returns The raw Markdown, its syntax tree and the reading time.
 *
 * @example
 * ```ts
 * const { ast } = getCaseStudyArticle(study);
 * ```
 */
export function getCaseStudyArticle(study: CaseStudy): Article {
  return pick(CASE_STUDY_ARTICLES, study.slug);
}
