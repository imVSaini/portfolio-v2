import type { Project, ProjectTint } from "@/data/projects";
import { cn } from "@/lib/cn";

const tints: Record<ProjectTint, string> = {
  orange: "bg-orange text-faded-black",
  gold: "bg-gold text-faded-black",
  magenta: "bg-magenta text-manila-light",
  red: "bg-red text-manila-light",
  soot: "bg-soot text-manila-light",
};

function hostname(url: string) {
  return new URL(url).hostname.replace(/^www\./, "");
}

type ProjectCoverProps = {
  project: Project;
  className?: string;
};

export function ProjectCover({ project, className }: ProjectCoverProps) {
  return (
    <a
      href={project.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`Visit ${project.title} (opens in a new tab)`}
      className={cn(
        "@container relative block overflow-hidden rounded-2xl corner-squircle",
        tints[project.tint],
        className,
      )}
    >
      {/* Oversized title layer drifts against the travel direction. */}
      <div
        data-h-parallax="14"
        aria-hidden="true"
        className="absolute inset-y-0 -left-1/4 flex w-3/2 items-center justify-center"
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
        <div className="flex flex-1 flex-col justify-between gap-[clamp(0.75rem,3.6cqw,1.5rem)] p-[clamp(1rem,4.8cqw,2rem)]">
          <div className="flex flex-col gap-3">
            <span className="h-2 w-1/3 rounded-full bg-line-strong" />
            <span className="h-2 w-1/2 rounded-full bg-line" />
          </div>
          <p className="font-display text-[clamp(1rem,5.625cqw,3.25rem)] leading-none font-semibold uppercase">
            {project.title}
          </p>
          <div className="grid grid-cols-3 gap-3">
            <span className="h-[clamp(2rem,9.8cqw,4rem)] rounded-lg bg-surface" />
            <span className="h-[clamp(2rem,9.8cqw,4rem)] rounded-lg bg-surface" />
            <span className="h-[clamp(2rem,9.8cqw,4rem)] rounded-lg bg-accent/70" />
          </div>
        </div>
      </div>
    </a>
  );
}
