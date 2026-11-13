import Link from "next/link";

import { CaseStudyCover } from "@/components/caseStudies/CaseStudyCover";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import type { CaseStudy } from "@/data/caseStudies";
import { getCaseStudyPath } from "@/lib/caseStudies";
import { cn } from "@/lib/cn";

const FACT_COUNT = 2;

type CaseStudyEntryProps = {
  study: CaseStudy;
  as?: "h2" | "h3";
  flipped?: boolean;
};

export function CaseStudyEntry({
  study,
  as: Heading = "h2",
  flipped = false,
}: CaseStudyEntryProps) {
  return (
    <article className="group @container relative grid gap-8 lg:grid-cols-12 lg:gap-12">
      <CaseStudyCover study={study} className={cn("lg:col-span-7", flipped && "lg:order-2")} />

      <div className="flex min-w-0 flex-col gap-6 lg:col-span-5 lg:self-center">
        <p className="flex items-center gap-2.5 font-display text-p4 font-medium tracking-wide uppercase">
          <span
            aria-hidden="true"
            className="size-1.5 bg-accent transition-transform duration-500 ease-out-expo motion-reduce:transition-none group-intent:rotate-45"
          />
          {study.category}
        </p>

        <Heading className="text-[clamp(1.5rem,9.4cqw,2.25rem)] leading-none wrap-break-word uppercase lg:text-[3.7cqw]">
          <Link
            href={getCaseStudyPath(study)}
            className="rounded-md transition-colors duration-300 after:absolute after:inset-0 group-intent:text-accent"
          >
            {study.title}
          </Link>
        </Heading>

        <p className="text-p1 text-muted">{study.headline}</p>

        <dl className="grid gap-x-8 gap-y-4 border-t border-line pt-6 sm:grid-cols-2">
          {study.facts.slice(0, FACT_COUNT).map((fact) => (
            <div key={fact.label} className="flex flex-col gap-1">
              <dt className="font-display text-p4 font-medium tracking-wide text-muted uppercase">
                {fact.label}
              </dt>
              <dd className="text-p2">{fact.value}</dd>
            </div>
          ))}
        </dl>

        <p
          aria-hidden="true"
          className="flex items-center gap-2 font-display text-p4 font-medium tracking-wide uppercase transition-colors duration-300 group-intent:text-accent"
        >
          Read the case study
          <ArrowIcon className="transition-transform duration-500 ease-out-expo motion-reduce:transition-none group-intent:translate-x-0.5 group-intent:-translate-y-0.5" />
        </p>
      </div>
    </article>
  );
}
