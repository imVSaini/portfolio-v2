"use client";

import { useRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";
import { gsap, MOTION_QUERY, ScrollTrigger, useGSAP } from "@/lib/gsap";

type MarqueeProps = {
  children: ReactNode;
  /** Seconds per loop at rest. */
  duration?: number;
  reverse?: boolean;
  className?: string;
};

/**
 * Infinite loop that speeds up with scroll velocity and flips with scroll direction,
 * then eases back to its resting pace.
 */
export function Marquee({ children, duration = 40, reverse = false, className }: MarqueeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = trackRef.current;
      if (!track) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERY, () => {
        const loop = gsap.fromTo(
          track,
          { xPercent: reverse ? -50 : 0 },
          { xPercent: reverse ? 0 : -50, duration, ease: "none", repeat: -1 },
        );
        const trigger = ScrollTrigger.create({
          trigger: ref.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 300, 6);
            gsap.to(loop, {
              timeScale: boost * self.direction,
              duration: 0.2,
              overwrite: true,
              onComplete: () => {
                gsap.to(loop, { timeScale: self.direction, duration: 1.2, ease: "power2.out" });
              },
            });
          },
        });
        return () => {
          trigger.kill();
          loop.kill();
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <div ref={trackRef} className="flex w-max will-change-transform">
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
