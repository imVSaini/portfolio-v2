"use client";

import { useRef, type ComponentPropsWithoutRef } from "react";

import { DESKTOP_MOTION_QUERY, gsap, MOTION_QUERY, useGSAP } from "@/lib/gsap";

/** Space kept between the header and the manifesto when it finishes lighting up on phones, in px. */
const HEADER_GAP = 16;

type ApproachMotionProps = ComponentPropsWithoutRef<"section">;

/** The approach section element: scrubs the manifesto words in and stacks the principle cards. */
export function ApproachMotion({ children, ...props }: ApproachMotionProps) {
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
            : {
                trigger: block,
                start: "top 75%",
                end: () => {
                  const top = block.getBoundingClientRect().top + window.scrollY;
                  const paragraph = block.querySelector("[data-word]")?.closest("p") ?? block;
                  const paragraphTop = paragraph.getBoundingClientRect().top + window.scrollY;
                  const header = document.querySelector("header")?.offsetHeight ?? 0;
                  return Math.min(
                    top + block.offsetHeight / 2 - window.innerHeight / 2,
                    paragraphTop - header - HEADER_GAP,
                  );
                },
                scrub: true,
              },
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
    <section ref={ref} {...props}>
      {children}
    </section>
  );
}
