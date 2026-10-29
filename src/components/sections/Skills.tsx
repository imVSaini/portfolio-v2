import { Fragment } from "react";

import { Marquee } from "@/components/motion/Marquee";
import { RevealText } from "@/components/motion/RevealText";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { skillGroups } from "@/data/skills";

const headline = ["Python", "FastAPI", "Node.js", "PostgreSQL", "Redis", "Celery"];
const counterline = ["Next.js", "React", "TypeScript", "Tailwind CSS", "GSAP", "Zustand"];

function MarqueeRow({ words, outline = false }: { words: string[]; outline?: boolean }) {
  return (
    <>
      {words.map((word) => (
        <Fragment key={word}>
          <span
            className={
              outline
                ? "px-6 font-display text-h2 font-semibold whitespace-nowrap text-stroke-faded-black uppercase dark:text-stroke-manila-light"
                : "px-6 font-display text-h2 font-semibold whitespace-nowrap uppercase"
            }
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

export function Skills() {
  const total = skillGroups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <section id="skills" aria-labelledby="skills-title" className="relative py-28 md:py-40">
      <div className="container-page grid gap-10 md:grid-cols-12 md:items-end">
        <div className="flex flex-col gap-5 md:col-span-8">
          <SectionLabel>Skills</SectionLabel>
          <RevealText as="h2" id="skills-title" className="text-h2 uppercase">
            One toolbox, the whole stack.
          </RevealText>
        </div>
        <p className="max-w-sm text-p2 text-muted md:col-span-4 md:justify-self-end">
          {total} tools across {skillGroups.length} disciplines, from Python services and Node APIs
          to React interfaces, cloud infrastructure and LLM features.
        </p>
      </div>

      <div
        className="my-20 flex flex-col gap-2 border-y border-line py-8 md:my-28"
        aria-hidden="true"
      >
        <Marquee duration={38}>
          <MarqueeRow words={headline} />
        </Marquee>
        <Marquee duration={42} reverse>
          <MarqueeRow words={counterline} outline />
        </Marquee>
      </div>

      <div className="container-page">
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2 xl:grid-cols-4">
          {skillGroups.map((group) => (
            <li
              key={group.name}
              className="group flex flex-col gap-6 bg-manila-light p-7 transition-colors duration-500 hover:bg-surface dark:bg-faded-black dark:hover:bg-soot"
            >
              <h3 className="text-h4 uppercase">{group.name}</h3>
              <p className="text-p3 text-muted">{group.note}</p>
              <ul className="mt-auto flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-line px-3 py-1 text-p4 transition-colors duration-300 hover:border-accent hover:text-accent"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
