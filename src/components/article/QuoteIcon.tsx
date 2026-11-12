import type { SVGProps } from "react";

export function QuoteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 18.5v-7l2.800-6h3l-1.900 6H10v7Z" />
      <path d="M14 18.5v-7l2.800-6h3l-1.900 6H21v7Z" />
    </svg>
  );
}
