import type { DiagramBlock, TextBlock } from "@/data/article";
import type { ProjectTint } from "@/data/projects";

/** Product mock-up drawn on the cover; each name maps to a drawing in `CaseStudyCover`. */
export type CaseStudyArtName = "pipeline" | "chat";

/** Line drawing set inside a case study; each name maps to a drawing in `CaseStudyDiagram`. */
export type CaseStudyDiagramName =
  "tenantRequest" | "answerPath" | "metaLeads" | "leadCapture" | "knowledgeBase";

export type CaseStudyBlock = TextBlock | DiagramBlock<CaseStudyDiagramName>;

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
  /** The situation that forced a choice. May wrap inline code in backticks. */
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
  /** Prose before the decisions: the problem, the constraints and the architecture. */
  overview: CaseStudyBlock[];
  decisions: CaseStudyDecision[];
  /** Prose after the decisions: where it stands and what would change. */
  outcome: CaseStudyBlock[];
};

export function diagram(name: CaseStudyDiagramName, caption: string, alt: string): CaseStudyBlock {
  return { type: "diagram", name, caption, alt };
}
