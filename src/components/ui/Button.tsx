import type { ReactNode } from "react";

import { ScrollLink } from "@/components/scroll/ScrollLink";
import { cn } from "@/lib/cn";

const base =
  "group/button relative inline-flex h-12 items-center gap-3 overflow-hidden rounded-full px-6 font-display text-p3 font-medium tracking-wide uppercase transition-colors duration-300 corner-squircle";

const variants = {
  solid:
    "bg-faded-black text-manila-light intent:bg-accent intent:text-faded-black dark:bg-manila-light dark:text-faded-black dark:intent:bg-accent",
  outline:
    "border border-line-strong text-faded-black intent:border-accent intent:text-accent dark:text-manila-light dark:intent:text-accent",
} as const;

type ButtonProps = {
  variant?: keyof typeof variants;
  children: ReactNode;
  className?: string;
} & ({ href: `#${string}`; external?: never } | { href: string; external: true });

export function Button({ variant = "solid", children, className, href, external }: ButtonProps) {
  const content = (
    <>
      <span className="relative">{children}</span>
      <span
        aria-hidden="true"
        className="relative inline-block transition-transform duration-300 ease-out-expo group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5"
      >
        {external ? "↗" : "→"}
      </span>
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={cn(base, variants[variant], className)}
      >
        {content}
      </a>
    );
  }

  return (
    <ScrollLink href={href as `#${string}`} className={cn(base, variants[variant], className)}>
      {content}
    </ScrollLink>
  );
}
