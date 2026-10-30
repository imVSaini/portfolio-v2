"use client";

import { Fragment, useRef, type ComponentType, type CSSProperties, type SVGProps } from "react";

import { RevealText } from "@/components/motion/RevealText";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { cn } from "@/lib/cn";
import { DESKTOP_MOTION_QUERY, gsap, MOTION_QUERY, useGSAP } from "@/lib/gsap";

import { MeasureArt, OrbitArt, ResilienceArt, SchemaArt } from "./ApproachArt";

/* ---------------------------------------------------------------------------
 * Manifesto — plain text runs, plus keywords that light up in the accent and
 * pop a small glyph pill when the scrub reaches them.
 * ------------------------------------------------------------------------- */

type Glyph = "schema" | "cache" | "retry" | "spark";
type Token = string | { word: string; glyph: Glyph; after?: string };

const MANIFESTO: Token[] = [
  "I care most about the parts of software nobody screenshots: the",
  { word: "schema", glyph: "schema" },
  "that survives its tenth tenant, the",
  { word: "cache", glyph: "cache" },
  "that keeps a dashboard honest, the",
  { word: "retry", glyph: "retry" },
  "that outlasts a vendor outage. Then I make the surface feel",
  { word: "effortless", glyph: "spark", after: "," },
  "because the surface is all your users ever meet.",
];

const glyphPaths: Record<Glyph, string> = {
  schema:
    "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Zm0 0v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
  cache: "M13 2 4 14h7l-1 8 9-12h-7l1-8Z",
  retry: "M20 12a8 8 0 1 1-2.3-5.7M20 4v4.5h-4.5",
  spark: "M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4Z",
};

/** Each pill icon idles with its own loop once it has popped in. */
const glyphLoops: Record<Glyph, string> = {
  schema: "animate-bob",
  cache: "animate-flicker",
  retry: "animate-spin-steady",
  spark: "animate-twinkle",
};

