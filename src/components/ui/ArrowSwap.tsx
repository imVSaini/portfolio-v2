import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { cn } from "@/lib/cn";

const swap =
  "grid place-items-center transition-transform duration-500 ease-out-expo motion-reduce:transition-none";

const directions = {
  right: {
    out: "group-intent:translate-x-full",
    in: "-translate-x-full group-intent:translate-x-0",
  },
  "up-right": {
    out: "group-intent:translate-x-full group-intent:-translate-y-full",
    in: "-translate-x-full translate-y-full group-intent:translate-0",
  },
} as const;

type ArrowSwapProps = {
  direction?: keyof typeof directions;
  className?: string;
};

export function ArrowSwap({ direction = "up-right", className }: ArrowSwapProps) {
  const { out, in: enter } = directions[direction];

  return (
    <span aria-hidden="true" className={cn("relative inline-block overflow-hidden", className)}>
      <span className={cn(swap, out)}>
        <ArrowIcon direction={direction} />
      </span>
      <span className={cn("absolute inset-0", swap, enter)}>
        <ArrowIcon direction={direction} />
      </span>
    </span>
  );
}
