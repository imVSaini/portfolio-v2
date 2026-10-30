import { useId, type ReactNode } from "react";

import { cn } from "@/lib/cn";

type SealProps = {
  /** Set around the ring; repeat it so it fills the circle. */
  text: string;
  /** Sits on the accent disc in the middle. */
  children: ReactNode;
  className?: string;
  discClassName?: string;
};

/**
 * Text set on a slowly spinning ring around an accent disc. Decorative, so hidden from AT.
 * Clipped to the circle: the spinning square's corners would otherwise widen narrow pages.
 */
export function Seal({ text, children, className, discClassName }: SealProps) {
  const pathId = useId();

  return (
    <span
      aria-hidden="true"
      className={cn("relative block overflow-hidden rounded-full", className)}
    >
      <svg viewBox="0 0 200 200" className="size-full animate-spin-slow motion-reduce:animate-none">
        <defs>
          <path id={pathId} d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <text className="fill-current font-display text-[15px] font-medium tracking-[0.2em] uppercase">
          <textPath href={`#${pathId}`} textLength="488" lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </svg>
      <span
        className={cn(
          "absolute inset-0 m-auto grid size-14 place-items-center rounded-full bg-accent font-display text-h4 text-faded-black",
          discClassName,
        )}
      >
        {children}
      </span>
    </span>
  );
}
