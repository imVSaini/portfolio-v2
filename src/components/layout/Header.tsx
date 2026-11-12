"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AppearanceMenu } from "@/components/appearance/AppearanceMenu";
import { RollText } from "@/components/motion/RollText";
import { ScrollLink } from "@/components/scroll/ScrollLink";
import { Logo } from "@/components/ui/Logo";
import { socialIcons } from "@/components/ui/SocialIcons";
import { contact } from "@/data/contact";
import { nav, site } from "@/data/site";
import { cn } from "@/lib/cn";
import { getHomeHref } from "@/lib/nav";
import { useScroll } from "@/stores/scroll";

import { MobileMenu } from "./MobileMenu";
import { ScrollProgress } from "./ScrollProgress";

const NAV_LINK_CLASS_NAME =
  "group flex rounded-md px-3 py-2 font-display text-p4 font-medium tracking-wide uppercase";

export function Header() {
  const scrolled = useScroll((s) => s.scrolled);
  const pathname = usePathname();
  const onHome = pathname === "/";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color] duration-500 ease-out-expo",
        scrolled
          ? "border-line bg-manila-light/80 backdrop-blur-md dark:bg-faded-black/80"
          : "border-transparent",
      )}
    >
      <ScrollProgress />
      <div className="container-page flex h-(--header-h) items-center justify-between gap-6">
        {onHome ? (
          <ScrollLink
            href="#top"
            aria-label={`${site.name}, back to top`}
            className="group flex items-center rounded-md"
          >
            <Logo condense className="h-8 w-auto" />
          </ScrollLink>
        ) : (
          <Link
            href="/"
            aria-label={`${site.name}, home`}
            className="group flex items-center rounded-md"
          >
            <Logo condense className="h-8 w-auto" />
          </Link>
        )}

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-2">
            {nav.map((item) => (
              <li key={item.href}>
                {item.kind === "section" && onHome ? (
                  <ScrollLink href={item.href} className={NAV_LINK_CLASS_NAME}>
                    <RollText text={item.label} />
                  </ScrollLink>
                ) : (
                  <Link
                    href={item.kind === "section" ? getHomeHref(item.href) : item.href}
                    {...(item.href === pathname && { "aria-current": "page" })}
                    className={NAV_LINK_CLASS_NAME}
                  >
                    <RollText text={item.label} />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          {/* Icon row from md up; below that it lives in the menu. */}
          <div className="hidden md:flex">
            <AppearanceMenu />
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
          <MobileMenu className="lg:hidden" />
        </div>
      </div>
    </header>
  );
}
