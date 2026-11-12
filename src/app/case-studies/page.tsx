import type { Metadata } from "next";

import { CaseStudyEntry } from "@/components/caseStudies/CaseStudyEntry";
import { PageShell } from "@/components/layout/PageShell";
import { RevealText } from "@/components/motion/RevealText";
import { JsonLd } from "@/components/seo/JsonLd";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { feedAlternates } from "@/data/blog";
import { caseStudies, caseStudiesPage } from "@/data/caseStudies";
import { site } from "@/data/site";
import { getCaseStudiesJsonLd } from "@/lib/jsonLd";

const { title, description, path } = caseStudiesPage;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: path, types: feedAlternates },
  openGraph: {
    type: "website",
    url: path,
    title: `${title} — ${site.name}`,
    description,
    siteName: site.name,
    locale: "en_IN",
    images: [site.ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} — ${site.name}`,
    description,
    images: [site.ogImage],
  },
};

export default function CaseStudiesPage() {
  return (
    <>
      <JsonLd nodes={getCaseStudiesJsonLd(caseStudies)} />
      <PageShell>
        <main
          id="main"
          className="container-page flex flex-col gap-16 pt-34 pb-16 md:gap-24 md:pt-42 md:pb-40"
        >
          <div className="flex flex-col gap-6">
            <SectionLabel>{title}</SectionLabel>
            <RevealText as="h1" on="load" className="text-h2 uppercase">
              How it was{" "}
              <span className="text-stroke-faded-black dark:text-stroke-manila-light">built.</span>
            </RevealText>
            <p className="max-w-2xl text-p1 text-muted">
              Longer write-ups of products I have designed and built: the constraints, the
              architecture, the decisions that cost something and what I would change now.
            </p>
          </div>

          <ol className="flex flex-col gap-16 md:gap-24">
            {caseStudies.map((study, i) => (
              <li key={study.slug} className="border-t border-line pt-10 md:pt-14">
                <CaseStudyEntry study={study} position={i + 1} flipped={i % 2 === 1} />
              </li>
            ))}
          </ol>
        </main>
      </PageShell>
    </>
  );
}
