import { cn } from "@/lib/cn";

/** Small index + title eyebrow that opens each section, e.g. "(02) Selected work". */
export function SectionLabel({
  index,
  children,
  className,
}: {
  index: string;
  children: string;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 font-display text-p4 font-medium text-muted uppercase",
        className,
      )}
    >
      <span className="text-accent">({index})</span>
      <span className="h-px w-8 bg-line-strong" aria-hidden="true" />
      {children}
    </p>
  );
}
