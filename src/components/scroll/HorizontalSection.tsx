"use client";

import { useRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";
import { DESKTOP_MOTION_QUERY, gsap, useGSAP } from "@/lib/gsap";

type HorizontalSectionProps = {
  id?: string;
  label: string;
  children: ReactNode;
  className?: string;
};

/**
 * Pins the section and converts vertical scroll into sideways travel along the track.
 * Inside it, mark panels with `data-h-panel`, layers to drift with `data-h-parallax="<xPercent>"`
 * and pieces to rise in with `data-h-reveal` — they all ride the pinned tween as a
 * `containerAnimation`. Below md the track stacks
 * vertically; from md without the pin (short viewport or reduced motion) it is a two-column grid.
 */
export function HorizontalSection({ id, label, children, className }: HorizontalSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;

      const mm = gsap.matchMedia();
      mm.add(DESKTOP_MOTION_QUERY, () => {
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

        const travel = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            // Lenis already smooths the scroll position. Extra scrub lag here would stall the
            // track when the pin engages and leave it short of the end when the pin releases.
            // anticipatePin is for scrollers that lag behind the main thread; Lenis scrolls
            // natively, so it would only pin the section early with a visible snap.
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        gsap.utils.toArray<HTMLElement>("[data-h-parallax]", track).forEach((layer) => {
          const amount = Number(layer.dataset.hParallax) || 10;
          gsap.fromTo(
            layer,
            { xPercent: -amount },
            {
              xPercent: amount,
              ease: "none",
              scrollTrigger: {
                trigger: layer.closest("[data-h-panel]") ?? layer,
                containerAnimation: travel,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>("[data-h-panel]", track).forEach((panel) => {
          const pieces = panel.querySelectorAll("[data-h-reveal]");
          if (!pieces.length) return;
          gsap.from(pieces, {
            y: 48,
            opacity: 0,
            ease: "expo.out",
            duration: 1,
            stagger: 0.08,
            scrollTrigger: {
              trigger: panel,
              containerAnimation: travel,
              start: "left 85%",
              toggleActions: "play none none reverse",
            },
          });
        });
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id={id}
      aria-label={label}
      className={cn("relative overflow-hidden md:tall:motion-safe:h-svh", className)}
    >
      <div
        ref={trackRef}
        className="flex flex-col gap-14 px-[clamp(1rem,4vw,3.5rem)] md:grid md:grid-cols-2 md:gap-x-10 md:gap-y-20 md:tall:motion-safe:flex md:tall:motion-safe:h-full md:tall:motion-safe:w-max md:tall:motion-safe:flex-row md:tall:motion-safe:items-center md:tall:motion-safe:gap-10 md:tall:motion-safe:px-14"
      >
        {children}
      </div>
    </section>
  );
}
