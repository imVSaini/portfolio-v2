import type { SVGProps } from "react";

import { cn } from "@/lib/cn";

const directions = {
  "up-right": { viewBox: "0 0 17 17", transform: undefined, size: "size-[0.75em]" },
  right: { viewBox: "-3 0 23 17", transform: "rotate(45 8.5 8.5)", size: "h-[0.75em] w-[1em]" },
} as const;

type ArrowIconProps = SVGProps<SVGSVGElement> & {
  direction?: keyof typeof directions;
};

export function ArrowIcon({ direction = "up-right", className, ...props }: ArrowIconProps) {
  const { viewBox, transform, size } = directions[direction];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      fill="none"
      aria-hidden="true"
      className={cn("inline-block shrink-0", size, className)}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.5 0h11.2a.7.7 0 0 1 .8.8V12a.7.7 0 1 1-1.5 0V2.6L1.3 16.3a.8.8 0 0 1-1.1-1L13.9 1.4H4.5a.8.8 0 0 1 0-1.5"
        fill="currentColor"
        {...(transform && { transform })}
      />
    </svg>
  );
}
