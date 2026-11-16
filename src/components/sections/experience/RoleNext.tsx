import { TextLink } from "@/components/ui/TextLink";

export function RoleNext() {
  return (
    <li data-xp-role="" className="relative grid pt-20 pl-10 lg:grid-cols-4 lg:pl-0">
      <span
        data-xp-dot=""
        aria-hidden="true"
        className="absolute top-22 left-0 size-2.75 rounded-full border-2 border-manila-light bg-line-strong lg:left-1/4 dark:border-faded-black"
      />
      <p className="font-display text-p4 tracking-wide text-muted uppercase lg:pr-12">Next</p>
      <div className="flex flex-col items-start gap-5 lg:col-span-3 lg:pl-16" data-xp-item="">
        <h3 className="text-h3 uppercase">Your team?</h3>
        <p className="max-w-xl text-p1 text-muted">
          The next chapter is unwritten. Bring the hard problem and I’ll bring the plan.
        </p>
        <TextLink href="#contact">Let’s talk</TextLink>
      </div>
    </li>
  );
}
