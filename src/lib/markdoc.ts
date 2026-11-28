import Markdoc, { type Config, type Node } from "@markdoc/markdoc";

import { CASE_STUDY_DIAGRAM_NAMES } from "@/data/caseStudies";
import { POST_DIAGRAM_NAMES } from "@/data/posts";

export type { Node as ArticleNode };

export type ArticleKind = "post" | "caseStudy";

export type ArticleDiagram = {
  name: string;
  caption: string;
  alt: string;
};

export type ArticleCodeSample = {
  language: string;
  code: string;
};

export type ArticleLink = {
  href: string;
  text: string;
};

const WORDS_PER_MINUTE = 220;

const BLOCK_TYPES = new Set(["paragraph", "heading", "list", "blockquote", "fence", "tag"]);

const INLINE_TYPES = new Set(["inline", "text", "code", "strong", "em", "link", "softbreak"]);

function diagramTag(names: readonly string[]) {
  return {
    selfClosing: true,
    attributes: {
      name: { type: String, required: true, matches: [...names] },
      caption: { type: String, required: true },
      alt: { type: String, required: true },
    },
  };
}

const CONFIGS: Record<ArticleKind, Config> = {
  post: { tags: { diagram: diagramTag(POST_DIAGRAM_NAMES) } },
  caseStudy: {
    tags: { diagram: diagramTag(CASE_STUDY_DIAGRAM_NAMES), decisions: { selfClosing: true } },
  },
};

function walk(node: Node, visit: (node: Node) => void) {
  visit(node);
  for (const child of node.children) walk(child, visit);
}

function unsupported(node: Node): string | null {
  if (node.type === "heading" && node.attributes.level !== 2) return "only `##` headings are used";
  if (node.type === "list" && node.attributes.ordered) return "only `-` lists are used";
  if (node.type === "item" && node.children.some((child) => child.type !== "inline")) {
    return "list items hold one line of text";
  }
  if (node.type === "blockquote" && node.children.some((child) => child.type !== "paragraph")) {
    return "quotes hold plain paragraphs";
  }
  return null;
}

function checkStructure(ast: Node): string[] {
  const problems: string[] = [];
  const report = (node: Node, message: string) =>
    problems.push(`line ${(node.lines[0] ?? 0) + 1}: ${message}`);

  for (const block of ast.children) {
    if (!BLOCK_TYPES.has(block.type)) report(block, `\`${block.type}\` is not supported`);
  }
  walk(ast, (node) => {
    const problem = unsupported(node);
    if (problem) report(node, problem);
    if (node.type === "inline") {
      walk(node, (inline) => {
        if (!INLINE_TYPES.has(inline.type)) report(inline, `\`${inline.type}\` is not supported`);
      });
    }
  });
  return problems;
}

/**
 * Parses an article body and fails loudly on anything the site cannot render, so a typo in a
 * diagram name or an unsupported block stops the build instead of shipping.
 *
 * @param source - The body file's Markdown.
 * @param kind - Whether the file is a post or a case study body.
 * @param file - The file's path, used in error messages.
 * @returns The validated Markdoc syntax tree.
 *
 * @example
 * ```ts
 * const ast = parseArticle(source, "post", "src/content/posts/durable-execution-over-sagas.md");
 * ```
 */
export function parseArticle(source: string, kind: ArticleKind, file: string): Node {
  const ast = Markdoc.parse(source);
  const problems = [
    ...Markdoc.validate(ast, CONFIGS[kind]).map(
      ({ lines, error }) => `line ${(lines[0] ?? 0) + 1}: ${error.message}`,
    ),
    ...checkStructure(ast),
  ];
  if (kind === "caseStudy") {
    const count = ast.children.filter((node) => node.tag === "decisions").length;
    if (count !== 1) problems.push(`expected one {% decisions /%} tag, found ${count}`);
  }
  if (problems.length > 0) {
    throw new Error(`${file} is not a valid article body:\n  ${problems.join("\n  ")}`);
  }
  return ast;
}

/**
 * Parses one line of inline Markdown, such as a case-study decision field.
 *
 * @param text - Text that may use inline code, emphasis and links.
 * @returns The `inline` node holding its parts.
 *
 * @example
 * ```tsx
 * <ArticleInline node={parseInline(decision.context)} />
 * ```
 */
export function parseInline(text: string): Node {
  const [paragraph, ...rest] = Markdoc.parse(text).children;
  const inline = paragraph?.type === "paragraph" ? paragraph.children[0] : undefined;
  const supported = (node: Node): boolean =>
    INLINE_TYPES.has(node.type) && node.children.every(supported);
  if (!inline || rest.length > 0 || !supported(inline)) {
    throw new Error(`Expected one line of inline Markdown: ${text}`);
  }
  return inline;
}

/**
 * Reads a string attribute that validation has already required.
 *
 * @param node - A tag or fence node.
 * @param key - The attribute name.
 * @returns The attribute's value.
 *
 * @example
 * ```ts
 * const caption = getStringAttribute(node, "caption");
 * ```
 */
export function getStringAttribute(node: Node, key: string): string {
  const value: unknown = node.attributes[key];
  if (typeof value !== "string") {
    throw new Error(`Expected a string \`${key}\` on line ${(node.lines[0] ?? 0) + 1}.`);
  }
  return value;
}

