import { readFileSync } from "node:fs";
import path from "node:path";

import type { CaseStudy } from "@/data/caseStudies";
import type { Post } from "@/data/posts";
import { getCaseStudyHeadings } from "@/lib/caseStudies";
import {
  findNodes,
  getArticleHeadings,
  getCodeSample,
  getDiagram,
  getInlineText,
  getLinks,
  getReadMinutes,
  parseArticle,
  type ArticleCodeSample,
  type ArticleDiagram,
  type ArticleKind,
  type ArticleLink,
  type ArticleNode,
} from "@/lib/markdoc";

export type ArticleView = {
  source: string;
  ast: ArticleNode;
  headings: string[];
  paragraphs: string[];
  listItems: string[];
  quotes: string[];
  codeSamples: ArticleCodeSample[];
  diagrams: ArticleDiagram[];
  links: ArticleLink[];
  readMinutes: number;
};

function readArticle(folder: string, slug: string, kind: ArticleKind): ArticleView {
  const file = path.join(__dirname, "..", "src", "content", folder, `${slug}.md`);
  const source = readFileSync(file, "utf8");
  const ast = parseArticle(source, kind, file);
  const blocks = (type: ArticleNode["type"]) => ast.children.filter((node) => node.type === type);

  return {
    source,
    ast,
    headings: kind === "caseStudy" ? getCaseStudyHeadings(ast) : getArticleHeadings(ast),
    paragraphs: blocks("paragraph").map(getInlineText),
    listItems: blocks("list").flatMap((list) => list.children.map(getInlineText)),
    quotes: blocks("blockquote").map(getInlineText),
    codeSamples: findNodes(ast, "fence").map(getCodeSample),
    diagrams: ast.children.filter((node) => node.tag === "diagram").map(getDiagram),
    links: getLinks(ast),
    readMinutes: getReadMinutes(ast),
  };
}

export function readPostArticle(post: Post): ArticleView {
  return readArticle("posts", post.slug, "post");
}

export function readCaseStudyArticle(study: CaseStudy): ArticleView {
  return readArticle("case-studies", study.slug, "caseStudy");
}
