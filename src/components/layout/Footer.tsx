"use client";

import Link from "next/link";
import { useRef } from "react";

import { RollText } from "@/components/motion/RollText";
import { ScrollLink } from "@/components/scroll/ScrollLink";
import { Seal } from "@/components/ui/Seal";
import { socialIcons } from "@/components/ui/SocialIcons";
import { contact } from "@/data/contact";
import { site } from "@/data/site";
import { useCurrentYear } from "@/hooks/useCurrentYear";
import { gsap, MOTION_QUERY, useGSAP } from "@/lib/gsap";

/** Letters lift towards a fine pointer; touch and reduced motion skip it. */
const HOVER_QUERY =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
/** How far the letter under the pointer lifts, as a percentage of its height. */
const LIFT = 14;
/** How many letter widths either side of the pointer still feel the lift. */
const REACH = 2.2;

const letters = [...site.shortName];
const SEAL_TEXT = "Back to top ✦ ".repeat(3);

/**
 * Scrolling in draws the rule, raises the wordmark letter by letter, then drops the accent dot and
 * spins the back-to-top seal in. A pointer over the wordmark lifts the letters nearest to it.
 */
export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const year = useCurrentYear();

  useGSAP(
    () => {
      const footer = ref.current;
      if (!footer) return;
      const mm = gsap.matchMedia();

      // Scrubbed across the footer's own scroll-in, which ends at the page bottom. The wordmark is
      // only fully on screen near the end, so the letters rise across most of the range.
      mm.add(MOTION_QUERY, () => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: footer,
              start: "top bottom",
              end: "bottom bottom",
              scrub: 0.8,
            },
          })
          .from("[data-footer-rule]", { scaleX: 0, ease: "none", duration: 0.6 }, 0)
          .from(
            "[data-footer-glyph]",
            { yPercent: 105, ease: "power2.out", duration: 0.7, stagger: 0.05 },
            0.1,
          )
          .from(
            "[data-footer-dot]",
            { scale: 0, transformOrigin: "50% 80%", ease: "back.out(3)", duration: 0.25 },
            1,
          )
          .from(
            "[data-footer-seal]",
            { scale: 0, rotate: -120, ease: "back.out(2)", duration: 0.25 },
            1,
          )
          .from(
            "[data-footer-meta]",
            { autoAlpha: 0, y: 16, ease: "power2.out", duration: 0.25 },
            1,
          );
      });

      mm.add(HOVER_QUERY, () => {
        const wordmark = footer.querySelector<HTMLElement>("[data-footer-wordmark]");
        if (!wordmark) return;
        const masks = gsap.utils.toArray<HTMLElement>("[data-footer-mask]", wordmark);
        const lifts = masks.map((mask) =>
          gsap.quickTo(mask, "yPercent", { duration: 0.7, ease: "expo.out" }),
        );
        let centres: { x: number; width: number }[] = [];

        const measure = () => {
          centres = masks.map((mask) => {
            const box = mask.getBoundingClientRect();
            return { x: box.left + box.width / 2, width: box.width };
          });
        };
        const onMove = (event: PointerEvent) => {
          centres.forEach(({ x, width }, i) => {
            const distance = Math.abs(event.clientX - x) / width;
            lifts[i]?.(-LIFT * Math.max(0, 1 - distance / REACH));
          });
        };
        const onLeave = () => lifts.forEach((lift) => lift(0));

        wordmark.addEventListener("pointerenter", measure);
        wordmark.addEventListener("pointermove", onMove);
        wordmark.addEventListener("pointerleave", onLeave);
        return () => {
          wordmark.removeEventListener("pointerenter", measure);
          wordmark.removeEventListener("pointermove", onMove);
          wordmark.removeEventListener("pointerleave", onLeave);
        };
      });

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <footer ref={ref} className="relative">
      <span
        data-footer-rule=""
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px origin-left bg-line"
      />
      <div className="container-page flex flex-col gap-10 py-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <p
            data-footer-wordmark=""
            aria-hidden="true"
            className="flex font-display text-[clamp(3rem,13.5vw,15rem)] leading-[0.8] font-semibold tracking-[-0.03em] uppercase select-none"
          >
            {letters.map((letter, i) => (
              // Clipped along the bottom only, so glyphs rise out of the baseline untrimmed.
              <span
                key={i}
                data-footer-mask=""
                className="inline-block [clip-path:inset(-1em_-0.2em_0_-0.2em)]"
              >
                <span data-footer-glyph="" className="inline-block">
                  {letter}
                </span>
              </span>
            ))}
            <span data-footer-dot="" className="inline-block text-accent">
              .
            </span>
          </p>
          <ScrollLink
            href="#top"
            aria-label="Back to top"
            data-footer-seal=""
            className="group ml-auto block size-28 shrink-0 rounded-full md:size-36 xl:size-44"
          >
            <Seal
              text={SEAL_TEXT}
              className="size-full"
              discClassName="size-[40%] overflow-hidden transition-transform duration-500 ease-out-expo group-hover:scale-110 group-focus-visible:scale-110 motion-reduce:transition-none"
            >
              <span className="grid">
                <span className="col-start-1 row-start-1 transition-transform duration-500 ease-out-expo group-hover:translate-y-[-150%] group-focus-visible:translate-y-[-150%] motion-reduce:transition-none">
                  ↑
                </span>
                <span className="col-start-1 row-start-1 translate-y-[150%] transition-transform duration-500 ease-out-expo group-hover:translate-y-0 group-focus-visible:translate-y-0 motion-reduce:transition-none">
                  ↑
                </span>
              </span>
            </Seal>
          </ScrollLink>
        </div>
        <div
          data-footer-meta=""
          className="flex flex-col justify-between gap-4 text-p4 tracking-wide text-muted uppercase sm:flex-row sm:items-center"
        >
          <span>
            © {year} {site.name}
          </span>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <ul className="flex items-center gap-6">
              {contact.links.map((link) => {
                const Icon = socialIcons[link.label];
                return (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${link.label} (opens in a new tab)`}
                      className="group inline-flex items-center gap-2"
                    >
                      <Icon
                        aria-hidden="true"
                        className="size-3.5 transition-colors duration-300 group-hover:text-accent group-focus-visible:text-accent"
                      />
                      <RollText text={link.label} />
                    </a>
                  </li>
                );
              })}
            </ul>
            <span aria-hidden="true" className="hidden h-3 w-px bg-line-strong sm:block" />
            <nav aria-label="Legal">
              <Link href="/privacy" className="group inline-flex">
                <RollText text="Privacy policy" />
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
