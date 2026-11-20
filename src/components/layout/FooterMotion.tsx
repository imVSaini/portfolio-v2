"use client";

import { useRef, type ComponentPropsWithoutRef } from "react";

import { gsap, MOTION_QUERY, useGSAP } from "@/lib/gsap";

/** Letters lift towards a fine pointer; touch and reduced motion skip it. */
const HOVER_QUERY =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
/** How far the letter under the pointer lifts, as a percentage of its height. */
const LIFT = 14;
/** How many letter widths either side of the pointer still feel the lift. */
const REACH = 2.2;

type FooterMotionProps = ComponentPropsWithoutRef<"footer">;

/**
 * Scrolling in draws the rule, raises the wordmark letter by letter, then drops the accent dot and
 * spins the back-to-top seal in. A pointer over the wordmark lifts the letters nearest to it.
 */
export function FooterMotion({ children, ...props }: FooterMotionProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const footer = ref.current;
      if (!footer) return;
      const mm = gsap.matchMedia();

      // Scrubbed across the footer's own scroll-in, which ends at the page bottom. The wordmark is
      // only fully on screen near the end, so the letters rise across most of the range.
      mm.add(MOTION_QUERY, () => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: footer,
              start: "top bottom",
              end: "bottom bottom",
              scrub: 0.8,
            },
          })
          .from("[data-footer-rule]", { scaleX: 0, ease: "none", duration: 0.6 }, 0)
          .from(
            "[data-footer-glyph]",
            { yPercent: 105, ease: "power2.out", duration: 0.7, stagger: 0.05 },
            0.1,
          )
          .from(
            "[data-footer-dot]",
            { scale: 0, transformOrigin: "50% 80%", ease: "back.out(3)", duration: 0.25 },
            1,
          )
          .from(
            "[data-footer-seal]",
            { scale: 0, rotate: -120, ease: "back.out(2)", duration: 0.25 },
            1,
          )
          .from(
            "[data-footer-meta]",
            { autoAlpha: 0, y: 16, ease: "power2.out", duration: 0.25 },
            1,
          );
      });

      mm.add(HOVER_QUERY, () => {
        const wordmark = footer.querySelector<HTMLElement>("[data-footer-wordmark]");
        if (!wordmark) return;
        const masks = gsap.utils.toArray<HTMLElement>("[data-footer-mask]", wordmark);
        const lifts = masks.map((mask) =>
          gsap.quickTo(mask, "yPercent", { duration: 0.7, ease: "expo.out" }),
        );
        let centres: { x: number; width: number }[] = [];

        const measure = () => {
          centres = masks.map((mask) => {
            const box = mask.getBoundingClientRect();
            return { x: box.left + box.width / 2, width: box.width };
          });
        };
        const onMove = (event: PointerEvent) => {
          centres.forEach(({ x, width }, i) => {
            const distance = Math.abs(event.clientX - x) / width;
            lifts[i]?.(-LIFT * Math.max(0, 1 - distance / REACH));
          });
        };
        const onLeave = () => lifts.forEach((lift) => lift(0));

        wordmark.addEventListener("pointerenter", measure);
        wordmark.addEventListener("pointermove", onMove);
        wordmark.addEventListener("pointerleave", onLeave);
        return () => {
          wordmark.removeEventListener("pointerenter", measure);
          wordmark.removeEventListener("pointermove", onMove);
          wordmark.removeEventListener("pointerleave", onLeave);
        };
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <footer ref={ref} {...props}>
      {children}
    </footer>
  );
}
