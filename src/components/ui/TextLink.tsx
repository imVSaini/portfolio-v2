import type { AnchorHTMLAttributes } from "react";

import { ScrollLink } from "@/components/scroll/ScrollLink";
import { ArrowSwap } from "@/components/ui/ArrowSwap";
import { cn } from "@/lib/cn";

const base =
  "group inline-flex min-h-11 items-center gap-2 font-display text-p3 font-medium uppercase underline decoration-line-strong underline-offset-6 transition-colors duration-300 intent:text-accent intent:decoration-accent";

/** Spreads the hit area over the nearest positioned `group` and rings it on keyboard focus. */
const stretch =
  "after:absolute after:inset-0 after:z-1 after:rounded-2xl group-intent:text-accent group-intent:decoration-accent focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-gold";

type TextLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "children" | "target" | "rel" | "aria-label"
> & {
  children: string;
  /** Make the whole surrounding card (a `relative group`) the link, as in a block-link card. */
  stretched?: boolean;
} & (
    | { href: `#${string}`; external?: never; label?: never }
    | {
        href: string;
        external: true;
        /** Fuller name for screen readers when the visible text is vague, e.g. "Visit Work OS live". */
        label?: string;
      }
  );

export function TextLink({
  children,
  className,
  href,
  external,
  label,
  stretched = false,
  ...props
}: TextLinkProps) {
  const classes = cn(base, stretched && stretch, className);
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
        className={classes}
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <ScrollLink href={href as `#${string}`} className={classes} {...props}>
      {content}
    </ScrollLink>
  );
}
