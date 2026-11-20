import { RevealText } from "@/components/motion/RevealText";
import { ApproachMotion } from "@/components/sections/approach/ApproachMotion";
import { Manifesto } from "@/components/sections/approach/Manifesto";
import { PrincipleCards } from "@/components/sections/approach/PrincipleCards";
import { SectionLabel } from "@/components/ui/SectionLabel";

export function Approach() {
  return (
    <ApproachMotion
      id="approach"
      aria-labelledby="approach-title"
      className="relative py-16 md:py-0"
    >
      <h2 id="approach-title" className="sr-only">
        How I build
      </h2>

      <div
        data-manifesto=""
        className="container-page flex flex-col gap-5 md:min-h-svh md:justify-center md:gap-9"
      >
        <SectionLabel>Approach</SectionLabel>
        <Manifesto />
      </div>

      <div className="container-page mt-32 md:mt-16">
        <div className="mb-14 grid gap-10 md:mb-20 lg:grid-cols-12 lg:items-end">
          <RevealText as="h3" className="text-h2 uppercase lg:col-span-8">
            Four rules I&nbsp;don’t break.
          </RevealText>
          <p className="max-w-sm text-p2 text-muted lg:col-span-4 lg:justify-self-end">
            The principles behind every system I’ve shipped, from the first schema to the on-call
            rota.
          </p>
        </div>

        <PrincipleCards />
      </div>
    </ApproachMotion>
  );
}
