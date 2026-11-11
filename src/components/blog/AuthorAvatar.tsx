import { wordmark } from "@/components/ui/wordmark";
import { cn } from "@/lib/cn";

/** The brand mark's colour bands, top to bottom, in its 200-unit square. */
const BANDS = [
  { y: 100, height: 36, className: "fill-bright-yellow" },
  { y: 136, height: 24, className: "fill-gold" },
  { y: 160, height: 18, className: "fill-orange" },
  { y: 178, height: 13, className: "fill-red" },
  { y: 191, height: 9, className: "fill-magenta" },
] as const;

/** Slits cut through the monogram where it crosses the first band. */
const SLITS = [
  { y: 116.5, height: 2.5 },
  { y: 123.5, height: 3 },
] as const;

const monogram = wordmark.letters.flatMap((letter) => ("mono" in letter ? [letter.mono] : []));

export function AuthorAvatar({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      aria-hidden="true"
      className={cn("size-8 shrink-0 rounded-full", className)}
    >
      <rect width="200" height="200" className="fill-manila-light" />
      {BANDS.map(({ y, height, className: fill }) => (
        <rect key={y} y={y} width="200" height={height} className={fill} />
      ))}
      <g transform="translate(33.1 58.5) scale(2.6)" className="fill-faded-black">
        {monogram.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      {SLITS.map(({ y, height }) => (
        <rect key={y} y={y} width="200" height={height} className="fill-bright-yellow" />
      ))}
    </svg>
  );
}
