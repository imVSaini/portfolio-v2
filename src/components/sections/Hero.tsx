"use client";

import { useRef } from "react";

import { RevealText } from "@/components/motion/RevealText";
import { Button } from "@/components/ui/Button";
import { Seal } from "@/components/ui/Seal";
import { site } from "@/data/site";
import { gsap, MOTION_QUERY, useGSAP } from "@/lib/gsap";

const BADGE_TEXT = "Open to new opportunities ✦ Bengaluru ✦ ";

export function Hero() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERY, () => {
        gsap.from("[data-hero-fade]", {
          y: 24,
          opacity: 0,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.08,
          delay: 0.55,
        });
        gsap.from("[data-hero-badge]", {
          scale: 0.6,
          rotate: -90,
          opacity: 0,
          duration: 1.6,
          ease: "expo.out",
          delay: 0.4,
        });
        // The headline sinks and fades as the next section slides over it.
        gsap.to("[data-hero-title]", {
          yPercent: 18,
          opacity: 0.25,
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      id="top"
      aria-label="Introduction"
      className="relative flex min-h-svh flex-col overflow-hidden pt-(--header-h)"
    >
      {/* Ambient accent glow — drifts slower than the page. Masked off the header band so the
          header icons and their hover chips sit on the plain page colour. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 mask-[linear-gradient(to_bottom,transparent_calc(var(--header-h)+1rem),black_45%)]"
      >
        <div
          data-scroll=""
          data-scroll-speed="-0.25"
          className="absolute -top-1/4 -right-1/4 size-[70vw] max-w-240 rounded-full bg-accent opacity-16 blur-3xl dark:opacity-14"
        />
      </div>

      <div className="relative container-page flex flex-1 flex-col justify-center gap-10 py-12 md:py-16">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3" data-hero-fade="">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-line-strong px-3.5 py-1.5 text-p4 font-medium tracking-wide uppercase">
            <span className="size-2 animate-pulse-dot rounded-full bg-accent motion-reduce:animate-none" />
            {site.role} — {site.location}
          </span>
        </div>

        <div data-hero-title="">
          <h1 className="text-h1 uppercase">
            <RevealText as="span" on="load" delay={0.1} className="block">
              Backend depth,
            </RevealText>
            <span className="flex flex-wrap items-end gap-x-[0.18em]">
              <RevealText
                as="span"
                on="load"
                delay={0.22}
                className="block text-stroke-faded-black dark:text-stroke-manila-light"
              >
                frontend
              </RevealText>
              <RevealText as="span" on="load" delay={0.34} className="block text-accent">
                finish.
              </RevealText>
            </span>
          </h1>
        </div>

        <div className="grid gap-10 md:grid-cols-12 md:items-end">
          <p
            className="max-w-xl text-p1 text-muted md:col-span-6 md:col-start-1"
            data-hero-fade=""
            data-scroll=""
            data-scroll-speed="0.04"
          >
            I’m {site.shortName}, a full stack developer, who crafts web and mobile products where
            design and code work as one.{" "}
            <span className="text-faded-black dark:text-manila-light">
              I enjoy taking the lead on projects because, honestly, someone has to.
            </span>
          </p>

          <div
            className="flex flex-wrap gap-3 md:col-span-5 md:col-start-8 md:justify-end"
            data-hero-fade=""
          >
            <Button href="#work">See selected work</Button>
            <Button href="#contact" variant="outline">
              Start a conversation
            </Button>
          </div>
        </div>
      </div>

      {/* Rotating availability seal. */}
      <div
        aria-hidden="true"
        data-hero-badge=""
        className="absolute top-[calc(var(--header-h)+2rem)] right-[4vw] hidden size-36 lg:block xl:size-44"
      >
        <div data-scroll="" data-scroll-speed="0.12" className="size-full">
          <Seal text={BADGE_TEXT} className="size-full">
            ✳
          </Seal>
        </div>
      </div>
    </section>
  );
}
