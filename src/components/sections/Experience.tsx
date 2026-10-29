"use client";

import { useRef } from "react";

import { RevealText } from "@/components/motion/RevealText";
import { ScrollLink } from "@/components/scroll/ScrollLink";
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
      className="relative container-page py-28 md:py-40"
    >
      <div className="grid gap-10 md:grid-cols-12 md:items-end">
        <div className="flex flex-col gap-5 md:col-span-8">
          <SectionLabel>Experience</SectionLabel>
          <RevealText as="h2" id="experience-title" className="text-h2 uppercase">
            Seven years of keeping production calm.
          </RevealText>
        </div>
        <p className="max-w-sm text-p2 text-muted md:col-span-4 md:justify-self-end">
          From hand-coding client sites to leading architecture for five live SaaS products, still
          close to the code at every step.
        </p>
      </div>

      <ol data-xp-list="" className="relative mt-20 md:mt-28">
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-1.25 w-px bg-line md:left-[calc(25%+5px)]"
        />
        <span
          data-xp-line=""
          aria-hidden="true"
          className="absolute inset-y-0 left-1.25 w-px origin-top bg-accent md:left-[calc(25%+5px)]"
        />

        {experience.map((role) => (
          <li
            key={role.company}
            data-xp-role=""
            className="relative grid gap-8 pb-20 pl-10 last:pb-0 md:grid-cols-4 md:gap-0 md:pl-0"
          >
            <span
              data-xp-dot=""
              aria-hidden="true"
              className="absolute top-2 left-0 size-2.75 rounded-full border-2 border-manila-light bg-line-strong md:left-1/4 dark:border-faded-black"
            />

            {/* Sticky meta column. */}
            <div className="md:pr-12">
              <div className="flex flex-col gap-4 md:sticky md:top-[calc(var(--header-h)+2rem)]">
                <p className="font-display text-p4 tracking-wide text-muted uppercase tabular-nums">
                  {role.start} — {role.end}
                </p>
                <p className="text-p3 text-muted">{role.location}</p>
                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-5">
                  {role.metrics.map((metric) => (
                    <div key={metric.label} className="flex flex-col-reverse gap-1">
                      <dt className="text-p4 text-muted">{metric.label}</dt>
                      <dd className="font-display text-h3 leading-none font-semibold text-accent">
                        {metric.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            <div className="flex flex-col gap-6 md:col-span-3 md:pl-16">
              <div className="flex flex-col gap-2" data-xp-item="">
                <h3 className="text-h3 uppercase">{role.title}</h3>
                <p className="font-display text-p1 font-medium">
                  <span className="text-muted">@</span> {role.company}
                </p>
              </div>
              <p className="max-w-2xl text-p1 text-muted" data-xp-item="">
                {role.summary}
              </p>
              <ul className="flex max-w-3xl flex-col border-t border-line">
                {role.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    data-xp-item=""
                    className="flex gap-4 border-b border-line py-4 text-p2"
                  >
                    <span aria-hidden="true" className="mt-1 text-p4 text-accent">
                      ✦
                    </span>
                    {highlight}
                  </li>
                ))}
              </ul>
              <ul className="flex flex-wrap gap-2" data-xp-item="">
                {role.stack.map((tool) => (
                  <li
                    key={tool}
                    className="rounded-full bg-surface px-3 py-1 text-p4 text-muted dark:bg-soot"
                  >
                    {tool}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}

        <li data-xp-role="" className="relative grid pt-20 pl-10 md:grid-cols-4 md:pl-0">
          <span
            data-xp-dot=""
            aria-hidden="true"
            className="absolute top-22 left-0 size-2.75 rounded-full border-2 border-manila-light bg-line-strong md:left-1/4 dark:border-faded-black"
          />
          <p className="font-display text-p4 tracking-wide text-muted uppercase md:pr-12">Next</p>
          <div className="flex flex-col items-start gap-5 md:col-span-3 md:pl-16" data-xp-item="">
            <h3 className="text-h3 uppercase">Your team?</h3>
            <p className="max-w-xl text-p1 text-muted">
              The next chapter is unwritten. Bring the hard problem and I’ll bring the plan.
            </p>
            <ScrollLink
              href="#contact"
              className="inline-flex items-center gap-2 font-display text-p3 font-medium uppercase underline decoration-line-strong underline-offset-6 intent:text-accent intent:decoration-accent"
            >
              Let’s talk <span aria-hidden="true">→</span>
            </ScrollLink>
          </div>
        </li>
      </ol>
    </section>
  );
}
