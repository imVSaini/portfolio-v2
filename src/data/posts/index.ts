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
import type {
  Post,
  PostArtName,
  PostBlock,
  PostDiagramName,
  PostSource,
} from "@/data/posts/schema";
import { serverComponents } from "@/data/posts/serverComponents";
import { supplyChainSecurity } from "@/data/posts/supplyChainSecurity";
import { zeroDowntimeMigrations } from "@/data/posts/zeroDowntimeMigrations";

export type { Post, PostArtName, PostBlock, PostDiagramName };

const WORDS_PER_MINUTE = 220;

function blockText(block: PostBlock) {
  if (block.type === "list") return block.items.join(" ");
  if (block.type === "code") return block.code;
  if (block.type === "diagram") return block.caption;
  return block.text;
}

function readMinutes(source: PostSource) {
  const words = source.body.map(blockText).join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

const sources: PostSource[] = [
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
export const posts: Post[] = sources
  .map((source) => ({ ...source, readMinutes: readMinutes(source) }))
  .sort((a, b) => b.date.localeCompare(a.date));
