"use client";

import { useRef, useState, type ReactNode } from "react";

import { site } from "@/data/site";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { cn } from "@/lib/cn";
import { gsap, useGSAP } from "@/lib/gsap";
import { useIntro } from "@/stores/intro";

/** Minimum seconds on screen, from navigation start. */
const MIN_S = 0.5;
/** Seconds after hydration to hand over even if fonts are still loading. */
const MAX_S = 2;
const MILESTONES = { hydrated: 40, fonts: 85 } as const;
const PHASES = ["Setting type", "Ready"] as const;
const WHEEL = [..."01234567890"];
const PLACES = [100, 10, 1] as const;
const INERT_TARGETS = 'a[href="#main"], header, main, footer';

function wheelAt(value: number, place: number) {
  return (Math.floor(value / place) % 10) + Math.max(0, (value % place) - (place - 1));
}

/** Once-per-session curtain that counts real load milestones, then lifts away. */
export function Preloader() {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const [fresh] = useState(!useIsHydrated());

  useGSAP(
    (_context, contextSafe) => {
      const el = ref.current;
      const bar = el?.querySelector<HTMLElement>("[data-preloader-bar]");
      const root = document.documentElement;
      if (!el || !bar || !contextSafe) return;
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

      const counter = { value: 0 };
      const wheels = gsap.utils
        .toArray<HTMLElement>("[data-preloader-wheel]", el)
        .map((wheel) => gsap.quickSetter(wheel, "yPercent"));
      const setBar = gsap.quickSetter(bar, "scaleX");
      const render = () => {
        wheels.forEach((setWheel, i) => {
          setWheel((-wheelAt(counter.value, PLACES[i] ?? 1) / WHEEL.length) * 100);
        });
        setBar(counter.value / 100);
      };
      const glide = gsap.quickTo(counter, "value", {
        duration: 0.6,
        ease: "power3.out",
        onUpdate: render,
      });
      let target = 0;
      const reach = (value: number) => {
        target = Math.max(target, value);
        glide(target);
      };

      let alive = true;
      let ready = false;
      let settled = false;
      let leaving = false;

      const leave = contextSafe(() => {
        if (!alive || leaving || !ready || !settled) return;
        leaving = true;
        setPhase(PHASES.length - 1);
        gsap.killTweensOf(counter);
        gsap
          .timeline()
          .to(counter, { value: 100, duration: 0.25, ease: "power2.inOut", onUpdate: render })
          .to(
            gsap.utils.toArray<HTMLElement>("[data-preloader-out]", el),
            { yPercent: -110, duration: 0.3, ease: "expo.in", stagger: 0.03 },
            "<0.1",
          )
          .to(el, { yPercent: -100, duration: 0.6, ease: "expo.inOut" }, "-=0.15")
          .add(() => {
            gsap.set(el, { display: "flex" });
            root.removeAttribute("data-intro");
            setInert(false);
            useIntro.getState().finish();
          }, "<")
          .set(el, { display: "none" });
      });
      const markReady = () => {
        ready = true;
        leave();
      };

      reach(MILESTONES.hydrated);
      void document.fonts.ready.then(
        contextSafe(() => {
          if (!alive) return;
          reach(MILESTONES.fonts);
          markReady();
        }),
      );
      gsap.delayedCall(Math.max(0, MIN_S - performance.now() / 1000), () => {
        settled = true;
        leave();
      });
      gsap.delayedCall(MAX_S, markReady);

      return () => {
        alive = false;
        setInert(false);
      };
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      data-preloader=""
      aria-hidden="true"
      className="fixed inset-0 z-45 hidden touch-none flex-col bg-surface select-none [html.motion-ok[data-intro=play]_&]:flex [html[data-intro=play]_&~*]:[interactivity:inert]"
    >
      <div className="container-page flex flex-1 flex-col justify-between pb-8 md:pb-10">
        <div className="flex h-(--header-h) items-center justify-between gap-6 font-display text-p4 font-medium tracking-wide uppercase">
          <Lift className="whitespace-nowrap">{site.fullName}</Lift>
          <Lift className="hidden text-muted sm:block">{site.role}</Lift>
        </div>

        <div className="flex items-end justify-between gap-6">
          <Lift className="text-p4 tracking-wide whitespace-nowrap text-muted uppercase">
            <span className="flex items-center gap-2">
              <span className="inline-block animate-spin-steady text-accent">✳</span>
              {PHASES[phase]}
            </span>
          </Lift>
          <Lift>
            <span className="flex font-display text-[clamp(5.5rem,24vw,17rem)] leading-[0.8] font-semibold tracking-[-0.03em]">
              {PLACES.map((place) => (
                <span key={place} className="h-[0.8em] overflow-y-clip">
                  <span data-preloader-wheel="" className="flex flex-col items-center">
                    {WHEEL.map((digit, i) => (
                      <span key={i} className="h-[0.8em]">
                        {digit}
                      </span>
                    ))}
                  </span>
                </span>
              ))}
              <span className="pl-[0.04em] text-[0.28em] leading-none tracking-normal text-accent">
                %
              </span>
            </span>
          </Lift>
        </div>
      </div>

      <span
        data-preloader-bar=""
        className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-accent"
      />
    </div>
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
