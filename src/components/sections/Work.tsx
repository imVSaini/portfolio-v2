import { HorizontalSection } from "@/components/scroll/HorizontalSection";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { contact } from "@/data/contact";
import { projects, type Project, type ProjectTint } from "@/data/projects";
import { cn } from "@/lib/cn";

const tints: Record<ProjectTint, string> = {
  orange: "bg-orange text-faded-black",
  gold: "bg-gold text-faded-black",
  magenta: "bg-magenta text-manila-light",
  red: "bg-red text-manila-light",
  soot: "bg-soot text-manila-light",
};

const github = contact.links.find((link) => link.label === "GitHub");

function hostname(url: string) {
  return new URL(url).hostname.replace(/^www\./, "");
}

function ProjectPanel({ project }: { project: Project }) {
  return (
    <article
      data-h-panel=""
      className="group flex w-[86vw] shrink-0 snap-center flex-col gap-6 sm:w-[70vw] md:h-[78svh] md:w-[min(64vw,60rem)]"
    >
      <p className="font-display text-p4 text-muted uppercase">{project.category}</p>

      <a
        href={project.url}
        target="_blank"
        rel="noreferrer"
        aria-label={`Visit ${project.title} (opens in a new tab)`}
        className={cn(
          "relative block aspect-4/3 overflow-hidden rounded-2xl corner-squircle md:aspect-auto md:flex-1",
          tints[project.tint],
        )}
      >
        {/* Oversized title layer drifts against the travel direction. */}
        <div
          data-h-parallax="14"
          aria-hidden="true"
          className="absolute inset-y-0 -left-1/4 flex w-[150%] items-center justify-center"
        >
          <span className="font-display text-[clamp(5rem,16vw,15rem)] leading-none font-semibold whitespace-nowrap uppercase opacity-15">
            {project.title}
          </span>
        </div>

        {/* Faux browser window. */}
        <div className="absolute inset-x-[8%] top-[14%] bottom-0 flex flex-col overflow-hidden rounded-t-xl bg-manila-light text-faded-black shadow-2xl transition-transform duration-700 ease-out-expo group-hover:-translate-y-3 dark:bg-faded-black dark:text-manila-light">
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <span className="size-2.5 rounded-full bg-red" />
            <span className="size-2.5 rounded-full bg-gold" />
            <span className="size-2.5 rounded-full bg-manila-dark" />
            <span className="ml-3 truncate rounded-full bg-surface px-3 py-1 text-p4 text-muted">
              {hostname(project.url)}
            </span>
          </div>
          <div className="flex flex-1 flex-col justify-between gap-6 p-6 md:p-8">
            <div className="flex flex-col gap-3">
              <span className="h-2 w-1/3 rounded-full bg-line-strong" />
              <span className="h-2 w-1/2 rounded-full bg-line" />
            </div>
            <p className="font-display text-h3 leading-none font-semibold uppercase">
              {project.title}
            </p>
            <div className="grid grid-cols-3 gap-3">
              <span className="h-16 rounded-lg bg-surface" />
              <span className="h-16 rounded-lg bg-surface" />
              <span className="h-16 rounded-lg bg-accent/70" />
            </div>
          </div>
        </div>
      </a>

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
          className="inline-flex items-center gap-2 self-start font-display text-p3 font-medium uppercase underline decoration-line-strong underline-offset-6 md:self-end intent:text-accent intent:decoration-accent"
        >
          Visit live <span aria-hidden="true">↗</span>
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
    <HorizontalSection id="work" label="Selected work" className="py-24 md:py-0">
      <div className="flex w-[86vw] shrink-0 snap-start flex-col justify-center gap-8 sm:w-[60vw] md:w-[34vw] md:min-w-104">
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
        <p className="hidden items-center gap-3 font-display text-p4 text-muted uppercase md:flex">
          Keep scrolling <span aria-hidden="true">→</span>
        </p>
      </div>

      {projects.map((project) => (
        <ProjectPanel key={project.slug} project={project} />
      ))}

      {github && (
        <div
          data-h-panel=""
          className="flex w-[70vw] shrink-0 snap-center flex-col items-start justify-center gap-6 sm:w-[40vw] md:w-[28vw]"
        >
          <p className="font-display text-h3 font-semibold uppercase" data-h-reveal="">
            More in the <span className="text-accent">workshop</span>.
          </p>
          <a
            href={github.href}
            target="_blank"
            rel="noreferrer"
            data-h-reveal=""
            className="inline-flex items-center gap-2 font-display text-p3 font-medium uppercase underline decoration-line-strong underline-offset-6 intent:text-accent intent:decoration-accent"
          >
            GitHub {github.handle} <span aria-hidden="true">↗</span>
          </a>
        </div>
      )}
    </HorizontalSection>
  );
}
