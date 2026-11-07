"use client";

import { useRef, useState, type ReactNode } from "react";

import { wordmark } from "@/components/ui/wordmark";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { cn } from "@/lib/cn";
import { gsap, useGSAP } from "@/lib/gsap";
import { useIntro } from "@/stores/intro";

/** Seconds the proof rests in outline after first paint. */
const HOLD_S = 0.2;
/** Seconds to ink the wordmark from 000 up to `WAIT_AT`. */
const COUNT_S = 1;
/** Where the count waits until fonts and hydration are really done, out of 100. */
const WAIT_AT = 90;
/** Seconds to finish the count from `WAIT_AT` to 100 once the page is ready. */
const FINISH_S = 0.3;
/** Seconds the inked mark rests before the hand-off. */
const REST_S = 0.15;
/** Seconds for the flight into the header logo and the sheet lift. */
const FLIGHT_S = 1;
/** Seconds after hydration to hand over even if fonts are still loading. */
const MAX_S = 2;
/** How much of the count each letter takes to ink, out of 100. */
const INK_SPAN = 30;
const PHASES = ["Setting type", "Ready"] as const;
const INERT_TARGETS = 'a[href="#main"], header, main, footer';

/** Once-per-session intro: the wordmark inks in, then flies into the header logo. */
export function Preloader() {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const [status, setStatus] = useState<"" | "Loading" | "Loaded">("");
  const [fresh] = useState(!useIsHydrated());

  useGSAP(
    (_context, contextSafe) => {
      const el = ref.current;
      const root = document.documentElement;
      const mark = el?.querySelector<SVGSVGElement>("[data-preloader-mark]");
      const sheet = el?.querySelector<HTMLElement>("[data-preloader-sheet]");
      const rule = el?.querySelector<HTMLElement>("[data-preloader-rule]");
      const bar = el?.querySelector<HTMLElement>("[data-preloader-bar]");
      const count = el?.querySelector<HTMLElement>("[data-preloader-count]");
      if (!el || !mark || !sheet || !rule || !bar || !count || !contextSafe) return;
      if (!fresh || !root.classList.contains("motion-ok") || root.dataset.intro !== "play") {
        gsap.set(el, { display: "none" });
        useIntro.getState().finish();
        return;
      }

      const blocked = [...document.querySelectorAll<HTMLElement>(INERT_TARGETS)];
      const setInert = (inert: boolean) => {
        blocked.forEach((node) => {
          node.inert = inert;
        });
      };
      setInert(true);
      setStatus("Loading");

      const letters = gsap.utils.toArray<SVGPathElement>("[data-preloader-letter]", el);
      const weights = wordmark.letters.flatMap((letter, i) => {
        const path = letters[i];
        return path ? gsap.to(path, { morphSVG: letter.bold, ease: "none", paused: true }) : [];
      });
      const inks = letters.map((path) => gsap.quickSetter(path, "fillOpacity"));
      const step = (100 - INK_SPAN) / Math.max(1, letters.length - 1);
      const setBar = gsap.quickSetter(bar, "scaleX");
      const counter = { value: 0 };
      const render = () => {
        letters.forEach((_path, i) => {
          const inked = gsap.utils.clamp(0, 1, (counter.value - i * step) / INK_SPAN);
          weights[i]?.progress(inked);
          inks[i]?.(inked);
        });
        setBar(counter.value / 100);
        count.textContent = String(Math.round(counter.value)).padStart(3, "0");
      };

      let alive = true;
      let ready = false;
      let counted = false;
      let leaving = false;

      const handOver = (handoff: boolean) => () => {
        gsap.set(el, { display: "flex", pointerEvents: "none" });
        root.removeAttribute("data-intro");
        setInert(false);
        setStatus("Loaded");
        useIntro.getState().finish(handoff);
      };

      const leave = contextSafe(() => {
        if (!alive || leaving || !ready || !counted) return;
        leaving = true;
        setPhase(PHASES.length - 1);

        const logo =
          window.scrollY < 8 ? document.querySelector<SVGSVGElement>("header [data-logo]") : null;
        const from = mark.getBoundingClientRect();
        const to = logo?.getBoundingClientRect();
        const tl = gsap
          .timeline()
          .to(counter, { value: 100, duration: FINISH_S, ease: "power2.out", onUpdate: render })
          .addLabel("out", `+=${REST_S}`)
          .to(
            gsap.utils.toArray<HTMLElement>("[data-preloader-out]", el),
            { yPercent: -110, duration: 0.45, ease: "power2.in", stagger: 0.03 },
            "out",
          )
          .to(
            rule,
            { scaleX: 0, transformOrigin: "100% 50%", duration: 0.6, ease: "expo.in" },
            "out",
          )
          .addLabel("flight", "out+=0.3")
          .to(sheet, { yPercent: -100, duration: FLIGHT_S, ease: "expo.inOut" }, "flight+=0.05");

        if (logo && to?.width) {
          tl.set(logo, { autoAlpha: 0 }, "out").to(
            mark,
            {
              x: to.left - from.left,
              y: to.top - from.top,
              scale: to.width / from.width,
              transformOrigin: "0 0",
              duration: FLIGHT_S,
              ease: "expo.inOut",
            },
            "flight",
          );
          tl.to(letters, { strokeOpacity: 0, duration: 0.4, ease: "power1.out" }, "flight");
          weights.forEach((weight, i) => {
            tl.to(
              weight,
              { progress: 0, duration: FLIGHT_S * 0.8, ease: "power2.inOut" },
              `flight+=${0.1 + i * 0.01}`,
            );
          });
          tl.add(handOver(true), "flight+=0.35").set(logo, { autoAlpha: 1 });
        } else {
          tl.to(
            mark,
            { yPercent: -40, autoAlpha: 0, duration: 0.5, ease: "power2.in" },
            "out+=0.1",
          ).add(handOver(false), "flight+=0.35");
        }
        tl.set(el, { display: "none" });
      });
      const markReady = () => {
        ready = true;
        leave();
      };

      const painted = performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? 0;
      const startIn = painted / 1000 + HOLD_S - performance.now() / 1000;
      gsap.to(counter, {
        value: WAIT_AT,
        duration: Math.max(COUNT_S / 2, COUNT_S + Math.min(0, startIn)),
        delay: Math.max(0, startIn),
        ease: "power2.inOut",
        onUpdate: render,
        onComplete: () => {
          counted = true;
          leave();
        },
      });
      void document.fonts.ready.then(
        contextSafe(() => {
          if (alive) markReady();
        }),
      );
      gsap.delayedCall(MAX_S, markReady);

      return () => {
        alive = false;
        setInert(false);
      };
    },
    { scope: ref },
  );

  return (
    <>
      <p role="status" className="sr-only">
        {status}
      </p>
      <div
        ref={ref}
        data-preloader=""
        aria-hidden="true"
        className="fixed inset-0 z-45 hidden touch-none select-none [html.motion-ok[data-intro=play]_&]:flex [html.motion-ok[data-intro=play]_&~*]:[interactivity:inert]"
      >
        <div data-preloader-sheet="" className="absolute inset-0 bg-surface" />

        <div className="relative container-page flex flex-1 flex-col">
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-5xl">
              <svg
                data-preloader-mark=""
                viewBox={`0 0 ${wordmark.width} ${wordmark.height}`}
                className="block h-auto w-full overflow-visible"
              >
                {wordmark.letters.map((letter, i) => (
                  <path
                    key={i}
                    data-preloader-letter=""
                    d={letter.regular}
                    fill="currentColor"
                    fillOpacity={0}
                    stroke="currentColor"
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </svg>

              <div data-preloader-rule="" className="relative mt-[-5%] h-px bg-line-strong">
                <span
                  data-preloader-bar=""
                  className="absolute inset-0 origin-left scale-x-0 bg-accent"
                />
              </div>

              <div className="mt-4 flex items-center justify-between gap-6 text-p4 tracking-wide text-muted uppercase">
                <Lift className="whitespace-nowrap">
                  <span className="flex items-center gap-2">
                    <span className="inline-block animate-spin-steady text-accent">✳</span>
                    {PHASES[phase]}
                  </span>
                </Lift>
                <Lift className="font-display font-medium text-faded-black tabular-nums dark:text-manila-light">
                  <span data-preloader-count="">000</span>
                  <span className="text-accent">%</span>
                </Lift>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Lift({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("block overflow-hidden", className)}>
      <span data-preloader-out="" className="block">
        {children}
      </span>
    </span>
  );
}
