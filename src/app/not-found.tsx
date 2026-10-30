import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/components/layout/Footer";
import { SubpageHeader } from "@/components/layout/SubpageHeader";
import { RevealText } from "@/components/motion/RevealText";
import { RollText } from "@/components/motion/RollText";
import { SectionLabel } from "@/components/ui/SectionLabel";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <>
      <SubpageHeader />

      <main
        id="main"
        className="container-page flex min-h-[70svh] flex-col justify-center gap-8 py-28"
      >
        <SectionLabel>Error 404</SectionLabel>
        <RevealText as="h1" on="load" className="text-h1 uppercase">
          Nothing{" "}
          <span className="text-stroke-faded-black dark:text-stroke-manila-light">here.</span>
        </RevealText>
        <p className="max-w-xl text-p1 text-muted">
          This page doesn’t exist or has moved. The work, the experience and a way to reach me are
          all on the home page.
        </p>
        <Link
          href="/"
          className="group inline-flex w-fit items-center gap-3 font-display text-p1 font-medium uppercase"
        >
          <span
            aria-hidden="true"
            className="text-accent transition-transform duration-300 group-hover:-translate-x-1"
          >
            ←
          </span>
          <RollText text="Back to home" />
        </Link>
      </main>

      <Footer />
    </>
  );
}
