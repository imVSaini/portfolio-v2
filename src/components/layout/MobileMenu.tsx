"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useRef, useState } from "react";

import { AppearanceControls } from "@/components/appearance/AppearanceControls";
import { RollText } from "@/components/motion/RollText";
import { ScrollLink } from "@/components/scroll/ScrollLink";
import { socialIcons } from "@/components/ui/SocialIcons";
import { cn } from "@/lib/cn";
import { contact } from "@/data/contact";
import { nav } from "@/data/site";
import { useScroll } from "@/stores/scroll";

export function MobileMenu({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  // The dialog locks page scroll while open, so travel only after it has fully closed.
  const pendingTarget = useRef<string | null>(null);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={setOpen}
      onOpenChangeComplete={(isOpen) => {
        if (isOpen || !pendingTarget.current) return;
        useScroll.getState().scrollTo(pendingTarget.current);
        pendingTarget.current = null;
      }}
    >
      <Dialog.Trigger
        aria-label="Open menu"
        className={cn(
          "flex size-10 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md corner-squircle intent:bg-hover",
          className,
        )}
      >
        <span className="h-0.5 w-5 bg-current" />
        <span className="h-0.5 w-5 bg-current" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-faded-black/40 backdrop-blur-sm transition-opacity duration-300 starting-style:opacity-0 ending-style:opacity-0" />
        <Dialog.Popup className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col gap-10 overflow-y-auto bg-manila-light p-6 transition-transform duration-500 ease-out-expo dark:bg-faded-black starting-style:translate-x-full ending-style:translate-x-full">
          <div className="flex items-center justify-between">
            <Dialog.Title className="font-display text-p4 text-muted uppercase">Menu</Dialog.Title>
            <Dialog.Close
              aria-label="Close menu"
              className="flex size-10 cursor-pointer items-center justify-center rounded-md text-h4 corner-squircle intent:bg-hover"
            >
              ×
            </Dialog.Close>
          </div>
          <nav aria-label="Mobile">
            <ul className="flex flex-col gap-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <ScrollLink
                    href={item.href}
                    onClick={(event) => {
                      event.preventDefault();
                      pendingTarget.current = item.href;
                      setOpen(false);
                    }}
                    className="group block py-1 font-display text-h3 font-semibold uppercase"
                  >
                    <RollText text={item.label} />
                  </ScrollLink>
                </li>
              ))}
            </ul>
          </nav>
          <AppearanceControls />
          <div className="mt-auto flex items-center justify-between gap-4">
            <a
              href={`mailto:${contact.email}`}
              className="text-p3 text-muted underline decoration-line-strong underline-offset-4 intent:text-accent"
            >
              {contact.email}
            </a>
            <div className="flex">
              {contact.links.map((link) => {
                const Icon = socialIcons[link.label];
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${link.label} (opens in a new tab)`}
                    className="flex items-center rounded-md px-2.5 py-2 corner-squircle intent:bg-hover"
                  >
                    <Icon className="size-6" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
