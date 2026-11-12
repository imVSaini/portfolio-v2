import { RevealText } from "@/components/motion/RevealText";
import { SkillGroups } from "@/components/sections/skills/SkillGroups";
import { SkillMarquee } from "@/components/sections/skills/SkillMarquee";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { skillGroups } from "@/data/skills";

export function Skills() {
  const total = skillGroups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <section id="skills" aria-labelledby="skills-title" className="relative py-16 md:py-40">
      <div className="container-page grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="flex flex-col gap-5 lg:col-span-8">
          <SectionLabel>Skills</SectionLabel>
          <RevealText as="h2" id="skills-title" className="text-h2 uppercase">
            One toolbox, the whole stack.
          </RevealText>
        </div>
        <p className="max-w-sm text-p2 text-muted lg:col-span-4 lg:justify-self-end">
          {total} tools across {skillGroups.length} disciplines, from Python services and Node APIs
          to React interfaces, cloud infrastructure and LLM features.
        </p>
      </div>

      <SkillMarquee className="my-14 md:my-28" />
      <div className="container-page">
        <SkillGroups />
      </div>
    </section>
  );
}
