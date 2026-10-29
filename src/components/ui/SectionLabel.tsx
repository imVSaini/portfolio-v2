import { cn } from "@/lib/cn";

/**
 * Compact pill that sits directly on top of a section heading — same family as the hero's
 * role badge. The outline follows the text colour, so it also works on the dark Contact band.
 */
export function SectionLabel({ children, className }: { children: string; className?: string }) {
  return (
    <p
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-full border border-current/20 px-3.5 py-1.5 font-display text-p4 font-medium tracking-wide text-muted uppercase",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
      {children}
    </p>
  );
}
