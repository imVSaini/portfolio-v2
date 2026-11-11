import type { ReactNode } from "react";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { OverscrollReveal } from "@/components/layout/OverscrollReveal";
import { SmoothScroll } from "@/components/scroll/SmoothScroll";

/** The header, footer and scroll behaviour every page shares, around the page's `main`. */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <OverscrollReveal>
        {children}
        <Footer />
      </OverscrollReveal>
      {/* Last, so Locomotive starts only after the page it decorates (is-inview) has hydrated. */}
      <SmoothScroll />
    </>
  );
}
