"use client";

import { Popover } from "@base-ui/react/popover";

import { cn } from "@/lib/cn";

import { AppearanceControls } from "./AppearanceControls";
import { BrushIcon } from "./icons";

export function AppearanceMenu({ className }: { className?: string }) {
  return (
    <Popover.Root modal={false}>
      <Popover.Trigger
        aria-label="Appearance"
        className={cn(
          "flex size-10 cursor-pointer items-center justify-center rounded-md corner-squircle data-popup-open:bg-hover intent:bg-hover",
          className,
        )}
      >
        <BrushIcon className="size-6" aria-hidden="true" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="end" sideOffset={8} className="z-40">
          <Popover.Popup
            className={cn(
              "w-88 max-w-[calc(100vw-2rem)] origin-(--transform-origin) rounded-lg bg-surface-raised p-4 shadow-lg ring-1 ring-black/10 corner-squircle dark:bg-soot dark:ring-white/10",
              "transition duration-150 ease-out starting-style:scale-95 starting-style:opacity-0 ending-style:scale-95 ending-style:opacity-0 ending-style:duration-100",
              "motion-reduce:transition-none",
            )}
          >
            <AppearanceControls />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
