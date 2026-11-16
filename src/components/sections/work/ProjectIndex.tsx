import { Accordion } from "@base-ui/react/accordion";

import { ProjectCover } from "@/components/sections/work/ProjectCover";
import { TextLink } from "@/components/ui/TextLink";
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
                className="relative grid size-11 shrink-0 place-items-center text-muted transition-colors duration-300 group-data-panel-open:text-accent group-intent:text-accent"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  className="size-5"
                >
                  <path d="M1 10h18" />
                  <path
                    data-toggle-bar
                    d="M10 1v18"
                    className="origin-center transition-[scale] duration-500 ease-out-expo group-data-panel-open:scale-y-0 motion-reduce:transition-none"
                  />
                </svg>
              </span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel className="h-(--accordion-panel-height) overflow-hidden transition-[height] duration-500 ease-out-expo motion-reduce:transition-none starting-style:h-0 ending-style:h-0">
            <div data-project-card="" className="group relative flex flex-col gap-5 pt-1 pb-8">
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
              <TextLink
                href={project.url}
                external
                stretched
                label={`Visit ${project.title} live`}
                className="self-start focus-visible:after:-outline-offset-2"
              >
                Visit live
              </TextLink>
            </div>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
