"use client";

import { AppearanceMenu } from "@/components/appearance/AppearanceMenu";
import { RollText } from "@/components/motion/RollText";
import { ScrollLink } from "@/components/scroll/ScrollLink";
import { socialIcons } from "@/components/ui/SocialIcons";
import { cn } from "@/lib/cn";
import { contact } from "@/data/contact";
import { nav, site } from "@/data/site";
import { useActiveSection } from "@/hooks/useActiveSection";
import { useScroll } from "@/stores/scroll";

import { MobileMenu } from "./MobileMenu";
import { ScrollProgress } from "./ScrollProgress";

const SECTIONS = nav.map((item) => item.href);

export function Header() {
  const scrolled = useScroll((s) => s.scrolled);
  const active = useActiveSection(SECTIONS);

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
          <ul className="flex items-center gap-2">
            {nav.map((item) => {
              const current = active === item.href;
              return (
                <li key={item.href}>
                  <ScrollLink
                    href={item.href}
                    aria-current={current ? "true" : undefined}
                    className="group flex rounded-md px-3 py-2 font-display text-p4 font-medium tracking-wide uppercase"
                  >
                    <span className="relative">
                      <RollText text={item.label} active={current} />
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute inset-x-0 -bottom-1 h-0.5 origin-left bg-accent transition-transform duration-500 ease-out-expo motion-reduce:transition-none",
                          !current && "scale-x-0",
                        )}
                      />
                    </span>
                  </ScrollLink>
                </li>
              );
            })}
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
          <MobileMenu active={active} className="lg:hidden" />
        </div>
      </div>
    </header>
  );
}
