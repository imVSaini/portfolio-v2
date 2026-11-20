"use client";

import { useRef, type ComponentPropsWithoutRef } from "react";

import { gsap, MOTION_QUERY, useGSAP } from "@/lib/gsap";
import { whenIntroDone } from "@/stores/intro";

type HeroMotionProps = ComponentPropsWithoutRef<"section">;

/**
 * The hero's section element: fades its `data-hero-*` pieces in after the intro, then sinks the
 * headline on scroll.
 */
export function HeroMotion({ children, ...props }: HeroMotionProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERY, () => {
        const intro = gsap
          .timeline({ paused: true })
          .from(
            "[data-hero-fade]",
            { y: 24, opacity: 0, duration: 1.2, ease: "expo.out", stagger: 0.08 },
            0.55,
          )
          .from(
            "[data-hero-badge]",
            { scale: 0.6, rotate: -90, opacity: 0, duration: 1.6, ease: "expo.out" },
            0.4,
          );
        const stopWaiting = whenIntroDone(() => intro.play());
        // The headline sinks and fades as the next section slides over it.
        gsap.to("[data-hero-title]", {
          yPercent: 18,
          opacity: 0.25,
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: true },
        });
        return stopWaiting;
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} {...props}>
      {children}
    </section>
  );
}
