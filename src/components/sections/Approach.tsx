"use client";

import { useRef } from "react";

import { RevealText } from "@/components/motion/RevealText";
import { Manifesto } from "@/components/sections/approach/Manifesto";
import { PrincipleCards } from "@/components/sections/approach/PrincipleCards";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { DESKTOP_MOTION_QUERY, gsap, MOTION_QUERY, useGSAP } from "@/lib/gsap";

export function Approach() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ desktop: DESKTOP_MOTION_QUERY, motion: MOTION_QUERY }, (context) => {
        const { desktop, motion } = context.conditions as { desktop: boolean; motion: boolean };
        if (!motion) return;

        // Manifesto: pinned scrub on desktop, plain scroll-linked scrub on small screens.
        const block = ref.current?.querySelector<HTMLElement>("[data-manifesto]");
        if (!block) return;
        const words = gsap.utils.toArray<HTMLElement>("[data-word]");
        const step = 0.1;
        const fill = gsap.timeline({
          scrollTrigger: desktop
            ? { trigger: block, start: "center center", end: "+=110%", pin: true, scrub: true }
            : { trigger: block, start: "top 75%", end: "bottom 45%", scrub: true },
        });
        fill.fromTo(words, { opacity: 0.2 }, { opacity: 1, ease: "none", stagger: step }, 0);
        gsap.utils.toArray<HTMLElement>("[data-chip]").forEach((chip) => {
          const at = words.indexOf(chip.previousElementSibling as HTMLElement);
          fill.fromTo(
            chip,
            { scale: 0, rotate: -40 },
            { scale: 1, rotate: 0, duration: 0.5, ease: "back.out(2.2)" },
            Math.max(0, at) * step,
          );
        });

        // Principle cards: each incoming card pushes the previous one back.
        const cards = gsap.utils.toArray<HTMLElement>("[data-stack-card]");
        cards.forEach((card, i) => {
          const next = cards[i + 1];
          if (!next) return;
          gsap
            .timeline({
              scrollTrigger: {
                trigger: next,
                start: "top bottom",
                end: () => `top ${parseFloat(getComputedStyle(next).top)}px`,
                scrub: true,
                invalidateOnRefresh: true,
              },
            })
            .to(card.querySelector("[data-stack-inner]"), { scale: 0.94, ease: "none" }, 0)
            .to(card.querySelector("[data-stack-shade]"), { opacity: 0.6, ease: "none" }, 0);
        });

        // Art assembles as each card arrives.
        cards.forEach((card) => {
          gsap.from(card.querySelectorAll("[data-art-piece]"), {
            opacity: 0,
            scale: 0.6,
            transformOrigin: "50% 50%",
            duration: 0.9,
            ease: "expo.out",
            stagger: 0.04,
            scrollTrigger: { trigger: card, start: "top 70%", once: true },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      id="approach"
      aria-labelledby="approach-title"
      className="relative py-16 md:py-0"
    >
      <h2 id="approach-title" className="sr-only">
        How I build
      </h2>

      <div
        data-manifesto=""
        className="container-page flex flex-col gap-5 md:min-h-svh md:justify-center md:gap-9"
      >
        <SectionLabel>Approach</SectionLabel>
        <Manifesto />
      </div>

      <div className="container-page mt-32 md:mt-16">
        <div className="mb-14 grid gap-10 md:mb-20 lg:grid-cols-12 lg:items-end">
          <RevealText as="h3" className="text-h2 uppercase lg:col-span-8">
            Four rules I&nbsp;don’t break.
          </RevealText>
          <p className="max-w-sm text-p2 text-muted lg:col-span-4 lg:justify-self-end">
            The principles behind every system I’ve shipped, from the first schema to the on-call
            rota.
          </p>
        </div>

        <PrincipleCards />
      </div>
    </section>
  );
}
