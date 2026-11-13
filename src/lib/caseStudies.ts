import { caseStudies, type CaseStudy } from "@/data/caseStudies";

/** Heading of the decisions list, which sits between a study's two runs of prose. */
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
 * @param study - The case study being displayed.
 * @returns The overview headings, the decisions heading, then the outcome headings.
 *
 * @example
 * ```tsx
 * <ArticleToc headings={getCaseStudyHeadings(study)} />
 * ```
 */
export function getCaseStudyHeadings(study: CaseStudy): string[] {
  const headings = (blocks: CaseStudy["overview"]) =>
    blocks.flatMap((block) => (block.type === "heading" ? [block.text] : []));

  return [...headings(study.overview), DECISIONS_HEADING, ...headings(study.outcome)];
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
