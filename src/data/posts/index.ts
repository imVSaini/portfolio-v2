import { auditTrail } from "@/data/posts/auditTrail";
import { authRecovery } from "@/data/posts/authRecovery";
import { cachingConsistency } from "@/data/posts/cachingConsistency";
import { clientBoundary } from "@/data/posts/clientBoundary";
import { codeReview } from "@/data/posts/codeReview";
import { llmGuardrails } from "@/data/posts/llmGuardrails";
import { publicWidget } from "@/data/posts/publicWidget";
import type { Post, PostArtName, PostBlock, PostSource } from "@/data/posts/schema";
import { schemaPerTenant } from "@/data/posts/schemaPerTenant";
import { testSuiteValue } from "@/data/posts/testSuiteValue";
import { vendorOutbox } from "@/data/posts/vendorOutbox";

export type { Post, PostArtName, PostBlock };

const WORDS_PER_MINUTE = 220;

function blockText(block: PostBlock) {
  if (block.type === "list") return block.items.join(" ");
  if (block.type === "code") return block.code;
  return block.text;
}

function readMinutes(source: PostSource) {
  const words = source.body.map(blockText).join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

const sources: PostSource[] = [
  schemaPerTenant,
  cachingConsistency,
  vendorOutbox,
  llmGuardrails,
  authRecovery,
  publicWidget,
  testSuiteValue,
  auditTrail,
  codeReview,
  clientBoundary,
];

/** Newest first. The first post is featured on the blog index. */
export const posts: Post[] = sources
  .map((source) => ({ ...source, readMinutes: readMinutes(source) }))
  .sort((a, b) => b.date.localeCompare(a.date));
