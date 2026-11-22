import type { Route } from "next";
import Link from "next/link";

import { RollText } from "@/components/motion/RollText";
import { ScrollLink } from "@/components/scroll/ScrollLink";
import { ArrowSwap } from "@/components/ui/ArrowSwap";
import { cn } from "@/lib/cn";

const base =
  "group relative inline-flex h-12 items-center gap-3 overflow-hidden rounded-full px-6 font-display text-p3 font-medium tracking-wide uppercase transition-[background-color,border-color,color,scale] duration-300 ease-out-expo corner-squircle active:scale-97 motion-reduce:transition-colors";

const variants = {
  solid:
    "bg-faded-black text-manila-light intent:bg-accent intent:text-faded-black dark:bg-manila-light dark:text-faded-black dark:intent:bg-accent",
  outline:
    "border border-line-strong text-faded-black intent:border-accent intent:bg-accent dark:text-manila-light dark:intent:text-faded-black",
} as const;

type ButtonProps = {
  variant?: keyof typeof variants;
  children: string;
  className?: string;
} & (
  | { href: `#${string}`; external?: never; route?: never }
  | { href: Route; route: true; external?: never }
  | { href: string; external: true; route?: never }
);

export function Button({ variant = "solid", children, className, ...link }: ButtonProps) {
  const classes = cn(base, variants[variant], className);
  const content = (
    <>
      <RollText text={children} accent={false} />
      <ArrowSwap direction={link.external ? "up-right" : "right"} />
    </>
  );

  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noreferrer" className={classes}>
        {content}
      </a>
    );
  }

  if (link.route) {
    return (
      <Link href={link.href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <ScrollLink href={link.href} className={classes}>
      {content}
    </ScrollLink>
  );
}
