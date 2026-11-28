import type { ProjectTint } from "@/data/projects";

/** Line drawings set inside an article; each name maps to a drawing in `PostDiagram`. */
export const POST_DIAGRAM_NAMES = [
  "cellRouter",
  "shuffleShards",
  "workflowSprawl",
  "journalReplay",
  "retryBudget",
  "degradeLadder",
  "skipLocked",
  "postgresEnvelope",
  "lockQueue",
  "expandContract",
  "ragPipeline",
  "toolLoop",
  "serverTree",
  "streamingShell",
  "inpAnatomy",
  "yieldChunks",
  "moduleBoundaries",
  "tokenLayers",
  "canarySteps",
  "deployRelease",
  "gitopsLoop",
  "goldenPath",
  "supplyChain",
  "signedBuild",
  "doorTest",
  "rfcFlow",
  "doraMetrics",
  "aiAmplifier",
  "reviewGates",
  "reviewAttention",
] as const;

export type PostDiagramName = (typeof POST_DIAGRAM_NAMES)[number];

/** Line diagram drawn on the cover; each name maps to a drawing in `PostArt`. */
export type PostArtName =
  | "cells"
  | "journal"
  | "shedding"
  | "postgres"
  | "schema"
  | "retrieval"
  | "tree"
  | "frames"
  | "modules"
  | "canary"
  | "paved"
  | "chain"
  | "doors"
  | "gauges"
  | "review";

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  /** Search-result title, 39 characters at most so it fits 55 with the ` — {site.name}` suffix. */
  metaTitle: string;
  /** Meta description and link-preview text, 155 characters at most. */
  metaDescription: string;
  topic: string;
  /** ISO date, `YYYY-MM-DD`. */
  date: `${number}-${number}-${number}`;
  /** Actual date of the latest substantive revision, when tracked, as `YYYY-MM-DD`. */
  updatedAt?: `${number}-${number}-${number}`;
  /** Backdrop of the generated cover, used until `cover` is set. */
  tint: ProjectTint;
  art: PostArtName;
  /** Bucket path of the cover image, such as `/blog/outbox.webp`. */
  cover?: `/${string}`;
};
