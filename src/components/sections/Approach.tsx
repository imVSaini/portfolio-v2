import { ScrubWords } from "@/components/motion/ScrubWords";
import { SectionLabel } from "@/components/ui/SectionLabel";

const MANIFESTO =
  "I care most about the parts of software nobody screenshots: the schema that survives its tenth tenant, the cache that keeps a dashboard honest, the retry that outlasts a vendor outage. Then I make the surface feel effortless, because the surface is all your users ever meet.";

const principles = [
  {
    title: "Data first, pixels second",
    body: "Schemas, contracts and boundaries come before components. Get those right and features stop fighting each other.",
    speed: "0.06",
  },
  {
    title: "Make failure boring",
    body: "Idempotent jobs, outboxes, rate limits and tests on every push. Incidents should be non-events, not war stories.",
    speed: "0.12",
  },
  {
    title: "Small, sharp, measured",
    body: "Small PRs, honest reviews and outcomes you can graph. Momentum is a feature, and so is knowing it worked.",
    speed: "0.03",
  },
  {
    title: "AI as leverage",
    body: "LLMs belong where they remove real toil, with typed tools, guardrails and a human approving every action.",
    speed: "0.09",
  },
] as const;

export function Approach() {
  return (
    <section
      id="approach"
      aria-labelledby="approach-title"
      className="relative container-page py-28 md:py-40"
    >
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-3">
          <SectionLabel>Approach</SectionLabel>
        </div>
        <div className="md:col-span-9">
          <h2 id="approach-title" className="sr-only">
            How I build
          </h2>
          <ScrubWords
            text={MANIFESTO}
            className="font-display text-h3 leading-[1.08] font-medium tracking-[-0.01em]"
          />
        </div>
      </div>

      <ul className="mt-24 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-start">
        {principles.map((item) => (
          <li
            key={item.title}
            data-scroll=""
            data-scroll-speed={item.speed}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-surface p-7 transition-colors duration-500 corner-squircle hover:border-line-strong lg:even:mt-16 dark:bg-soot/60"
          >
            <div className="flex flex-col gap-3">
              <h3 className="text-h4">{item.title}</h3>
              <p className="text-p3 text-muted">{item.body}</p>
            </div>
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-500 ease-out-expo group-hover:scale-x-100"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
