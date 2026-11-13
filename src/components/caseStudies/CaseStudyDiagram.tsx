import { DiagramFrame } from "@/components/article/DiagramFrame";
import { CaseStudyDiagramArt } from "@/components/caseStudies/CaseStudyDiagramArt";
import type { CaseStudyDiagramName } from "@/data/caseStudies";

const TITLES: Record<CaseStudyDiagramName, string> = {
  tenantRequest: "One request, one schema",
  answerPath: "Path of a message",
  metaLeads: "Two signals, one lead",
  leadCapture: "Website lead capture",
  knowledgeBase: "From document to chunks",
  bookingHold: "Holding a space",
  paymentPaths: "Three ways to confirm",
  priceBuild: "How a price is built",
  statementImport: "From statement to ledger",
  documentBill: "From document to bill",
  magicLink: "A link that works once",
};

type CaseStudyDiagramProps = {
  name: CaseStudyDiagramName;
  caption: string;
  /** Says what the drawing shows, for readers who cannot see it. */
  alt: string;
};

export function CaseStudyDiagram({ name, caption, alt }: CaseStudyDiagramProps) {
  return (
    <DiagramFrame title={TITLES[name]} caption={caption}>
      <CaseStudyDiagramArt name={name} alt={alt} className="w-full min-w-136" />
    </DiagramFrame>
  );
}
