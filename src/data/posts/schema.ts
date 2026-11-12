import type { DiagramBlock, TextBlock } from "@/data/article";
import type { ProjectTint } from "@/data/projects";

export type PostBlock = TextBlock | DiagramBlock<PostDiagramName>;

/** Line drawing set inside an article; each name maps to a drawing in `PostDiagram`. */
export type PostDiagramName =
  | "spectrum"
  | "gates"
  | "migration"
  | "layers"
  | "hosting"
  | "queryPlan"
  | "waterfall"
  | "signals"
  | "outboxFlow"
  | "reversal";

/** Line diagram drawn on the cover; each name maps to a drawing in `PostArt`. */
export type PostArtName =
  | "tradeoffs"
  | "gates"
  | "pipeline"
  | "layers"
  | "cluster"
  | "queryPlan"
  | "vitals"
  | "signals"
  | "events"
  | "debt";

export type PostSource = {
  slug: string;
  title: string;
  excerpt: string;
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
  body: PostBlock[];
};

export type Post = PostSource & {
  /** Derived from the word count of `body`. */
  readMinutes: number;
};

export function diagram(name: PostDiagramName, caption: string, alt: string): PostBlock {
  return { type: "diagram", name, caption, alt };
}
