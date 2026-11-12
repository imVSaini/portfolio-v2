import { blog } from "@/data/blog";
import { contact } from "@/data/contact";
import { experience } from "@/data/experience";
import { posts, type Post, type PostBlock } from "@/data/posts";
import { projects } from "@/data/projects";
import { site } from "@/data/site";
import { skillGroups } from "@/data/skills";
import { formatPostDate } from "@/lib/posts";

function absolute(path: `/${string}`) {
  return new URL(path, site.url).href;
}

function renderBlock(block: PostBlock) {
  switch (block.type) {
    case "heading":
      return `## ${block.text}`;
    case "paragraph":
      return block.text;
    case "list":
      return block.items.map((item) => `- ${item}`).join("\n");
    case "quote":
      return `> ${block.text}`;
    case "code":
      return `\`\`\`${block.language}\n${block.code}\n\`\`\``;
    case "diagram":
      return `**Figure.** ${block.caption} ${block.alt}`;
  }
}

/**
 * Builds the site-relative URL of a post's Markdown version.
 *
 * @param post - The post to link to.
 * @returns The `index.md` path that sits under the post's own URL.
 *
 * @example
 * ```ts
 * getPostMarkdownPath(post);
 * // => "/blog/system-design-is-trade-offs/index.md"
 * ```
 */
export function getPostMarkdownPath(post: Post): `/${string}` {
  return `/blog/${post.slug}/index.md`;
}

/**
 * Renders a post as standalone Markdown for language models and other plain-text readers.
 *
 * @param post - The post to render.
 * @returns The title, byline, canonical link and body as Markdown.
 *
 * @example
 * ```ts
 * return new Response(getPostMarkdown(post), {
 *   headers: { "Content-Type": "text/markdown; charset=utf-8" },
 * });
 * ```
 */
export function getPostMarkdown(post: Post): string {
  const updated =
    post.updatedAt && post.updatedAt !== post.date
      ? `, updated ${formatPostDate(post.updatedAt)}`
      : "";

  return [
    `# ${post.title}`,
    `> ${post.excerpt}`,
    `By ${site.name}, ${site.role}. Published ${formatPostDate(post.date)}${updated}. ${post.topic}, ${post.readMinutes} min read.`,
    `Canonical: ${absolute(`/blog/${post.slug}`)}`,
    ...post.body.map(renderBlock),
  ].join("\n\n");
}

/**
 * Renders the portfolio's profile (experience, skills, selected work and contact) as Markdown.
 *
 * @returns The home page's content as one Markdown document.
 *
 * @example
 * ```ts
 * return new Response(getProfileMarkdown(), {
 *   headers: { "Content-Type": "text/markdown; charset=utf-8" },
 * });
 * ```
 */
export function getProfileMarkdown(): string {
  const roles = experience.map((role) =>
    [
      `### ${role.title}, ${role.company}`,
      `${role.location}. ${role.start} to ${role.end}.`,
      role.summary,
      role.highlights.map((highlight) => `- ${highlight}`).join("\n"),
      `Stack: ${role.stack.join(", ")}.`,
    ].join("\n\n"),
  );

  return [
    `# ${site.fullName}`,
    `> ${site.description}`,
    `${site.role} based in ${site.location}. Canonical: ${site.url}`,
    "## Experience",
    ...roles,
    "## Skills",
    skillGroups
      .map((group) => `- **${group.name}** (${group.note}): ${group.items.join(", ")}`)
      .join("\n"),
    "## Selected work",
    projects
      .map(
        (project) =>
          `- [${project.title}](${project.url}): ${project.category} for ${project.client}. ${project.blurb} Built with ${project.stack.join(", ")}.`,
      )
      .join("\n"),
    "## Contact",
    [
      `- Email: ${contact.email}`,
      ...contact.links.map((link) => `- ${link.label}: [${link.handle}](${link.href})`),
    ].join("\n"),
  ].join("\n\n");
}

/**
 * Builds `/llms.txt`: a curated Markdown index that points language models at the site's
 * Markdown pages, following the llmstxt.org proposal.
 *
 * @returns The H1, summary, details and link sections, with secondary links under `Optional`.
 *
 * @example
 * ```ts
 * return new Response(getLlmsTxt(), {
 *   headers: { "Content-Type": "text/plain; charset=utf-8" },
 * });
 * ```
 */
export function getLlmsTxt(): string {
  const current = experience[0];

  return [
    `# ${site.name}`,
    `> ${site.description}`,
    [
      `${site.fullName} is a ${site.role.toLowerCase()} in ${site.location}`,
      current ? `, currently ${current.title} at ${current.company}. ` : ". ",
      "The blog covers backend architecture, performance and frontend craft, written from products ",
      "running in production. Every link below is Markdown; HTML pages live at the same URL without ",
      "the trailing `index.md`.",
    ].join(""),
    "## Profile",
    `- [About ${site.name}](${absolute("/index.md")}): Experience, skills, selected work and contact details.`,
    "## Blog",
    posts
      .map((post) => `- [${post.title}](${absolute(getPostMarkdownPath(post))}): ${post.excerpt}`)
      .join("\n"),
    "## Optional",
    [
      `- [Full text](${absolute("/llms-full.txt")}): The profile and every post in one file.`,
      `- [RSS feed](${blog.feedUrl}): ${blog.description}`,
      ...contact.links.map((link) => `- [${link.label}](${link.href}): ${link.handle}`),
    ].join("\n"),
  ].join("\n\n");
}

/**
 * Builds `/llms-full.txt`: the profile followed by every post, so a model can read the whole site
 * in one request.
 *
 * @returns The profile and all posts as one Markdown document, newest post first.
 *
 * @example
 * ```ts
 * return new Response(getLlmsFullTxt(), {
 *   headers: { "Content-Type": "text/plain; charset=utf-8" },
 * });
 * ```
 */
export function getLlmsFullTxt(): string {
  return [getProfileMarkdown(), ...posts.map(getPostMarkdown)].join("\n\n---\n\n");
}
