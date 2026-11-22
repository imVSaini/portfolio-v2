"use client";

import { useId, useRef } from "react";

import { cn } from "@/lib/cn";
import { gsap, MOTION_QUERY, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useAppStore, whenIntroDone } from "@/stores";

import { wordmark } from "./wordmark";

const FOLD_AT = 120;
const HOVER_INTENT = 0.12;
const SLITS = [
  { y: 22.31, height: 0.96 },
  { y: 25, height: 1.15 },
] as const;
const MONO_WIDTH = Math.max(
  ...wordmark.letters.map((letter) => ("fold" in letter ? letter.fold : 0)),
);

type LogoProps = {
  /** Folds to the monogram once the page scrolls past `FOLD_AT`. */
  condense?: boolean;
  /** A copy of the header logo: starts in its fold state, with no entrance. */
  mirror?: boolean;
  className?: string;
};

export function Logo({ condense = false, mirror = false, className }: LogoProps) {
  const ref = useRef<SVGSVGElement>(null);
  const maskId = useId();

  useGSAP(
    () => {
      const svg = ref.current;
      const trigger = svg?.closest<HTMLElement>("a") ?? svg?.parentElement;
      if (!svg || !trigger) return;
      const paths = gsap.utils.toArray<SVGPathElement>("[data-letter]", svg);
      const slits = gsap.utils.toArray<SVGRectElement>("[data-slit]", svg);
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
        if (mirror) rise.progress(1);
        const stopWaiting = mirror
          ? () => {}
          : whenIntroDone(() => {
              if (useAppStore.getState().handoff) rise.progress(1);
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
        fold.fromTo(slits, { scaleX: 0 }, { scaleX: 1, transformOrigin: "0% 50%" }, 0.2);

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
        let wantFolded = false;
        const showFold = () => {
          if (rise.progress() === 0) {
            fold.progress(wantFolded ? 1 : 0);
            if (wantFolded) rise.progress(1);
          } else if (rise.isActive()) return;
          else if (wantFolded) fold.play();
          else fold.reverse();
        };
        rise.eventCallback("onComplete", showFold);
        const foldTo = (on: boolean) => {
          settle();
          wantFolded = on;
          useAppStore.getState().setFolded(on);
          showFold();
        };
        const folded = condense
          ? ScrollTrigger.create({
              start: FOLD_AT,
              end: "max",
              onEnter: () => foldTo(true),
              onLeave: () => foldTo(true),
              onEnterBack: () => foldTo(true),
              onLeaveBack: () => foldTo(false),
              onRefresh: (self) => {
                if (self.progress > 0) foldTo(true);
              },
            })
          : null;
        const startFolded = mirror && useAppStore.getState().folded;
        if (startFolded) fold.progress(1);
        const isFolded = () => startFolded || (folded?.progress ?? 0) > 0;

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
          if (!isFolded()) return wave();
          intent = gsap.delayedCall(delay, () => fold.reverse());
        };
        const leave = () => {
          intent?.kill();
          if (isFolded()) fold.play();
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
    { scope: ref, dependencies: [condense, mirror] },
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
      <mask
        id={maskId}
        maskUnits="userSpaceOnUse"
        x={-2}
        y={0}
        width={wordmark.width + 4}
        height={wordmark.height}
      >
        <rect x={-2} y={0} width={wordmark.width + 4} height={wordmark.height} fill="white" />
        {SLITS.map((slit) => (
          <rect
            key={slit.y}
            data-slit=""
            x={0}
            y={slit.y}
            width={MONO_WIDTH}
            height={slit.height}
            transform="scale(0 1)"
            fill="black"
          />
        ))}
      </mask>
      <g mask={`url(#${maskId})`}>
        {wordmark.letters.map((letter, i) => (
          <path
            key={i}
            data-letter=""
            d={letter.regular}
            style={{ transitionDelay: `${i * 12}ms` }}
            className="fill-current transition-[fill] duration-300 ease-out-expo group-hover:fill-accent group-focus-visible:fill-accent motion-reduce:transition-none"
          />
        ))}
      </g>
    </svg>
  );
}
