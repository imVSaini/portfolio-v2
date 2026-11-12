import { Fragment } from "react";

import { cn } from "@/lib/cn";

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

export function Manifesto() {
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
