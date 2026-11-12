import type { CaseStudyFact } from "@/data/caseStudies";
import { cn } from "@/lib/cn";

type CaseStudyFactsProps = {
  facts: CaseStudyFact[];
  className?: string;
};

export function CaseStudyFacts({ facts, className }: CaseStudyFactsProps) {
  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-x-8 gap-y-6 border-y border-line py-6 lg:grid-cols-4",
        className,
      )}
    >
      {facts.map((fact) => (
        <div key={fact.label} className="flex min-w-0 flex-col gap-1.5">
          <dt className="font-display text-p4 font-medium tracking-wide text-muted uppercase">
            {fact.label}
          </dt>
          <dd className="text-p2">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
