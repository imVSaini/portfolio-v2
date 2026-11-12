import { RevealText } from "@/components/motion/RevealText";

export function Headline() {
  return (
    <h1 className="text-h1 uppercase">
      <RevealText as="span" on="load" delay={0.1} className="block">
        Backend depth,
      </RevealText>
      <span className="flex flex-wrap items-end gap-x-[0.18em]">
        <RevealText
          as="span"
          on="load"
          delay={0.22}
          className="block text-stroke-faded-black dark:text-stroke-manila-light"
        >
          frontend
        </RevealText>
        <RevealText as="span" on="load" delay={0.34} className="block text-accent">
          finish.
        </RevealText>
      </span>
    </h1>
  );
}
