"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { site } from "@/data/site";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/cn";
import { gsap, useGSAP } from "@/lib/gsap";

const formatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: site.timeZone,
});

const DIGITS = [..."01234567890"];
const STEP = 100 / DIGITS.length;

/** Ticking wall-clock in the owner's time zone. Renders a placeholder until mounted. */
export function LiveClock({ className }: { className?: string }) {
  const ref = useRef<HTMLTimeElement>(null);
  const [now, setNow] = useState<string | null>(null);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const tick = () => setNow(formatter.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useLayoutEffect(() => {
    const clock = ref.current;
    return () => {
      clock?.querySelectorAll<HTMLElement>("[data-clock-strip]").forEach((strip) => {
        delete strip.dataset.shown;
      });
    };
  }, []);

  useGSAP(
    () => {
      if (!now) return;
      gsap.utils.toArray<HTMLElement>("[data-clock-strip]", ref.current).forEach((strip) => {
        const value = Number(strip.dataset.value);
        const shown = strip.dataset.shown === undefined ? null : Number(strip.dataset.shown);
        strip.dataset.shown = String(value);
        if (shown === value) return;
        if (shown === null || reduceMotion) {
          gsap.killTweensOf(strip);
          gsap.set(strip, { yPercent: -value * STEP });
          return;
        }
        const wraps = value < shown;
        gsap.to(strip, {
          yPercent: -(wraps ? DIGITS.length - 1 : value) * STEP,
          duration: 0.6,
          ease: "power3.out",
          overwrite: true,
          ...(wraps && { onComplete: () => gsap.set(strip, { yPercent: -value * STEP }) }),
        });
      });
    },
    { scope: ref, dependencies: [now, reduceMotion] },
  );

  return (
    <time
      ref={ref}
      className={cn("inline-flex", className, !now && "invisible")}
      suppressHydrationWarning
    >
      <span className="sr-only">{now}</span>
      <span aria-hidden="true" className="inline-flex">
        {[...(now ?? "00:00:00")].map((char, i) =>
          /\d/.test(char) ? (
            <span key={i} className="relative inline-block overflow-hidden">
              <span className="invisible">0</span>
              <span
                data-clock-strip=""
                data-value={char}
                className="absolute inset-x-0 top-0 flex flex-col text-center"
              >
                {DIGITS.map((digit, j) => (
                  <span key={j}>{digit}</span>
                ))}
              </span>
            </span>
          ) : (
            <span key={i}>{char}</span>
          ),
        )}
      </span>
    </time>
  );
}
