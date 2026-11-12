import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";

import { OgCard } from "@/components/seo/OgCard";
import { caseStudies, caseStudiesPage } from "@/data/caseStudies";
import { site } from "@/data/site";
import { getOgFonts, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";

/** How many stack entries fit on the card's bottom line. */
const STACK_COUNT = 3;

function findCaseStudy(slug: string) {
  return caseStudies.find((study) => study.slug === slug);
}

export function generateImageMetadata({ params }: { params: { slug: string } }) {
  const study = findCaseStudy(params.slug);
  return [
    {
      id: "card",
      alt: study ? `${study.title} case study` : site.name,
      size: OG_SIZE,
      contentType: OG_CONTENT_TYPE,
    },
  ];
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = findCaseStudy(slug);
  if (!study) notFound();

  return new ImageResponse(
    <OgCard
      label={study.category}
      title={study.title}
      description={study.headline}
      meta={study.stack.slice(0, STACK_COUNT).join(" · ")}
      path={caseStudiesPage.path}
    />,
    { ...OG_SIZE, fonts: await getOgFonts() },
  );
}
