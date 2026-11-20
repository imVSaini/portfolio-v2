import { RevealText } from "@/components/motion/RevealText";
import { ExperienceMotion } from "@/components/sections/experience/ExperienceMotion";
import { RoleEntry } from "@/components/sections/experience/RoleEntry";
import { RoleNext } from "@/components/sections/experience/RoleNext";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { experience } from "@/data/experience";

export function Experience() {
  return (
    <ExperienceMotion
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
    </ExperienceMotion>
  );
}
