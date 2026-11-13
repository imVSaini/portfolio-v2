import type { SVGProps } from "react";

import { cn } from "@/lib/cn";

export function CloseIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      className={cn("inline-block size-6 shrink-0", className)}
      {...props}
    >
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  );
}
