import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleBody } from "@/components/article/ArticleBody";
import { ArticleShare } from "@/components/article/ArticleShare";
import { ArticleToc } from "@/components/article/ArticleToc";
import { CaseStudyBreadcrumbs } from "@/components/caseStudies/CaseStudyBreadcrumbs";
import { CaseStudyCover } from "@/components/caseStudies/CaseStudyCover";
import { CaseStudyDecisions } from "@/components/caseStudies/CaseStudyDecisions";
import { CaseStudyDiagram } from "@/components/caseStudies/CaseStudyDiagram";
import { CaseStudyEntry } from "@/components/caseStudies/CaseStudyEntry";
import { CaseStudyFacts } from "@/components/caseStudies/CaseStudyFacts";
import { CaseStudyMetrics } from "@/components/caseStudies/CaseStudyMetrics";
import { PageShell } from "@/components/layout/PageShell";
import { RevealText } from "@/components/motion/RevealText";
import { RollText } from "@/components/motion/RollText";
import { JsonLd } from "@/components/seo/JsonLd";
import { feedAlternates } from "@/data/blog";
import { caseStudies, caseStudiesPage, type CaseStudy } from "@/data/caseStudies";
import { site } from "@/data/site";
import { getCaseStudyHeadings, getCaseStudyPath, getNextCaseStudy } from "@/lib/caseStudies";
import { getCaseStudyJsonLd } from "@/lib/jsonLd";
import { getCaseStudyMarkdownPath } from "@/lib/llms";

/** Unlisted slugs wait for the full render, so a missing study returns a real 404 status. */
export const ensureStatic = "navigation";
export const instant = false;

function findCaseStudy(slug: string) {
  return caseStudies.find((study) => study.slug === slug);
}

export function generateStaticParams() {
  return caseStudies.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/case-studies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const study = findCaseStudy(slug);
  if (!study) return {};

  const url = getCaseStudyPath(study);
  const title = `${study.title} case study`;

  return {
    title,
    description: study.summary,
    alternates: {
      canonical: url,
      types: { ...feedAlternates, "text/markdown": getCaseStudyMarkdownPath(study) },
    },
    openGraph: {
      type: "article",
      url,
      title,
      description: study.summary,
      siteName: site.name,
      locale: "en_IN",
      publishedTime: study.date,
      authors: [site.name],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: study.summary,
    },
  };
}

export default async function CaseStudyPage({ params }: PageProps<"/case-studies/[slug]">) {
  const { slug } = await params;
  const study = findCaseStudy(slug);
  if (!study) notFound();

  return (
    <PageShell>
      <main id="main" className="container-page pt-28 pb-16 md:pt-34 md:pb-40">
        <div className="mx-auto flex max-w-7xl flex-col gap-20 md:gap-28">
          <CaseStudyContent study={study} />
        </div>
      </main>
    </PageShell>
  );
}

function CaseStudyContent({ study }: { study: CaseStudy }) {
  const next = getNextCaseStudy(study);

  return (
    <>
      <JsonLd nodes={getCaseStudyJsonLd(study)} />
      <article className="flex flex-col gap-10 md:gap-14">
        <header className="flex flex-col gap-6">
          <CaseStudyBreadcrumbs study={study} />
          <RevealText as="h1" on="load" className="text-h2 uppercase">
            {study.title}
          </RevealText>
          <p className="max-w-3xl text-p1 text-muted">{study.headline}</p>
        </header>

        <div className="flex flex-col">
          <CaseStudyFacts facts={study.facts} />
          <div className="grid gap-x-8 gap-y-3 border-b border-line py-6 lg:grid-cols-4">
            <p
              id="case-study-stack"
              className="font-display text-p4/7 font-medium tracking-wide text-muted uppercase"
            >
              Stack
            </p>
            <ul aria-labelledby="case-study-stack" className="flex flex-wrap gap-2 lg:col-span-3">
              {study.stack.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-line px-3 py-1 text-p4 text-muted"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <CaseStudyCover study={study} className="md:aspect-21/9" />

        <CaseStudyMetrics metrics={study.metrics} />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <aside className="lg:order-2 lg:col-span-3 lg:col-start-10">
            <div className="flex flex-col gap-10 lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
              <ArticleToc headings={getCaseStudyHeadings(study)} />
              <ArticleShare
                url={`${site.url}${getCaseStudyPath(study)}`}
                title={`${study.title} case study`}
                className="flex-col items-start border-t border-line pt-8"
              />
            </div>
          </aside>
          <div className="flex max-w-prose min-w-0 flex-col gap-6 text-prose lg:col-span-8">
            <ArticleBody blocks={study.overview} Diagram={CaseStudyDiagram} />
            <CaseStudyDecisions decisions={study.decisions} />
            <ArticleBody blocks={study.outcome} Diagram={CaseStudyDiagram} />
          </div>
        </div>
      </article>

      {next && (
        <section aria-labelledby="next-case-study" className="flex flex-col gap-10">
          <div className="flex items-baseline justify-between gap-6 border-t border-line pt-8">
            <h2 id="next-case-study" className="text-h4 uppercase">
              Next case study
            </h2>
            <Link
              href={caseStudiesPage.path}
              className="group inline-flex min-h-6 items-center font-display text-p4 font-medium tracking-wide uppercase"
            >
              <RollText text="All case studies" />
            </Link>
          </div>
          <CaseStudyEntry study={next} position={caseStudies.indexOf(next) + 1} as="h3" />
        </section>
      )}
    </>
  );
}
