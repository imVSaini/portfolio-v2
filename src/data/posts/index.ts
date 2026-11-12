import { databasePerformance } from "@/data/posts/databasePerformance";
import { deliveryPipeline } from "@/data/posts/deliveryPipeline";
import { eventDriven } from "@/data/posts/eventDriven";
import { frontendArchitecture } from "@/data/posts/frontendArchitecture";
import { frontendPerformance } from "@/data/posts/frontendPerformance";
import { kubernetesFit } from "@/data/posts/kubernetesFit";
import { observability } from "@/data/posts/observability";
import { productionApis } from "@/data/posts/productionApis";
import type {
  Post,
  PostArtName,
  PostBlock,
  PostDiagramName,
  PostSource,
} from "@/data/posts/schema";
import { systemDesignTradeoffs } from "@/data/posts/systemDesignTradeoffs";
import { technicalDebt } from "@/data/posts/technicalDebt";

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
  systemDesignTradeoffs,
  productionApis,
  deliveryPipeline,
  frontendArchitecture,
  kubernetesFit,
  databasePerformance,
  frontendPerformance,
  observability,
  eventDriven,
  technicalDebt,
];

/** Newest first. The first post is featured on the blog index. */
export const posts: Post[] = sources
  .map((source) => ({ ...source, readMinutes: readMinutes(source) }))
  .sort((a, b) => b.date.localeCompare(a.date));
