import { SparkIcon } from "@/components/ui/SparkIcon";
import type { Role } from "@/data/experience";

type RoleEntryProps = {
  role: Role;
};

export function RoleEntry({ role }: RoleEntryProps) {
  return (
    <li
      data-xp-role=""
      className="relative grid gap-8 pb-20 pl-10 last:pb-0 lg:grid-cols-4 lg:gap-0 lg:pl-0"
    >
      <span
        data-xp-dot=""
        aria-hidden="true"
        className="absolute top-2 left-0 size-2.75 rounded-full border-2 border-manila-light bg-line-strong lg:left-1/4 dark:border-faded-black"
      />

      {/* Sticky meta column. */}
      <div className="lg:pr-12">
        <div className="flex flex-col gap-4 lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
          <p className="font-display text-p4 tracking-wide text-muted uppercase tabular-nums">
            {role.start} — {role.end}
          </p>
          <p className="text-p3 text-muted">{role.location}</p>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:col-span-3 lg:pl-16">
        <div className="flex flex-col gap-2" data-xp-item="">
          <h3 className="text-h3 uppercase">{role.title}</h3>
          <p className="font-display text-p1 font-medium">
            <span className="text-muted">@</span> {role.company}
          </p>
        </div>
        <p className="max-w-2xl text-p1 text-muted" data-xp-item="">
          {role.summary}
        </p>
        <ul className="flex max-w-3xl flex-col border-t border-line">
          {role.highlights.map((highlight) => (
            <li
              key={highlight}
              data-xp-item=""
              className="flex gap-4 border-b border-line py-4 text-p2"
            >
              <span aria-hidden="true" className="flex h-lh shrink-0 items-center text-accent">
                <SparkIcon className="size-[0.7em]" />
              </span>
              {highlight}
            </li>
          ))}
        </ul>
        <ul className="flex flex-wrap gap-2" data-xp-item="">
          {role.stack.map((tool) => (
            <li
              key={tool}
              className="rounded-full bg-surface px-3 py-1 text-p4 text-muted dark:bg-soot"
            >
              {tool}
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}
