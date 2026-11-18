"use client";

import { Drawer } from "@base-ui/react/drawer";

import { cn } from "@/lib/cn";

import { AppearanceControls } from "./AppearanceControls";
import { BrushIcon } from "./icons";

export function AppearanceDrawer({ className }: { className?: string }) {
  return (
    <Drawer.Root>
      <Drawer.Trigger
        aria-label="Appearance"
        className={cn(
          "flex size-11 cursor-pointer items-center justify-center rounded-md corner-squircle data-popup-open:bg-hover intent:bg-hover",
          className,
        )}
      >
        <BrushIcon className="size-6" aria-hidden="true" />
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop
          forceRender
          data-lenis-prevent=""
          className="fixed inset-0 z-60 bg-black/32 opacity-[calc(1-var(--drawer-swipe-progress,0))] transition-opacity duration-500 ease-out-expo data-swiping:duration-0 motion-reduce:transition-none starting-style:opacity-0 ending-style:opacity-0 ending-style:duration-300"
        />
        <Drawer.Viewport
          data-lenis-prevent=""
          className="fixed inset-0 z-60 flex items-end justify-center"
        >
          <Drawer.Popup className="flex max-h-[85svh] w-full max-w-xl translate-y-(--drawer-swipe-movement-y) flex-col gap-4 overflow-y-auto overscroll-contain rounded-t-2xl bg-surface-raised px-(--page-gutter) pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-lg ring-1 ring-black/10 transition-transform duration-500 ease-out-expo corner-squircle data-swiping:duration-0 motion-reduce:transition-none dark:bg-soot dark:ring-white/10 starting-style:translate-y-full ending-style:translate-y-full ending-style:duration-300 ending-style:ease-wipe">
            <span
              aria-hidden="true"
              className="mx-auto h-1 w-10 shrink-0 rounded-full bg-line-strong"
            />
            <Drawer.Title className="font-display text-p3 font-medium tracking-wide uppercase">
              Appearance
            </Drawer.Title>
            <AppearanceControls />
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
