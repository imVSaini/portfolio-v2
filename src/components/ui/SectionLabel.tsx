import { cn } from "@/lib/cn";

/** Small eyebrow that opens each section, e.g. "— Selected work". */
export function SectionLabel({ children, className }: { children: string; className?: string }) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 font-display text-p4 font-medium text-muted uppercase",
        className,
      )}
    >
      <span className="h-px w-8 bg-accent" aria-hidden="true" />
      {children}
    </p>
  );
}
