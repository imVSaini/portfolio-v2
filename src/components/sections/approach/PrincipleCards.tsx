import type { ComponentType, CSSProperties, SVGProps } from "react";

import {
  MeasureArt,
  OrbitArt,
  ResilienceArt,
  SchemaArt,
} from "@/components/sections/approach/PrincipleArt";
import { cn } from "@/lib/cn";

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

export function PrincipleCards() {
  return (
    <ul className="flex flex-col gap-[14svh] md:pb-[18svh]">
      {principles.map(({ tag, title, body, tone, Art }, i) => (
        <li
          key={title}
          data-stack-card=""
          className="[@media(height>=32rem)]:sticky"
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
  );
}
