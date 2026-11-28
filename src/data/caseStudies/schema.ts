import type { ProjectTint } from "@/data/projects";

/** Product mock-up drawn on the cover; each name maps to a drawing in `CaseStudyCover`. */
export type CaseStudyArtName = "pipeline" | "chat" | "ledger" | "parking";

/** Line drawings set inside a case study; each name maps to a drawing in `CaseStudyDiagram`. */
export const CASE_STUDY_DIAGRAM_NAMES = [
  "tenantRequest",
  "answerPath",
  "metaLeads",
  "leadCapture",
  "knowledgeBase",
  "bookingHold",
  "paymentPaths",
  "priceBuild",
  "statementImport",
  "documentBill",
  "magicLink",
] as const;

export type CaseStudyDiagramName = (typeof CASE_STUDY_DIAGRAM_NAMES)[number];

export type CaseStudyFact = {
  label: string;
  value: string;
};

export type CaseStudyMetric = {
  /** Short enough to set in display type, such as `80` or `60s`. */
  value: string;
  label: string;
};

export type CaseStudyDecision = {
  title: string;
  /** The situation that forced a choice. */
  context: string;
  chose: string;
  cost: string;
};

export type CaseStudy = {
  slug: string;
  title: string;
  category: string;
  /** One sentence under the title, on the index and on the study itself. */
  headline: string;
  /** Meta description and link-preview text. */
  summary: string;
  /** ISO date the write-up was published, `YYYY-MM-DD`. */
  date: `${number}-${number}-${number}`;
  tint: ProjectTint;
  art: CaseStudyArtName;
  facts: CaseStudyFact[];
  metrics: CaseStudyMetric[];
  stack: string[];
  /** Rendered where the body's `{% decisions /%}` tag sits. Fields may use inline Markdown. */
  decisions: CaseStudyDecision[];
};
