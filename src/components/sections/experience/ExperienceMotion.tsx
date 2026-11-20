"use client";

import { useRef, type ComponentPropsWithoutRef } from "react";

import { gsap, MOTION_QUERY, useGSAP } from "@/lib/gsap";

type ExperienceMotionProps = ComponentPropsWithoutRef<"section">;

/**
 * The experience section element: draws the timeline spine and lifts each role in as it
 * arrives.
 */
export function ExperienceMotion({ children, ...props }: ExperienceMotionProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERY, () => {
        gsap.fromTo(
          "[data-xp-line]",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: "[data-xp-list]",
              start: "top 70%",
              end: "bottom 70%",
              scrub: true,
            },
          },
        );

        gsap.utils.toArray<HTMLElement>("[data-xp-role]").forEach((role) => {
          gsap.from(role.querySelectorAll("[data-xp-item]"), {
            y: 32,
            opacity: 0,
            duration: 0.9,
            ease: "expo.out",
            stagger: 0.06,
            scrollTrigger: { trigger: role, start: "top 78%", once: true },
          });
          gsap.to(role.querySelector("[data-xp-dot]"), {
            backgroundColor: "var(--color-accent)",
            scale: 1.4,
            scrollTrigger: {
              trigger: role,
              start: "top 70%",
              toggleActions: "play none none reverse",
            },
          });
        });
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
