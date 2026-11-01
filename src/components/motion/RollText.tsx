import type { CSSProperties } from "react";

import { cn } from "@/lib/cn";

/**
 * Per-character roll for links: on hover/keyboard focus of the nearest `group`, each glyph
 * slides up and an accent copy rolls in beneath it, staggered left to right. Pure CSS, so it
 * works in server components. Screen readers get the plain text once.
 */
export function RollText({
  text,
  className,
  stagger = 14,
  accent = true,
}: {
  text: string;
  className?: string;
  /** Delay between neighbouring characters, in ms. */
  stagger?: number;
  /** Roll in an accent-coloured copy; off keeps the current colour, e.g. on an accent fill. */
  accent?: boolean;
}) {
  const roll =
    "inline-block transition-transform duration-500 ease-out-expo group-hover:-translate-y-full group-focus-visible:-translate-y-full motion-reduce:transition-none";

  return (
    <span className={cn("relative inline-block", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-flex overflow-hidden pb-[0.06em]">
        {[...text].map((char, i) => {
          const delay: CSSProperties = { transitionDelay: `${i * stagger}ms` };
          return (
            <span key={i} className="relative inline-block whitespace-pre">
              <span className={roll} style={delay}>
                {char}
              </span>
              <span
                className={cn("absolute inset-x-0 top-full", accent && "text-accent", roll)}
                style={delay}
              >
                {char}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
