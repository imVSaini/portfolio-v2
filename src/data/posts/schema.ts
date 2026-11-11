import type { ProjectTint } from "@/data/projects";

/** Paragraph and list text may wrap inline code in backticks. */
export type PostBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "code"; language: string; code: string };

/** Line diagram drawn on the cover; each name maps to a drawing in `PostArt`. */
export type PostArtName =
  | "tenants"
  | "cache"
  | "outbox"
  | "proposal"
  | "factors"
  | "widget"
  | "pyramid"
  | "timeline"
  | "review"
  | "tree";

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

export function h2(text: string): PostBlock {
  return { type: "heading", text };
}

export function p(text: string): PostBlock {
  return { type: "paragraph", text };
}

export function ul(...items: string[]): PostBlock {
  return { type: "list", items };
}

export function quote(text: string): PostBlock {
  return { type: "quote", text };
}

export function code(language: string, source: string): PostBlock {
  return { type: "code", language, code: source.trim() };
}
