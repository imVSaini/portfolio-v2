import type { CaseStudyMetric } from "@/data/caseStudies";
import { cn } from "@/lib/cn";

type CaseStudyMetricsProps = {
  metrics: CaseStudyMetric[];
  className?: string;
};

export function CaseStudyMetrics({ metrics, className }: CaseStudyMetricsProps) {
  return (
    <dl className={cn("grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4", className)}>
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="flex min-w-0 flex-col-reverse justify-end gap-3 border-t border-line pt-5"
        >
          <dt className="max-w-56 text-p3 text-muted">{metric.label}</dt>
          <dd className="font-display text-h2 font-semibold tabular-nums">{metric.value}</dd>
        </div>
      ))}
    </dl>
  );
}
