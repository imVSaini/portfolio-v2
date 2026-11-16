import type { AnchorHTMLAttributes } from "react";

import { ScrollLink } from "@/components/scroll/ScrollLink";
import { ArrowSwap } from "@/components/ui/ArrowSwap";
import { cn } from "@/lib/cn";

const base =
  "group inline-flex min-h-11 items-center gap-2 font-display text-p3 font-medium uppercase underline decoration-line-strong underline-offset-6 transition-colors duration-300 intent:text-accent intent:decoration-accent";

type TextLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "children" | "target" | "rel" | "aria-label"
> & {
  children: string;
} & (
    | { href: `#${string}`; external?: never; label?: never }
    | {
        href: string;
        external: true;
        /** Fuller name for screen readers when the visible text is vague, e.g. "Visit Work OS live". */
        label?: string;
      }
  );

export function TextLink({ children, className, href, external, label, ...props }: TextLinkProps) {
  const content = (
    <>
      {children} <ArrowSwap direction={external ? "up-right" : "right"} />
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label={`${label ?? children} (opens in a new tab)`}
        className={cn(base, className)}
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <ScrollLink href={href as `#${string}`} className={cn(base, className)} {...props}>
      {content}
    </ScrollLink>
  );
}
