"use client";

import { useRef } from "react";

import { RevealText } from "@/components/motion/RevealText";
import { RoleEntry } from "@/components/sections/experience/RoleEntry";
import { RoleNext } from "@/components/sections/experience/RoleNext";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { experience } from "@/data/experience";
import { gsap, MOTION_QUERY, useGSAP } from "@/lib/gsap";

export function Experience() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERY, () => {
        // Accent spine draws down as the timeline scrolls past.
        gsap.fromTo(
          "[data-xp-line]",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: "[data-xp-list]",
              start: "top 70%",
              end: "bottom 70%",
              scrub: true,
            },
          },
        );

        gsap.utils.toArray<HTMLElement>("[data-xp-role]").forEach((role) => {
          gsap.from(role.querySelectorAll("[data-xp-item]"), {
            y: 32,
            opacity: 0,
            duration: 0.9,
            ease: "expo.out",
            stagger: 0.06,
            scrollTrigger: { trigger: role, start: "top 78%", once: true },
          });
          gsap.to(role.querySelector("[data-xp-dot]"), {
            backgroundColor: "var(--color-accent)",
            scale: 1.4,
            scrollTrigger: {
              trigger: role,
              start: "top 70%",
              toggleActions: "play none none reverse",
            },
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
      id="experience"
      aria-labelledby="experience-title"
      className="relative container-page py-16 md:py-40"
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="flex flex-col gap-5 lg:col-span-8">
          <SectionLabel>Experience</SectionLabel>
          <RevealText as="h2" id="experience-title" className="text-h2 uppercase">
            Seven years of keeping production calm.
          </RevealText>
        </div>
        <p className="max-w-sm text-p2 text-muted lg:col-span-4 lg:justify-self-end">
          From hand-coding client sites to leading architecture for five live SaaS products, still
          close to the code at every step.
        </p>
      </div>

      <ol data-xp-list="" className="relative mt-14 md:mt-28">
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-1.25 w-px bg-line lg:left-[calc(25%+5px)]"
        />
        <span
          data-xp-line=""
          aria-hidden="true"
          className="absolute inset-y-0 left-1.25 w-px origin-top bg-accent lg:left-[calc(25%+5px)]"
        />

        {experience.map((role) => (
          <RoleEntry key={role.company} role={role} />
        ))}

        <RoleNext />
      </ol>
    </section>
  );
}
