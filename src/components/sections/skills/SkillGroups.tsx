import { skillGroups } from "@/data/skills";

export function SkillGroups() {
  return (
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
  );
}
