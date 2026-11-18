"use client";

import { Dialog } from "@base-ui/react/dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from "react";

import { AppearanceDrawer } from "@/components/appearance/AppearanceDrawer";
import { RollText } from "@/components/motion/RollText";
import { ScrollLink } from "@/components/scroll/ScrollLink";
import { Logo } from "@/components/ui/Logo";
import { socialIcons } from "@/components/ui/SocialIcons";
import { contact } from "@/data/contact";
import { nav, site } from "@/data/site";
import { cn } from "@/lib/cn";
import { getHomeHref } from "@/lib/nav";
import { scrollToAnchor } from "@/lib/scrollToAnchor";

const DESKTOP_NAV_QUERY = "(min-width: 64rem)";

const TOGGLE_CLASS_NAME =
  "flex h-11 cursor-pointer items-center gap-3 rounded-md px-2 font-display text-p4 font-medium tracking-wide uppercase corner-squircle";

const NAV_LINK_CLASS_NAME =
  "group block overflow-hidden font-display uppercase aria-[current=page]:text-accent";

const RISE_CLASS_NAME =
  "flex min-h-12 items-center text-h2 font-semibold transition-transform delay-(--delay) duration-900 ease-out-expo group-starting-style/menu:translate-y-full group-ending-style/menu:translate-y-full group-ending-style/menu:delay-0 group-ending-style/menu:duration-500 group-ending-style/menu:ease-wipe motion-reduce:transition-none";

const FADE_CLASS_NAME =
  "transition-[translate,opacity] delay-(--delay) duration-700 ease-out-expo group-starting-style/menu:translate-y-4 group-starting-style/menu:opacity-0 group-ending-style/menu:opacity-0 group-ending-style/menu:delay-0 group-ending-style/menu:duration-300 motion-reduce:transition-none";

const SWAP_CLASS_NAME =
  "[grid-area:1/1] transition-transform duration-700 ease-wipe group-ending-style/menu:duration-500 motion-reduce:transition-none";

const BAR_CLASS_NAME =
  "absolute inset-0 m-auto h-0.5 w-5 bg-current transition-[translate,rotate] delay-200 duration-500 ease-wipe group-starting-style/menu:rotate-0 group-ending-style/menu:rotate-0 group-ending-style/menu:delay-0 group-ending-style/menu:duration-400 motion-reduce:transition-none";

const STAGGER_START = 300;
const STAGGER_STEP = 60;

function delay(ms: number) {
  return { "--delay": `${ms}ms` } as CSSProperties;
}

function isPlainClick(event: ReactMouseEvent) {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

export function MobileMenu({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const onHome = pathname === "/";
  const pendingTarget = useRef<`#${string}` | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const desktop = window.matchMedia(DESKTOP_NAV_QUERY);
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, [open]);

  function closeThenScroll(event: ReactMouseEvent, target: `#${string}`) {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    pendingTarget.current = target;
    setOpen(false);
  }

  function closeThenNavigate() {
    pendingTarget.current = null;
    setOpen(false);
  }

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
      <Dialog.Trigger aria-label="Open menu" className={cn(TOGGLE_CLASS_NAME, className)}>
        <span aria-hidden="true" className="grid">
          <span className="[grid-area:1/1]">Menu</span>
          <span className="invisible [grid-area:1/1]">Close</span>
        </span>
        <span aria-hidden="true" className="relative h-2.5 w-5">
          <span className="absolute inset-x-0 top-0 h-0.5 bg-current" />
          <span className="absolute inset-x-0 bottom-0 h-0.5 bg-current" />
        </span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop data-lenis-prevent="" className="fixed inset-0 z-50" />
        <Dialog.Popup
          data-lenis-prevent=""
          initialFocus={closeRef}
          className="group/menu fixed inset-0 z-50 flex flex-col gap-4 overflow-y-auto overscroll-contain bg-manila-light px-(--page-gutter) pb-6 transition-[clip-path] duration-900 ease-wipe [--menu-origin:calc(100%-var(--page-gutter)-1.125rem)_calc(var(--header-h)/2)] [clip-path:circle(150%_at_var(--menu-origin))] motion-reduce:transition-none dark:bg-faded-black starting-style:[clip-path:circle(0px_at_var(--menu-origin))] ending-style:duration-700 ending-style:[clip-path:circle(0px_at_var(--menu-origin))] [@media(height>=47rem)]:gap-6 [@media(height>=51rem)]:gap-10"
        >
          <div className="sticky top-0 z-10 -mx-(--page-gutter) flex h-(--header-h) shrink-0 items-center justify-between gap-6 bg-manila-light px-(--page-gutter) dark:bg-faded-black">
            <Dialog.Title className="sr-only">Menu</Dialog.Title>
            {onHome ? (
              <ScrollLink
                href="#top"
                aria-label={`${site.name}, back to top`}
                onClick={(event) => closeThenScroll(event, "#top")}
                className="group flex items-center rounded-md"
              >
                <Logo mirror className="h-8 w-auto" />
              </ScrollLink>
            ) : (
              <Link
                href="/"
                aria-label={`${site.name}, home`}
                onNavigate={closeThenNavigate}
                className="group flex items-center rounded-md"
              >
                <Logo mirror className="h-8 w-auto" />
              </Link>
            )}
            <Dialog.Close ref={closeRef} aria-label="Close menu" className={TOGGLE_CLASS_NAME}>
              <span aria-hidden="true" className="grid overflow-hidden">
                <span
                  className={cn(
                    SWAP_CLASS_NAME,
                    "-translate-y-full group-starting-style/menu:translate-y-0 group-ending-style/menu:translate-y-0",
                  )}
                >
                  Menu
                </span>
                <span
                  className={cn(
                    SWAP_CLASS_NAME,
                    "group-starting-style/menu:translate-y-full group-ending-style/menu:translate-y-full",
                  )}
                >
                  Close
                </span>
              </span>
              <span aria-hidden="true" className="relative h-2.5 w-5">
                <span
                  className={cn(
                    BAR_CLASS_NAME,
                    "rotate-45 group-starting-style/menu:-translate-y-1 group-ending-style/menu:-translate-y-1",
                  )}
                />
                <span
                  className={cn(
                    BAR_CLASS_NAME,
                    "-rotate-45 group-starting-style/menu:translate-y-1 group-ending-style/menu:translate-y-1",
                  )}
                />
              </span>
            </Dialog.Close>
          </div>
          <nav aria-label="Mobile">
            <ul className="flex flex-col gap-2">
              {nav.map((item, i) => (
                <li key={item.href}>
                  {item.kind === "section" && onHome ? (
                    <ScrollLink
                      href={item.href}
                      onClick={(event) => closeThenScroll(event, item.href)}
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
                      onNavigate={closeThenNavigate}
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
          <div
            className={cn(
              "mt-auto flex flex-wrap items-center justify-between gap-x-4",
              FADE_CLASS_NAME,
            )}
            style={delay(STAGGER_START + nav.length * STAGGER_STEP)}
          >
            <a
              href={`mailto:${contact.email}`}
              className="inline-flex min-h-11 items-center text-p3 text-muted underline decoration-line-strong underline-offset-4 intent:text-accent"
            >
              {contact.email}
            </a>
            <div className="flex">
              <AppearanceDrawer />
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
