"use client";

import { AppearanceMenu } from "@/components/appearance/AppearanceMenu";
import { RollText } from "@/components/motion/RollText";
import { ScrollLink } from "@/components/scroll/ScrollLink";
import { socialIcons } from "@/components/ui/SocialIcons";
import { cn } from "@/lib/cn";
import { contact } from "@/data/contact";
import { nav, site } from "@/data/site";
import { useScroll } from "@/stores/scroll";

import { MobileMenu } from "./MobileMenu";
import { ScrollProgress } from "./ScrollProgress";

export function Header() {
  const hidden = useScroll((s) => s.scrolled && s.direction === 1 && s.progress > 0.04);
  const scrolled = useScroll((s) => s.scrolled);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[translate,background-color,border-color] duration-500 ease-out-expo",
        hidden && "-translate-y-full",
        scrolled
          ? "border-b border-line bg-manila-light/80 backdrop-blur-md dark:bg-faded-black/80"
          : "border-b border-transparent",
      )}
    >
      <div className="container-page flex h-(--header-h) items-center justify-between gap-6">
        <ScrollLink
          href="#top"
          aria-label={`${site.name}, back to top`}
          className="group flex items-center gap-3"
        >
          <span className="grid size-9 place-items-center rounded-full bg-faded-black font-display text-p4 font-semibold tracking-normal text-manila-light dark:bg-manila-light dark:text-faded-black">
            <RollText text={site.monogram} />
          </span>
          <span className="font-display text-p3 font-medium whitespace-nowrap uppercase">
            <RollText text={site.name} />
          </span>
        </ScrollLink>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <ScrollLink
                  href={item.href}
                  className="relative rounded-md px-3 py-2 text-p3 font-medium corner-squircle intent:bg-hover"
                >
                  {item.label}
                </ScrollLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          {/* Same as videojs.org: edge-to-edge icon row from md up; below that it lives in the menu. */}
          <div className="hidden md:flex">
            <AppearanceMenu />
            {contact.links.map((link) => {
              const Icon = socialIcons[link.label];
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
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
      <ScrollProgress />
    </header>
  );
}
