"use client";

import { useRef, type ReactNode } from "react";

import { gsap, MOTION_QUERY, Observer, useGSAP } from "@/lib/gsap";

/** Quiet time that ends a wheel gesture (including its momentum) and releases the pull. */
const GESTURE_END_S = 0.2;
/** Matches Lenis's line-to-pixel scale for `deltaMode === 1`. */
const LINE_HEIGHT = 100 / 6;
const BAND_HEIGHT = "h-52";

/**
 * Colour bands fixed behind the page. Wheeling past the end slides the page up to reveal them,
 * then springs back. Touch devices rely on the native rubber-band instead.
 */
export function OverscrollReveal({ children }: { children: ReactNode }) {
  const bandsRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const nearEndRef = useRef<HTMLDivElement>(null);
  const atEndRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const bands = bandsRef.current;
    const page = pageRef.current;
    const nearEnd = nearEndRef.current;
    const atEndSentinel = atEndRef.current;
    if (!bands || !page || !nearEnd || !atEndSentinel) return;

    // Bands stay hidden away from the end so sideways or top-edge rubber-banding can't expose them.
    let atEnd = false;
    const intersection = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === nearEnd) bands.toggleAttribute("data-near-end", entry.isIntersecting);
        else atEnd = entry.isIntersecting;
      }
    });
    intersection.observe(nearEnd);
    intersection.observe(atEndSentinel);

    const mm = gsap.matchMedia();
    mm.add(MOTION_QUERY, () => {
      const setY = gsap.quickSetter(page, "y", "px");
      let offset = 0;
      let max = 0;
      // Only a gesture that starts at the end may pull, not momentum from one that landed there.
      let freshGesture = true;

      const wheel = Observer.create({
        target: window,
        type: "wheel",
        lineHeight: LINE_HEIGHT,
        onStopDelay: GESTURE_END_S,
        onWheel: ({ deltaX, deltaY }) => {
          const startsPull = freshGesture && atEnd && deltaY > 0;
          freshGesture = false;
          if (Math.abs(deltaX) > Math.abs(deltaY)) return;

          if (offset === 0) {
            if (!startsPull) return;
            max = bands.offsetHeight;
            if (gsap.isTweening(page)) {
              gsap.killTweensOf(page);
              offset = -Number(gsap.getProperty(page, "y"));
            }
          }

          const resistance = 1 - (offset / max) * 0.6;
          offset = gsap.utils.clamp(0, max, offset + deltaY * resistance);

          // Clear instead of zeroing: a transform here would become the containing block for the
          // pinned sections' `position: fixed`.
          if (offset) setY(-offset);
          else gsap.set(page, { clearProps: "transform" });
        },
        onStop: () => {
          freshGesture = true;
          if (!offset) return;
          offset = 0;
          gsap.to(page, { y: 0, duration: 0.6, ease: "expo.out", clearProps: "transform" });
        },
      });

      return () => {
        wheel.kill();
        gsap.set(page, { clearProps: "transform" });
      };
    });

    return () => {
      intersection.disconnect();
      mm.revert();
    };
  });

  return (
    <>
      <div
        ref={bandsRef}
        aria-hidden="true"
        className={`invisible fixed inset-x-0 bottom-0 grid ${BAND_HEIGHT} grid-rows-[80fr_60fr_45fr_20fr_10fr] data-near-end:visible`}
      >
        <div className="bg-bright-yellow dark:bg-gold" />
        <div className="bg-gold dark:bg-orange" />
        <div className="bg-orange dark:bg-red" />
        <div className="bg-red dark:bg-magenta" />
        <div className="bg-magenta dark:bg-magenta-dark" />
      </div>
      <div
        ref={pageRef}
        className="relative isolate z-0 bg-manila-light transition-colors duration-300 dark:bg-faded-black"
      >
        {children}
        <div
          ref={nearEndRef}
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 bottom-0 ${BAND_HEIGHT}`}
        />
        <div
          ref={atEndRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        />
      </div>
    </>
  );
}
