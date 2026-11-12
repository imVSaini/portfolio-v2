import Link from "next/link";

import { caseStudiesPage, type CaseStudy } from "@/data/caseStudies";

const crumbs = [
  { label: "Home", href: "/" },
  { label: caseStudiesPage.title, href: caseStudiesPage.path },
] as const;

export function CaseStudyBreadcrumbs({ study }: { study: CaseStudy }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 font-display text-p4 font-medium tracking-wide text-muted uppercase">
        {crumbs.map((crumb) => (
          <li key={crumb.href} className="flex items-center gap-2">
            <Link
              href={crumb.href}
              className="inline-flex min-h-6 items-center rounded-sm transition-colors duration-300 intent:text-accent"
            >
              {crumb.label}
            </Link>
            <span aria-hidden="true">/</span>
          </li>
        ))}
        <li className="text-faded-black dark:text-manila-light">{study.category}</li>
      </ol>
    </nav>
  );
}
