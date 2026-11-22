"use client";

import { useRef, type ComponentPropsWithoutRef } from "react";

import { gsap, MOTION_QUERY, useGSAP } from "@/lib/gsap";
import { whenIntroDone } from "@/stores";

type NotFoundMotionProps = ComponentPropsWithoutRef<"main">;

/**
 * The 404 page's main element: raises the digits out of their baseline, spins the seal in as the
 * zero, then fades up the copy.
 */
export function NotFoundMotion({ children, ...props }: NotFoundMotionProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERY, () => {
        const intro = gsap
          .timeline({ paused: true })
          .from(
            "[data-nf-digit]",
            { yPercent: 105, duration: 1.3, ease: "expo.out", stagger: 0.14 },
            0.15,
          )
          .from("[data-nf-seal]", { scale: 0, rotate: -140, duration: 1.4, ease: "expo.out" }, 0.3)
          .from(
            "[data-nf-fade]",
            { y: 24, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.07 },
            0.45,
          );
        return whenIntroDone(() => intro.play());
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <main ref={ref} {...props}>
      {children}
    </main>
  );
}
