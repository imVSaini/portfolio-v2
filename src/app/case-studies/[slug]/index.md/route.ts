import { caseStudies } from "@/data/caseStudies";
import { getCaseStudyPath } from "@/lib/caseStudies";
import { textResponse } from "@/lib/http";
import { getCaseStudyMarkdown } from "@/lib/llms";

export function generateStaticParams() {
  return caseStudies.map(({ slug }) => ({ slug }));
}

export async function GET(
  _request: Request,
  { params }: RouteContext<"/case-studies/[slug]/index.md">,
) {
  const { slug } = await params;
  const study = caseStudies.find((item) => item.slug === slug);
  if (!study) return new Response("Not found", { status: 404 });

  return textResponse(getCaseStudyMarkdown(study), {
    type: "markdown",
    canonical: getCaseStudyPath(study),
  });
}
