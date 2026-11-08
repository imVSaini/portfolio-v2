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
} & ({ href: `#${string}`; external?: never } | { href: string; external: true });

export function Button({ variant = "solid", children, className, href, external }: ButtonProps) {
  const content = (
    <>
      <RollText text={children} accent={false} />
      <ArrowSwap direction={external ? "up-right" : "right"} />
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
