import { aiCodeReview } from "@/data/posts/aiCodeReview";
import { architectureDecisions } from "@/data/posts/architectureDecisions";
import { cellArchitecture } from "@/data/posts/cellArchitecture";
import { durableExecution } from "@/data/posts/durableExecution";
import { gracefulDegradation } from "@/data/posts/gracefulDegradation";
import { inpResponsiveness } from "@/data/posts/inpResponsiveness";
import { llmFeatures } from "@/data/posts/llmFeatures";
import { measuringEngineering } from "@/data/posts/measuringEngineering";
import { platformEngineering } from "@/data/posts/platformEngineering";
import { postgresDefault } from "@/data/posts/postgresDefault";
import { progressiveDelivery } from "@/data/posts/progressiveDelivery";
import { scalingFrontends } from "@/data/posts/scalingFrontends";
import type { Post, PostArtName, PostDiagramName } from "@/data/posts/schema";
import { serverComponents } from "@/data/posts/serverComponents";
import { supplyChainSecurity } from "@/data/posts/supplyChainSecurity";
import { zeroDowntimeMigrations } from "@/data/posts/zeroDowntimeMigrations";

export { POST_DIAGRAM_NAMES } from "@/data/posts/schema";
export type { Post, PostArtName, PostDiagramName };

const sources: Post[] = [
  cellArchitecture,
  llmFeatures,
  serverComponents,
  supplyChainSecurity,
  aiCodeReview,
  postgresDefault,
  durableExecution,
  inpResponsiveness,
  progressiveDelivery,
  measuringEngineering,
  zeroDowntimeMigrations,
  gracefulDegradation,
  scalingFrontends,
  platformEngineering,
  architectureDecisions,
];

/** Newest first. The first post is featured on the blog index. */
export const posts: Post[] = [...sources].sort((a, b) => b.date.localeCompare(a.date));
