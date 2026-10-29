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
 * `containerAnimation`. Below md (or with reduced motion) the track is a native swipe row.
 */
export function HorizontalSection({ id, label, children, className }: HorizontalSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

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
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        gsap.fromTo(
          progressRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: () => `+=${distance()}`,
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );

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
      className={cn("relative overflow-hidden md:h-svh", className)}
    >
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory scroll-px-5 scrollbar-none gap-5 overflow-x-auto overscroll-x-contain px-5 pb-6 md:h-full md:w-max md:snap-none md:items-center md:gap-10 md:overflow-visible md:px-14 md:pb-0"
      >
        {children}
      </div>
      <div className="pointer-events-none absolute inset-x-14 bottom-8 hidden h-px bg-line md:block">
        <div ref={progressRef} className="h-full origin-left scale-x-0 bg-accent" />
      </div>
    </section>
  );
}
