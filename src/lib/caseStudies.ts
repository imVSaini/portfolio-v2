import { caseStudies, type CaseStudy } from "@/data/caseStudies";
import { getArticleHeadings, type ArticleNode } from "@/lib/markdoc";

/** Heading of the decisions list, listed where the body's `{% decisions /%}` tag sits. */
export const DECISIONS_HEADING = "Decisions and trade-offs";

/**
 * Builds the site-relative URL of a case study.
 *
 * @param study - The case study to link to.
 * @returns The study's path under `/case-studies`.
 *
 * @example
 * ```ts
 * getCaseStudyPath(study);
 * // => "/case-studies/lead-management-crm"
 * ```
 */
export function getCaseStudyPath(study: CaseStudy): `/case-studies/${string}` {
  return `/case-studies/${study.slug}`;
}

/**
 * Lists a case study's section headings in reading order, for its table of contents.
 *
 * @param ast - The case study's parsed body.
 * @returns The body's headings, with the decisions heading where its tag sits.
 *
 * @example
 * ```tsx
 * <ArticleAside headings={getCaseStudyHeadings(ast)} share={{ url, title }} />
 * ```
 */
export function getCaseStudyHeadings(ast: ArticleNode): string[] {
  return getArticleHeadings(ast, DECISIONS_HEADING);
}

/**
 * Finds the case study to suggest at the end of another, wrapping round to the first.
 *
 * @param study - The case study being displayed.
 * @returns The study after it in display order, or null when it is the only one.
 *
 * @example
 * ```tsx
 * const next = getNextCaseStudy(study);
 * return next && <CaseStudyNext study={next} />;
 * ```
 */
export function getNextCaseStudy(study: CaseStudy): CaseStudy | null {
  const index = caseStudies.findIndex((item) => item.slug === study.slug);
  const next = caseStudies[(index + 1) % caseStudies.length];
  return next && next.slug !== study.slug ? next : null;
}
