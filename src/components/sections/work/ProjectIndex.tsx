import { Accordion } from "@base-ui/react/accordion";

import { ProjectCover } from "@/components/sections/work/ProjectCover";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import type { Project } from "@/data/projects";
import { cn } from "@/lib/cn";

type ProjectIndexProps = {
  projects: Project[];
  className?: string;
};

export function ProjectIndex({ projects, className }: ProjectIndexProps) {
  const [first] = projects;

  return (
    <Accordion.Root
      keepMounted
      {...(first && { defaultValue: [first.slug] })}
      className={cn("border-t border-line", className)}
    >
      {projects.map((project, i) => (
        <Accordion.Item key={project.slug} value={project.slug} className="border-b border-line">
          <Accordion.Header>
            <Accordion.Trigger className="group flex min-h-18 w-full cursor-pointer items-center gap-4 py-4 text-left">
              <span
                aria-hidden="true"
                className="w-6 shrink-0 self-start pt-1 font-display text-p4 font-medium text-accent tabular-nums"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="font-display text-h4 font-semibold uppercase">
                  {project.title}
                </span>
                <span className="text-p4 tracking-wide text-muted uppercase">
                  {project.category}
                </span>
              </span>
              <span
                aria-hidden="true"
                className="relative grid size-10 shrink-0 place-items-center rounded-full border border-line-strong transition-colors duration-300 group-data-panel-open:border-accent group-data-panel-open:bg-accent group-data-panel-open:text-faded-black"
              >
                <span className="absolute h-0.5 w-3.5 bg-current" />
                <span className="absolute h-3.5 w-0.5 bg-current transition-transform duration-300 ease-out-expo group-data-panel-open:scale-y-0 motion-reduce:transition-none" />
              </span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel className="h-(--accordion-panel-height) overflow-hidden transition-[height] duration-500 ease-out-expo motion-reduce:transition-none starting-style:h-0 ending-style:h-0">
            <div className="group flex flex-col gap-5 pt-1 pb-8">
              <ProjectCover project={project} className="aspect-4/3 max-h-[60svh]" />
              <div className="flex flex-col gap-2">
                <p className="text-p4 tracking-wide text-muted uppercase">{project.client}</p>
                <p className="text-p2 text-muted">{project.blurb}</p>
              </div>
              <ul className="flex flex-wrap gap-2">
                {project.stack.map((tool) => (
                  <li
                    key={tool}
                    className="rounded-full border border-line px-3 py-1 text-p4 text-muted"
                  >
                    {tool}
                  </li>
                ))}
              </ul>
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Visit ${project.title} live (opens in a new tab)`}
                className="inline-flex min-h-11 items-center gap-2 self-start font-display text-p3 font-medium uppercase underline decoration-line-strong underline-offset-6 intent:text-accent intent:decoration-accent"
              >
                Visit live <ArrowIcon />
              </a>
            </div>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
