"use client";

import { useEffect, useState } from "react";

import { ScrollLink } from "@/components/scroll/ScrollLink";
import { getHeadingId } from "@/lib/article";
import { cn } from "@/lib/cn";

/** A heading counts as current while it sits in the top third of the viewport. */
const ACTIVE_BAND = "0px 0px -66% 0px";

type ArticleTocProps = {
  headings: string[];
  className?: string;
};

export function ArticleToc({ headings, className }: ArticleTocProps) {
  const [active, setActive] = useState<string>();

  useEffect(() => {
    const targets = headings
      .map((heading) => document.getElementById(getHeadingId(heading)))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const entered = entries.find((entry) => entry.isIntersecting);
        if (entered) setActive(entered.target.id);
      },
      { rootMargin: ACTIVE_BAND },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  return (
    <nav aria-label="On this page" className={cn("flex flex-col gap-4", className)}>
      <p className="font-display text-p4 font-medium tracking-wide text-muted uppercase">
        On this page
      </p>
      <ol className="flex flex-col border-l border-line">
        {headings.map((heading, i) => {
          const id = getHeadingId(heading);
          return (
            <li key={id}>
              <ScrollLink
                href={`#${id}`}
                {...(active === id && { "aria-current": "location" })}
                className="-ml-px flex gap-3 border-l border-transparent py-1.5 pl-4 text-p3 text-muted transition-colors duration-300 aria-[current]:border-accent aria-[current]:text-faded-black dark:aria-[current]:text-manila-light intent:border-accent intent:text-faded-black dark:intent:text-manila-light"
              >
                <span aria-hidden="true" className="font-display text-p4 text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {heading}
              </ScrollLink>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
