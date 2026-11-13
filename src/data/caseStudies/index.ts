import { bookkeepingPlatform } from "@/data/caseStudies/bookkeepingPlatform";
import { leadCrm } from "@/data/caseStudies/leadCrm";
import { parkingMarketplace } from "@/data/caseStudies/parkingMarketplace";
import type {
  CaseStudy,
  CaseStudyArtName,
  CaseStudyBlock,
  CaseStudyDecision,
  CaseStudyDiagramName,
  CaseStudyFact,
  CaseStudyMetric,
} from "@/data/caseStudies/schema";
import { supportAssistant } from "@/data/caseStudies/supportAssistant";
import { site } from "@/data/site";

export type {
  CaseStudy,
  CaseStudyArtName,
  CaseStudyBlock,
  CaseStudyDecision,
  CaseStudyDiagramName,
  CaseStudyFact,
  CaseStudyMetric,
};

export const caseStudiesPage = {
  title: "Case studies",
  path: "/case-studies",
  description: `Case studies by ${site.name}: how real SaaS products were designed and built, the architecture behind them, the trade-offs taken and what each one cost.`,
} as const;

/** In display order. Each study links on to the one after it. */
export const caseStudies: CaseStudy[] = [
  supportAssistant,
  leadCrm,
  bookkeepingPlatform,
  parkingMarketplace,
];
