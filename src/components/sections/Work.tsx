import { HorizontalSection } from "@/components/scroll/HorizontalSection";
import { ProjectCover } from "@/components/sections/work/ProjectCover";
import { ProjectIndex } from "@/components/sections/work/ProjectIndex";
import { ArrowIcon } from "@/components/ui/ArrowIcon";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { contact } from "@/data/contact";
import { projects, type Project } from "@/data/projects";

const github = contact.links.find((link) => link.label === "GitHub");

function ProjectPanel({ project }: { project: Project }) {
  return (
    <article
      data-h-panel=""
      className="group hidden min-w-0 flex-col gap-6 md:flex md:tall:motion-safe:h-[min(78svh,calc(48vw+16rem),50rem)] md:tall:motion-safe:w-[min(64vw,60rem)] md:tall:motion-safe:shrink-0"
    >
      <p className="font-display text-p4 text-muted uppercase">{project.category}</p>

      <ProjectCover
        project={project}
        className="aspect-video max-h-[60svh] md:tall:motion-safe:aspect-auto md:tall:motion-safe:max-h-none md:tall:motion-safe:flex-1"
      />

      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div className="flex flex-col gap-2" data-h-reveal="">
          <h3 className="text-h3 uppercase">{project.title}</h3>
          <p className="text-p4 tracking-wide text-muted uppercase">{project.client}</p>
          <p className="max-w-xl text-p3 text-muted">{project.blurb}</p>
        </div>
        <a
          href={project.url}
          target="_blank"
          rel="noreferrer"
          data-h-reveal=""
          className="inline-flex items-center gap-2 self-start justify-self-start py-2 font-display text-p3 font-medium uppercase underline decoration-line-strong underline-offset-6 md:self-end intent:text-accent intent:decoration-accent"
        >
          Visit live <ArrowIcon />
        </a>
      </div>
      <ul className="flex flex-wrap gap-2" data-h-reveal="">
        {project.stack.map((tool) => (
          <li key={tool} className="rounded-full border border-line px-3 py-1 text-p4 text-muted">
            {tool}
          </li>
        ))}
      </ul>
    </article>
  );
}

export function Work() {
  return (
    <HorizontalSection
      id="work"
      label="Selected work"
      className="py-16 md:py-24 md:tall:motion-safe:py-0"
    >
      <div className="flex flex-col gap-10 md:col-span-2 md:tall:motion-safe:w-[calc(var(--text-h2)*6.15)] md:tall:motion-safe:shrink-0 md:tall:motion-safe:justify-center md:tall:motion-safe:gap-8">
        <div className="flex flex-col gap-5">
          <SectionLabel>Selected work</SectionLabel>
          <h2 className="text-h2 uppercase">
            Seven builds,{" "}
            <span className="text-stroke-faded-black dark:text-stroke-manila-light">
              one standard.
            </span>
          </h2>
        </div>
        <p className="max-w-sm text-p2 text-muted">
          SaaS, conferences, commerce and studios. Each card opens the live site, so you can judge
          the real thing.
        </p>
        <p className="hidden items-center gap-3 font-display text-p4 text-muted uppercase md:tall:motion-safe:flex">
          Keep scrolling
          <ArrowIcon direction="right" />
        </p>
      </div>

      <ProjectIndex projects={projects} className="md:hidden" />

      {projects.map((project) => (
        <ProjectPanel key={project.slug} project={project} />
      ))}

      {github && (
        <div
          data-h-panel=""
          className="flex flex-col items-start justify-center gap-6 md:tall:motion-safe:w-[28vw] md:tall:motion-safe:shrink-0"
        >
          <p className="font-display text-h3 font-semibold uppercase" data-h-reveal="">
            More in the <span className="text-accent">workshop</span>.
          </p>
          <a
            href={github.href}
            target="_blank"
            rel="noreferrer"
            data-h-reveal=""
            className="inline-flex items-center gap-2 py-2 font-display text-p3 font-medium uppercase underline decoration-line-strong underline-offset-6 intent:text-accent intent:decoration-accent"
          >
            GitHub {github.handle} <ArrowIcon />
          </a>
        </div>
      )}
    </HorizontalSection>
  );
}