/**
 * Flattens inline Markdown to text, keeping backticks around inline code.
 *
 * @param node - Any node; its text descendants are joined.
 * @returns The text, with soft line breaks as spaces.
 *
 * @example
 * ```ts
 * getInlineText(heading);
 * // => "What durable execution is"
 * ```
 */
export function getInlineText(node: Node): string {
  if (node.type === "text") return getStringAttribute(node, "content");
  if (node.type === "code") return `\`${getStringAttribute(node, "content")}\``;
  if (node.type === "softbreak") return " ";
  return node.children.map(getInlineText).join("");
}

/**
 * Reads a fenced code block.
 *
 * @param node - A `fence` node.
 * @returns The language and the code without its closing newline.
 *
 * @example
 * ```ts
 * const { language, code } = getCodeSample(node);
 * ```
 */
export function getCodeSample(node: Node): ArticleCodeSample {
  const language: unknown = node.attributes.language;
  return {
    language: typeof language === "string" ? language : "text",
    code: getStringAttribute(node, "content").replace(/\n$/, ""),
  };
}

/**
 * Reads a `{% diagram %}` tag.
 *
 * @param node - A `diagram` tag node.
 * @returns Its name, visible caption and alt text.
 *
 * @example
 * ```ts
 * const { name, caption, alt } = getDiagram(node);
 * ```
 */
export function getDiagram(node: Node): ArticleDiagram {
  return {
    name: getStringAttribute(node, "name"),
    caption: getStringAttribute(node, "caption"),
    alt: getStringAttribute(node, "alt"),
  };
}

/**
 * Narrows a string to one of a list of literal values.
 *
 * @param values - The allowed values, such as `POST_DIAGRAM_NAMES`.
 * @param value - The string to check.
 * @returns Whether `value` is in `values`.
 *
 * @example
 * ```ts
 * if (isOneOf(POST_DIAGRAM_NAMES, name)) return <PostDiagram name={name} … />;
 * ```
 */
export function isOneOf<Value extends string>(
  values: readonly Value[],
  value: string,
): value is Value {
  return values.some((item) => item === value);
}

/**
 * Lists the `##` headings in reading order, which become the table of contents.
 *
 * @param ast - A parsed article body.
 * @param decisionsHeading - Heading to list where a `{% decisions /%}` tag sits.
 * @returns The heading texts.
 *
 * @example
 * ```ts
 * getArticleHeadings(ast, DECISIONS_HEADING);
 * ```
 */
export function getArticleHeadings(ast: Node, decisionsHeading?: string): string[] {
  return ast.children.flatMap((node) => {
    if (node.type === "heading") return [getInlineText(node)];
    if (node.tag === "decisions" && decisionsHeading) return [decisionsHeading];
    return [];
  });
}

/**
 * Estimates reading time from the prose, code and diagram captions a reader sees.
 *
 * @param ast - A parsed article body.
 * @returns Whole minutes at 220 words a minute, at least one.
 *
 * @example
 * ```ts
 * getReadMinutes(ast);
 * // => 6
 * ```
 */
export function getReadMinutes(ast: Node): number {
  const text = ast.children.map((node) => {
    if (node.type === "fence") return getCodeSample(node).code;
    if (node.tag === "diagram") return getDiagram(node).caption;
    if (node.type === "list") return node.children.map(getInlineText).join(" ");
    return getInlineText(node);
  });
  const words = text.join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

/**
 * Turns a body file into portable Markdown by replacing each tag's lines, so prose and code reach
 * plain-text readers exactly as written.
 *
 * @param source - The body file's Markdown.
 * @param ast - The same body, parsed.
 * @param decisionsMarkdown - Markdown to put where a `{% decisions /%}` tag sits.
 * @returns Markdown with figures written out as text.
 *
 * @example
 * ```ts
 * toPortableMarkdown(article.source, article.ast, decisions);
 * ```
 */
export function toPortableMarkdown(source: string, ast: Node, decisionsMarkdown = ""): string {
  const lines = source.split("\n");
  const tags = ast.children.filter((node) => node.type === "tag").reverse();
  for (const node of tags) {
    const [start = 0, end = start + 1] = node.lines;
    const replacement =
      node.tag === "diagram"
        ? `**Figure.** ${getDiagram(node).caption} ${getDiagram(node).alt}`
        : decisionsMarkdown;
    lines.splice(start, end - start, replacement);
  }
  return lines.join("\n").trim();
}

/**
 * Collects every node of one type, in document order.
 *
 * @param ast - A parsed article body.
 * @param type - The node type, such as `"fence"` or `"link"`.
 * @returns The matching nodes.
 *
 * @example
 * ```ts
 * const samples = findNodes(ast, "fence").map(getCodeSample);
 * ```
 */
export function findNodes(ast: Node, type: Node["type"]): Node[] {
  const found: Node[] = [];
  walk(ast, (node) => {
    if (node.type === type) found.push(node);
  });
  return found;
}

/**
 * Lists the links written in a body.
 *
 * @param ast - A parsed article body.
 * @returns Each link's target and text.
 *
 * @example
 * ```ts
 * for (const { href, text } of getLinks(ast)) …
 * ```
 */
export function getLinks(ast: Node): ArticleLink[] {
  return findNodes(ast, "link").map((node) => ({
    href: getStringAttribute(node, "href"),
    text: getInlineText(node),
  }));
}
