import type { SVGProps } from "react";

/** The four-point star used as the site's bullet and separator. */
export const SPARK_PATH =
  "M12 0c.6 6.6 5.4 11.4 12 12-6.6.6-11.4 5.4-12 12-.6-6.6-5.4-11.4-12-12C6.6 11.4 11.4 6.6 12 0Z";

export function SparkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d={SPARK_PATH} />
    </svg>
  );
}