function GlyphPill({ glyph }: { glyph: Glyph }) {
  return (
    <span
      data-chip=""
      aria-hidden="true"
      className="mx-[0.06em] inline-flex h-[0.62em] w-[1.12em] translate-y-[-0.04em] items-center justify-center rounded-full bg-accent align-middle text-faded-black"
    >
      <svg
        viewBox="0 0 24 24"
        className={cn("size-[0.38em] motion-reduce:animate-none", glyphLoops[glyph])}
        fill={glyph === "cache" || glyph === "spark" ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={glyph === "cache" || glyph === "spark" ? 0 : 2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={glyphPaths[glyph]} />
      </svg>
    </span>
  );
}

function Manifesto() {
  return (
    <p className="font-display text-[clamp(1.75rem,4.2vw,4.25rem)] leading-[1.06] font-medium tracking-[-0.015em]">
      {MANIFESTO.map((token, i) =>
        typeof token === "string" ? (
          <Fragment key={i}>
            {token.split(" ").map((word, j) => (
              <Fragment key={j}>
                <span data-word="">{word}</span>{" "}
              </Fragment>
            ))}
          </Fragment>
        ) : (
          <Fragment key={i}>
            <span data-word="" className="text-accent">
              {token.word}
            </span>
            <GlyphPill glyph={token.glyph} />
            {token.after}{" "}
          </Fragment>
        ),
      )}
    </p>
  );
}

/* ---------------------------------------------------------------------------
 * Principles — sticky cards that stack; each one tucks the previous card
 * back (scale + shade) as it slides over it.
 * ------------------------------------------------------------------------- */

type Tone = "raised" | "invert" | "accent" | "soft";

const tones: Record<Tone, { card: string; bg: string }> = {
  raised: {
    card: "bg-surface-raised text-faded-black ring-1 ring-line dark:text-manila-light",
    bg: "var(--surface-raised)",
  },
  invert: {
    card: "bg-faded-black text-manila-light dark:bg-manila-light dark:text-faded-black",
    bg: "var(--card-invert)",
  },
  accent: { card: "bg-accent text-faded-black", bg: "var(--color-accent)" },
  soft: {
    card: "bg-manila-50 text-faded-black dark:bg-soot dark:text-manila-light",
    bg: "var(--card-soft)",
  },
};

const principles: {
  tag: string;
  title: string;
  body: string;
  tone: Tone;
  Art: ComponentType<SVGProps<SVGSVGElement>>;
}[] = [
  {
    tag: "Architecture",
    title: "Data first, pixels second",
    body: "Schemas, contracts and boundaries come before components. Get those right and features stop fighting each other.",
    tone: "raised",
    Art: SchemaArt,
  },
  {
    tag: "Reliability",
    title: "Make failure boring",
    body: "Idempotent jobs, outboxes, rate limits and tests on every push. Incidents should be non-events, not war stories.",
    tone: "invert",
    Art: ResilienceArt,
  },
  {
    tag: "Delivery",
    title: "Small, sharp, measured",
    body: "Small PRs, honest reviews and outcomes you can graph. Momentum is a feature, and so is knowing it worked.",
    tone: "accent",
    Art: MeasureArt,
  },
  {
    tag: "AI",
    title: "AI as leverage",
    body: "LLMs belong where they remove real toil, with typed tools, guardrails and a human approving every action.",
    tone: "soft",
    Art: OrbitArt,
  },
];

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
      className="relative py-28 md:py-0"
    >
      <h2 id="approach-title" className="sr-only">
        How I build
      </h2>

      <div
        data-manifesto=""
        className="container-page flex flex-col gap-7 md:min-h-svh md:justify-center md:gap-9"
      >
        <SectionLabel>Approach</SectionLabel>
        <Manifesto />
      </div>

      <div className="container-page mt-28 md:mt-16">
        <div className="mb-14 grid gap-6 md:mb-20 md:grid-cols-12 md:items-end">
          <RevealText as="h3" className="text-h2 uppercase md:col-span-8">
            Four rules I&nbsp;don’t break.
          </RevealText>
          <p className="max-w-sm text-p2 text-muted md:col-span-4 md:justify-self-end">
            The principles behind every system I’ve shipped, from the first schema to the on-call
            rota.
          </p>
        </div>

        <ul className="flex flex-col gap-[14svh] pb-[8svh] md:pb-[18svh]">
          {principles.map(({ tag, title, body, tone, Art }, i) => (
            <li
              key={title}
              data-stack-card=""
              className="sticky"
              style={{ top: `calc(var(--header-h) + ${1 + i * 1.25}rem)` }}
            >
              <article
                data-stack-inner=""
                style={{ "--card-bg": tones[tone].bg } as CSSProperties}
                className={cn(
                  "relative grid min-h-96 origin-top overflow-hidden rounded-[1.75rem] p-7 corner-squircle sm:p-10 md:min-h-[min(70svh,36rem)] md:grid-cols-[1.15fr_1fr] md:gap-10 md:p-14",
                  tones[tone].card,
                )}
              >
                <div className="flex flex-col justify-between gap-12">
                  <span className="w-fit rounded-full border border-current/25 px-3.5 py-1.5 font-display text-p4 uppercase">
                    {tag}
                  </span>
                  <div className="flex flex-col gap-5">
                    <h4 className="text-h3 uppercase">{title}</h4>
                    <p className="max-w-md text-p1 opacity-75">{body}</p>
                  </div>
                </div>

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute top-7 right-7 w-20 sm:top-10 sm:right-10 sm:w-28 md:relative md:top-auto md:right-auto md:flex md:w-auto md:items-center md:justify-center"
                >
                  <Art className="w-full max-w-88" />
                </div>

                <div
                  data-stack-shade=""
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-manila-light opacity-0 dark:bg-faded-black"
                />
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
