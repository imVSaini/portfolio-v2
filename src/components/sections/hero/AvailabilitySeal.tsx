import { Seal } from "@/components/ui/Seal";

const BADGE_ITEMS = ["Open to new opportunities", "Bengaluru"] as const;

export function AvailabilitySeal() {
  return (
    <div
      aria-hidden="true"
      data-hero-badge=""
      className="absolute top-[calc(var(--header-h)+2rem)] right-[4vw] hidden size-36 lg:block xl:size-44"
    >
      <div data-scroll="" data-scroll-speed="0.12" className="size-full">
        <Seal items={BADGE_ITEMS} className="size-full">
          ✳
        </Seal>
      </div>
    </div>
  );
}
