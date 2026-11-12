import { Fragment } from "react";

import { Marquee } from "@/components/motion/Marquee";
import { skillMarquee } from "@/data/skills";
import { cn } from "@/lib/cn";

type MarqueeRowProps = {
  words: readonly string[];
  outline?: boolean;
};

function MarqueeRow({ words, outline = false }: MarqueeRowProps) {
  return (
    <>
      {words.map((word) => (
        <Fragment key={word}>
          <span
            className={cn(
              "px-6 font-display text-h2 font-semibold whitespace-nowrap uppercase",
              outline && "text-stroke-faded-black dark:text-stroke-manila-light",
            )}
          >
            {word}
          </span>
          <span aria-hidden="true" className="font-display text-h3 text-accent">
            ✳
          </span>
        </Fragment>
      ))}
    </>
  );
}

type SkillMarqueeProps = {
  className?: string;
};

export function SkillMarquee({ className }: SkillMarqueeProps) {
  return (
    <div
      className={cn("flex flex-col gap-2 border-y border-line py-8", className)}
      aria-hidden="true"
    >
      <Marquee duration={38}>
        <MarqueeRow words={skillMarquee.headline} />
      </Marquee>
      <Marquee duration={42} reverse>
        <MarqueeRow words={skillMarquee.counterline} outline />
      </Marquee>
    </div>
  );
}
