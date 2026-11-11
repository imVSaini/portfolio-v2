import { useId, type ReactNode } from "react";

import { SPARK_PATH } from "@/components/ui/SparkIcon";
import { cn } from "@/lib/cn";

/** Radius of the ring the text runs along, in viewBox units. */
const RADIUS = 78;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** Arc length each star separator takes up. */
const GAP = 22;
/** Star size, in viewBox units. */
const SPARK_SIZE = 9;
/** Lifts the stars off the baseline to sit level with the capitals. */
const SPARK_LIFT = 5.5;

type SealProps = {
  /** Phrases set around the ring, each followed by a star; repeat them so they fill the circle. */
  items: readonly string[];
  /** Sits on the accent disc in the middle. */
  children: ReactNode;
  className?: string;
  discClassName?: string;
};

function layout(items: readonly string[]) {
  const chars = items.reduce((sum, item) => sum + item.length, 0);
  const perChar = (CIRCUMFERENCE - items.length * GAP) / chars;
  let cursor = 0;

  return items.map((item) => {
    const start = cursor;
    const length = item.length * perChar;
    cursor += length + GAP;

    // The path starts at 9 o'clock and runs clockwise.
    const angle = Math.PI + (start + length + GAP / 2) / RADIUS;
    const r = RADIUS + SPARK_LIFT;
    const x = 100 + r * Math.cos(angle);
    const y = 100 + r * Math.sin(angle);
    const rotate = (angle * 180) / Math.PI + 90;

    return { item, start, length, spark: { x, y, rotate } };
  });
}

/**
 * Text set on a slowly spinning ring around an accent disc. Decorative, so hidden from AT.
 * Clipped to the circle: the spinning square's corners would otherwise widen narrow pages.
 */
export function Seal({ items, children, className, discClassName }: SealProps) {
  const pathId = useId();
  const placed = layout(items);

  return (
    <span
      aria-hidden="true"
      className={cn("relative block overflow-hidden rounded-full", className)}
    >
      <svg viewBox="0 0 200 200" className="size-full animate-spin-slow motion-reduce:animate-none">
        <defs>
          <path
            id={pathId}
            d={`M100,100 m-${RADIUS},0 a${RADIUS},${RADIUS} 0 1,1 ${RADIUS * 2},0 a${RADIUS},${RADIUS} 0 1,1 -${RADIUS * 2},0`}
          />
        </defs>
        <text className="fill-current font-display text-[15px] font-medium tracking-[0.2em] uppercase">
          {placed.map(({ item, start, length }, i) => (
            <textPath
              key={i}
              href={`#${pathId}`}
              startOffset={start}
              textLength={length}
              lengthAdjust="spacing"
            >
              {item}
            </textPath>
          ))}
        </text>
        {placed.map(({ spark: { x, y, rotate } }, i) => (
          <path
            key={i}
            d={SPARK_PATH}
            className="fill-current"
            transform={`translate(${x} ${y}) rotate(${rotate}) scale(${SPARK_SIZE / 24}) translate(-12 -12)`}
          />
        ))}
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
