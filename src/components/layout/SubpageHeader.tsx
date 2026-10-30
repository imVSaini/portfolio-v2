import Link from "next/link";

import { RollText } from "@/components/motion/RollText";
import { site } from "@/data/site";

/** Slim header for pages outside the one-pager, whose section anchors only work on home. */
export function SubpageHeader() {
  return (
    <header className="container-page flex h-(--header-h) items-center justify-between gap-6">
      <Link href="/" aria-label={`${site.name}, home`} className="group flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-full bg-faded-black font-display text-p4 font-semibold text-manila-light dark:bg-manila-light dark:text-faded-black">
          <RollText text={site.monogram} />
        </span>
        <span className="font-display text-p3 font-medium whitespace-nowrap uppercase">
          <RollText text={site.name} />
        </span>
      </Link>
      <Link
        href="/"
        className="group inline-flex items-center gap-2 font-display text-p4 font-medium tracking-wide uppercase"
      >
        <span
          aria-hidden="true"
          className="transition-transform duration-300 group-hover:-translate-x-1"
        >
          ←
        </span>
        <RollText text="Back to home" />
      </Link>
    </header>
  );
}
