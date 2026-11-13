"use client";

import { Dialog } from "@base-ui/react/dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import { AppearanceControls } from "@/components/appearance/AppearanceControls";
import { RollText } from "@/components/motion/RollText";
import { ScrollLink } from "@/components/scroll/ScrollLink";
import { socialIcons } from "@/components/ui/SocialIcons";
import { contact } from "@/data/contact";
import { nav } from "@/data/site";
import { cn } from "@/lib/cn";
import { getHomeHref } from "@/lib/nav";
import { scrollToAnchor } from "@/lib/scrollToAnchor";

const DESKTOP_NAV_QUERY = "(min-width: 64rem)";

const NAV_LINK_CLASS_NAME =
  "group block overflow-hidden font-display text-h3 font-semibold uppercase";

const RISE_CLASS_NAME =
  "flex min-h-11 items-center py-1 transition-transform delay-(--delay) duration-700 ease-out-expo group-starting-style/menu:translate-y-full group-ending-style/menu:-translate-y-full group-ending-style/menu:delay-0 group-ending-style/menu:duration-300 motion-reduce:transition-none";

const FADE_CLASS_NAME =
  "transition-[translate,opacity] delay-(--delay) duration-700 ease-out-expo group-starting-style/menu:translate-y-4 group-starting-style/menu:opacity-0 group-ending-style/menu:opacity-0 group-ending-style/menu:delay-0 group-ending-style/menu:duration-300 motion-reduce:transition-none";

const BAR_CLASS_NAME =
  "absolute inset-0 m-auto h-0.5 w-5 bg-current transition-[translate,rotate] delay-150 duration-500 ease-out-expo group-starting-style/menu:rotate-0 group-ending-style/menu:rotate-0 group-ending-style/menu:delay-0 group-ending-style/menu:duration-300 motion-reduce:transition-none";

const STAGGER_START = 200;
const STAGGER_STEP = 50;

function delay(ms: number) {
  return { "--delay": `${ms}ms` } as CSSProperties;
}

export function MobileMenu({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const onHome = pathname === "/";
  // The dialog locks page scroll while open, so travel only after it has fully closed.
  const pendingTarget = useRef<`#${string}` | null>(null);

  useEffect(() => {
    if (!open) return;
    const desktop = window.matchMedia(DESKTOP_NAV_QUERY);
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, [open]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={setOpen}
      onOpenChangeComplete={(isOpen) => {
        if (isOpen || !pendingTarget.current) return;
        const target = pendingTarget.current;
        scrollToAnchor(target);
        history.replaceState(null, "", target === "#top" ? location.pathname : target);
        pendingTarget.current = null;
      }}
    >
      <Dialog.Trigger
        aria-label="Open menu"
        className={cn(
          "flex size-11 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md corner-squircle intent:bg-hover",
          className,
        )}
      >
        <span className="h-0.5 w-5 bg-current" />
        <span className="h-0.5 w-5 bg-current" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop
          data-lenis-prevent=""
          className="fixed inset-0 z-50 bg-faded-black/40 backdrop-blur-sm transition-opacity duration-700 ease-out-expo motion-reduce:transition-none starting-style:opacity-0 ending-style:opacity-0 ending-style:duration-500"
        />
        <Dialog.Popup
          data-lenis-prevent=""
          className="group/menu fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col gap-10 overflow-y-auto overscroll-contain bg-manila-light px-(--page-gutter) pb-6 transition-[clip-path] duration-700 ease-out-expo [clip-path:inset(0)] motion-reduce:transition-none dark:bg-faded-black starting-style:[clip-path:inset(0_0_0_100%)] ending-style:duration-500 ending-style:[clip-path:inset(0_0_0_100%)]"
        >
          <div className="flex h-(--header-h) shrink-0 items-center justify-between">
            <Dialog.Title
              className={cn("font-display text-p4 text-muted uppercase", FADE_CLASS_NAME)}
              style={delay(STAGGER_START - STAGGER_STEP)}
            >
              Menu
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close menu"
              className="relative size-11 cursor-pointer rounded-md corner-squircle intent:bg-hover"
            >
              <span
                aria-hidden="true"
                className={cn(
                  BAR_CLASS_NAME,
                  "rotate-45 group-starting-style/menu:-translate-y-1 group-ending-style/menu:-translate-y-1",
                )}
              />
              <span
                aria-hidden="true"
                className={cn(
                  BAR_CLASS_NAME,
                  "-rotate-45 group-starting-style/menu:translate-y-1 group-ending-style/menu:translate-y-1",
                )}
              />
            </Dialog.Close>
          </div>
          <nav aria-label="Mobile">
            <ul className="flex flex-col gap-1">
              {nav.map((item, i) => (
                <li key={item.href}>
                  {item.kind === "section" && onHome ? (
                    <ScrollLink
                      href={item.href}
                      onClick={(event) => {
                        if (
                          event.defaultPrevented ||
                          event.button !== 0 ||
                          event.metaKey ||
                          event.ctrlKey ||
                          event.shiftKey ||
                          event.altKey
                        ) {
                          return;
                        }
                        event.preventDefault();
                        pendingTarget.current = item.href;
                        setOpen(false);
                      }}
                      className={NAV_LINK_CLASS_NAME}
                    >
                      <span
                        className={RISE_CLASS_NAME}
                        style={delay(STAGGER_START + i * STAGGER_STEP)}
                      >
                        <RollText text={item.label} />
                      </span>
                    </ScrollLink>
                  ) : (
                    <Link
                      href={item.kind === "section" ? getHomeHref(item.href) : item.href}
                      {...(item.href === pathname && { "aria-current": "page" })}
                      onNavigate={() => {
                        pendingTarget.current = null;
                        setOpen(false);
                      }}
                      className={NAV_LINK_CLASS_NAME}
                    >
                      <span
                        className={RISE_CLASS_NAME}
                        style={delay(STAGGER_START + i * STAGGER_STEP)}
                      >
                        <RollText text={item.label} />
                      </span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <div className={FADE_CLASS_NAME} style={delay(STAGGER_START + nav.length * STAGGER_STEP)}>
            <AppearanceControls />
          </div>
          <div
            className={cn("mt-auto flex items-center justify-between gap-4", FADE_CLASS_NAME)}
            style={delay(STAGGER_START + (nav.length + 1) * STAGGER_STEP)}
          >
            <a
              href={`mailto:${contact.email}`}
              className="inline-flex min-h-11 items-center text-p3 text-muted underline decoration-line-strong underline-offset-4 intent:text-accent"
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
                    className="flex size-11 items-center justify-center rounded-md corner-squircle intent:bg-hover"
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
