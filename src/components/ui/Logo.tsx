"use client";

import { useRef } from "react";

import { cn } from "@/lib/cn";
import { gsap, MOTION_QUERY, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useIntro, whenIntroDone } from "@/stores/intro";

import { wordmark } from "./wordmark";

const FOLD_AT = 120;
const HOVER_INTENT = 0.12;

type LogoProps = {
  condense?: boolean;
  className?: string;
};

export function Logo({ condense = false, className }: LogoProps) {
  const ref = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const svg = ref.current;
      const trigger = svg?.closest<HTMLElement>("a") ?? svg?.parentElement;
      if (!svg || !trigger) return;
      const paths = gsap.utils.toArray<SVGPathElement>("[data-letter]", svg);
      const mm = gsap.matchMedia();

      mm.add(MOTION_QUERY, () => {
        gsap.set(svg, { visibility: "visible" });
        const rise = gsap.from(paths, {
          y: wordmark.height,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.04,
          delay: 0.15,
          paused: true,
        });
        const stopWaiting = whenIntroDone(() => {
          if (useIntro.getState().handoff) rise.progress(1);
          else rise.play();
        });

        const fold = gsap.timeline({
          paused: true,
          defaults: { duration: 0.9, ease: "expo.inOut" },
        });
        let wordStart = 0;
        wordmark.letters.forEach((letter, i) => {
          const path = paths[i];
          if (!path) return;
          if ("mono" in letter) {
            wordStart = i;
            fold.to(path, { morphSVG: letter.mono }, 0);
            return;
          }
          fold.to(
            path,
            {
              x: letter.fold - path.getBBox().x,
              scaleX: 0,
              opacity: 0,
              transformOrigin: "0% 50%",
              duration: 0.7,
            },
            (i - wordStart) * 0.04,
          );
        });

        let waves: gsap.core.Tween[] = [];
        const settle = () => {
          if (!waves.length) return;
          waves.forEach((tween) => tween.kill());
          waves = [];
          wordmark.letters.forEach((letter, i) => {
            const path = paths[i];
            if (path) gsap.set(path, { morphSVG: letter.regular });
          });
        };
        const folded = condense
          ? ScrollTrigger.create({
              start: FOLD_AT,
              end: "max",
              onToggle: (self) => {
                settle();
                if (self.isActive) fold.play();
                else fold.reverse();
              },
            })
          : null;

        const wave = () => {
          if (fold.progress() > 0) return;
          settle();
          waves = wordmark.letters.flatMap((letter, i) => {
            const path = paths[i];
            if (!path) return [];
            return gsap.to(path, {
              morphSVG: letter.bold,
              duration: 0.16,
              ease: "power2.inOut",
              delay: i * 0.02,
              yoyo: true,
              repeat: 1,
            });
          });
        };
        let intent: gsap.core.Tween | null = null;
        const enter = (delay: number) => {
          if (!folded?.isActive) return wave();
          intent = gsap.delayedCall(delay, () => fold.reverse());
        };
        const leave = () => {
          intent?.kill();
          if (folded?.isActive) fold.play();
        };
        const isMouse = (event: PointerEvent) => event.pointerType !== "touch";
        const onPointerEnter = (event: PointerEvent) => isMouse(event) && enter(HOVER_INTENT);
        const onPointerLeave = (event: PointerEvent) => isMouse(event) && leave();
        const onFocusIn = () => trigger.matches(":focus-visible") && enter(0);

        trigger.addEventListener("pointerenter", onPointerEnter);
        trigger.addEventListener("pointerleave", onPointerLeave);
        trigger.addEventListener("focusin", onFocusIn);
        trigger.addEventListener("focusout", leave);
        return () => {
          stopWaiting();
          intent?.kill();
          trigger.removeEventListener("pointerenter", onPointerEnter);
          trigger.removeEventListener("pointerleave", onPointerLeave);
          trigger.removeEventListener("focusin", onFocusIn);
          trigger.removeEventListener("focusout", leave);
        };
      });

      return () => mm.revert();
    },
    { scope: ref, dependencies: [condense] },
  );

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${wordmark.width} ${wordmark.height}`}
      width={wordmark.width}
      height={wordmark.height}
      aria-hidden="true"
      data-reveal=""
      data-logo=""
      className={cn("shrink-0", className)}
    >
      {wordmark.letters.map((letter, i) => (
        <path
          key={i}
          data-letter=""
          d={letter.regular}
          style={{ transitionDelay: `${i * 12}ms` }}
          className="fill-current transition-[fill] duration-300 ease-out-expo group-hover:fill-accent group-focus-visible:fill-accent motion-reduce:transition-none"
        />
      ))}
    </svg>
  );
}
