import { blog } from "@/data/blog";
import { caseStudies, type CaseStudy } from "@/data/caseStudies";
import { contact } from "@/data/contact";
import { experience } from "@/data/experience";
import { posts, type Post } from "@/data/posts";
import { projects } from "@/data/projects";
import { site } from "@/data/site";
import { skillGroups } from "@/data/skills";
import { getCaseStudyArticle, getPostArticle } from "@/lib/articleSources";
import { DECISIONS_HEADING, getCaseStudyPath } from "@/lib/caseStudies";
import { toPortableMarkdown } from "@/lib/markdoc";
import { formatPostDate, getPostPath } from "@/lib/posts";

function absolute(path: `/${string}`) {
  return new URL(path, site.url).href;
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
 * // => "/blog/cell-based-architecture-blast-radius/index.md"
 * ```
 */
export function getPostMarkdownPath(post: Post): `/${string}` {
  return `${getPostPath(post)}/index.md`;
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
  const { source, ast, readMinutes } = getPostArticle(post);
  const updated =
    post.updatedAt && post.updatedAt !== post.date
      ? `, updated ${formatPostDate(post.updatedAt)}`
      : "";

  return [
    `# ${post.title}`,
    `> ${post.excerpt}`,
    `By ${site.name}, ${site.role}. Published ${formatPostDate(post.date)}${updated}. ${post.topic}, ${readMinutes} min read.`,
    `Canonical: ${absolute(getPostPath(post))}`,
    toPortableMarkdown(source, ast),
  ].join("\n\n");
}

/**
 * Builds the site-relative URL of a case study's Markdown version.
 *
 * @param study - The case study to link to.
 * @returns The `index.md` path that sits under the study's own URL.
 *
 * @example
 * ```ts
 * getCaseStudyMarkdownPath(study);
 * // => "/case-studies/lead-management-crm/index.md"
 * ```
 */
export function getCaseStudyMarkdownPath(study: CaseStudy): `/${string}` {
  return `${getCaseStudyPath(study)}/index.md`;
}

/**
 * Renders a case study as standalone Markdown for language models and other plain-text readers.
 *
 * @param study - The case study to render.
 * @returns The title, byline, canonical link, facts, prose and decisions as Markdown.
 *
 * @example
 * ```ts
 * return textResponse(getCaseStudyMarkdown(study), {
 *   type: "markdown",
 *   canonical: getCaseStudyPath(study),
 * });
 * ```
 */
export function getCaseStudyMarkdown(study: CaseStudy): string {
  const { source, ast } = getCaseStudyArticle(study);
  const decisions = study.decisions.map((decision) =>
    [
      `### ${decision.title}`,
      decision.context,
      `**What I chose.** ${decision.chose}`,
      `**What it cost.** ${decision.cost}`,
    ].join("\n\n"),
  );

  return [
    `# ${study.title} case study`,
    `> ${study.headline}`,
    `By ${site.name}, ${site.role}. Published ${formatPostDate(study.date)}. ${study.category}.`,
    `Canonical: ${absolute(getCaseStudyPath(study))}`,
    study.facts.map((fact) => `- **${fact.label}**: ${fact.value}`).join("\n"),
    study.metrics.map((metric) => `- **${metric.value}**: ${metric.label}`).join("\n"),
    `Stack: ${study.stack.join(", ")}.`,
    toPortableMarkdown(source, ast, [`## ${DECISIONS_HEADING}`, ...decisions].join("\n\n")),
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
          `- ${project.url ? `[${project.title}](${project.url})` : project.title}: ${project.category}. ${project.blurb} Built with ${project.stack.join(", ")}.`,
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
      "running in production, and the case studies walk through how individual products were built ",
      "and what each decision cost. Every link below is Markdown; HTML pages live at the same URL without ",
      "the trailing `index.md`.",
    ].join(""),
    "## Profile",
    `- [About ${site.name}](${absolute("/index.md")}): Experience, skills, selected work and contact details.`,
    "## Blog",
    posts
      .map((post) => `- [${post.title}](${absolute(getPostMarkdownPath(post))}): ${post.excerpt}`)
      .join("\n"),
    "## Case studies",
    caseStudies
      .map(
        (study) =>
          `- [${study.title}](${absolute(getCaseStudyMarkdownPath(study))}): ${study.headline}`,
      )
      .join("\n"),
    "## Optional",
    [
      `- [Full text](${absolute("/llms-full.txt")}): The profile, every case study and every post in one file.`,
      `- [RSS feed](${blog.feedUrl}): ${blog.description}`,
      ...contact.links.map((link) => `- [${link.label}](${link.href}): ${link.handle}`),
    ].join("\n"),
  ].join("\n\n");
}

/**
 * Builds `/llms-full.txt`: the profile, the case studies and every post, so a model can read the
 * whole site in one request.
 *
 * @returns The profile, all case studies and all posts as one Markdown document.
 *
 * @example
 * ```ts
 * return new Response(getLlmsFullTxt(), {
 *   headers: { "Content-Type": "text/plain; charset=utf-8" },
 * });
 * ```
 */
export function getLlmsFullTxt(): string {
  return [
    getProfileMarkdown(),
    ...caseStudies.map(getCaseStudyMarkdown),
    ...posts.map(getPostMarkdown),
  ].join("\n\n---\n\n");
}
