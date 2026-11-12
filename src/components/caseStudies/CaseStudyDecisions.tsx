import type { CaseStudyDecision } from "@/data/caseStudies";
import { getHeadingId } from "@/lib/article";
import { DECISIONS_HEADING } from "@/lib/caseStudies";

function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split("`").map((part, i) =>
        i % 2 === 1 ? (
          <code
            key={i}
            className="rounded-md border border-line bg-surface px-1.5 py-0.5 font-mono text-[0.85em]"
          >
            {part}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}

const term = "font-display text-p4 font-medium tracking-wide text-muted uppercase";

export function CaseStudyDecisions({ decisions }: { decisions: CaseStudyDecision[] }) {
  return (
    <section
      aria-labelledby={getHeadingId(DECISIONS_HEADING)}
      className="flex min-w-0 flex-col gap-6"
    >
      <h2 id={getHeadingId(DECISIONS_HEADING)} className="mt-6 scroll-mt-8 text-h4">
        {DECISIONS_HEADING}
      </h2>

      <ol className="flex flex-col">
        {decisions.map((decision, i) => (
          <li
            key={decision.title}
            className="flex flex-col gap-5 border-t border-line py-8 last:border-b sm:flex-row sm:gap-8"
          >
            <span
              aria-hidden="true"
              className="font-display text-p2 leading-[1.6] font-medium text-accent tabular-nums sm:w-8 sm:shrink-0"
            >
              {String(i + 1).padStart(2, "0")}
            </span>

            <div className="flex min-w-0 flex-col gap-5">
              <h3 className="font-display text-[1.375rem] leading-tight font-semibold text-balance">
                {decision.title}
              </h3>
              <p>
                <Inline text={decision.context} />
              </p>
              <dl className="grid gap-6 text-p2 sm:grid-cols-2 sm:gap-8">
                <div className="flex flex-col gap-2 border-t-2 border-accent pt-4">
                  <dt className={term}>What I chose</dt>
                  <dd>
                    <Inline text={decision.chose} />
                  </dd>
                </div>
                <div className="flex flex-col gap-2 border-t-2 border-line-strong pt-4">
                  <dt className={term}>What it cost</dt>
                  <dd className="text-muted">
                    <Inline text={decision.cost} />
                  </dd>
                </div>
              </dl>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
