import Link from "next/link";

import { RollText } from "@/components/motion/RollText";
import { Logo } from "@/components/ui/Logo";
import { site } from "@/data/site";

/** Slim header for pages outside the one-pager, whose section anchors only work on home. */
export function SubpageHeader() {
  return (
    <header className="container-page flex h-(--header-h) items-center justify-between gap-6">
      <Link
        href="/"
        aria-label={`${site.name}, home`}
        className="group flex items-center rounded-md"
      >
        <Logo className="h-8 w-auto" />
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
