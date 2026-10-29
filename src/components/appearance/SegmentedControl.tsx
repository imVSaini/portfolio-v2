"use client";

import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  icon?: ReactNode;
};

type SegmentedControlProps<T extends string> = {
  /** `null` while pending — no segment is shown as selected. */
  value: T | null;
  onChange: (value: T) => void;
  options: readonly SegmentedOption<T>[];
  "aria-label": string;
  disabled?: boolean;
  pending?: boolean;
  className?: string;
};

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  "aria-label": ariaLabel,
  disabled = false,
  pending = false,
  className,
}: SegmentedControlProps<T>) {
  const inactive = disabled || pending;

  return (
    <ToggleGroup<T>
      value={value ? [value] : []}
      onValueChange={(next) => {
        const [first] = next;
        if (first) onChange(first);
      }}
      disabled={inactive}
      aria-label={ariaLabel}
      className={cn(
        "grid w-full auto-cols-fr grid-flow-col gap-1 rounded-lg border border-line bg-surface p-1 corner-squircle",
        inactive && "opacity-60",
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Toggle
            key={option.value}
            value={option.value}
            aria-label={option.label}
            className={cn(
              "flex min-w-0 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-p3/tight whitespace-nowrap select-none corner-squircle",
              pending ? "cursor-wait" : disabled ? "cursor-not-allowed" : "cursor-pointer",
              selected
                ? "bg-surface-raised font-semibold text-faded-black shadow-xs ring-1 ring-line dark:text-manila-light"
                : "text-muted intent:text-faded-black dark:intent:text-manila-light",
            )}
          >
            {option.icon && (
              <span
                aria-hidden="true"
                className={cn(
                  "inline-flex size-4 shrink-0 items-center justify-center",
                  !selected && "opacity-70",
                )}
              >
                {option.icon}
              </span>
            )}
            <span className="truncate">{option.label}</span>
          </Toggle>
        );
      })}
    </ToggleGroup>
  );
}
