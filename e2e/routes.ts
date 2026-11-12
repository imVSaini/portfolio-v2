import { caseStudies, type CaseStudy } from "@/data/caseStudies";
import { posts, type Post } from "@/data/posts";
import { site } from "@/data/site";

export const STATIC_ROUTES = ["/", "/case-studies", "/blog", "/privacy"] as const;

export const CASE_STUDY_ROUTES = caseStudies.map((study) => getCaseStudyPath(study));

export const POST_ROUTES = posts.map((post) => getPostPath(post));

export const PAGE_ROUTES = [...STATIC_ROUTES, ...CASE_STUDY_ROUTES, ...POST_ROUTES];

export const MISSING_ROUTES = [
  "/nope",
  "/blog/nope",
  "/case-studies/nope",
  "/privacy/nope",
] as const;

export function getPostPath(post: Post): `/blog/${string}` {
  return `/blog/${post.slug}`;
}

export function getCaseStudyPath(study: CaseStudy): `/case-studies/${string}` {
  return `/case-studies/${study.slug}`;
}

export function getCanonical(path: string): string {
  return path === "/" ? site.url : `${site.url}${path}`;
}

export function getFirstPost(): Post {
  const [first] = posts;
  if (!first) throw new Error("src/data/posts has no posts to test against");
  return first;
}

export function getFirstCaseStudy(): CaseStudy {
  const [first] = caseStudies;
  if (!first) throw new Error("src/data/caseStudies has no case studies to test against");
  return first;
}

export function getSampleRoutes(): string[] {
  return [...STATIC_ROUTES, getPostPath(getFirstPost())];
}
