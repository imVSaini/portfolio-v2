import { DiagramFrame } from "@/components/article/DiagramFrame";
import { PostDiagramArt } from "@/components/blog/PostDiagramArt";
import type { PostDiagramName } from "@/data/posts";

const TITLES: Record<PostDiagramName, string> = {
  spectrum: "Architecture spectrum",
  gates: "Request gates",
  migration: "Expand, migrate, contract",
  layers: "Dependency direction",
  hosting: "A small production setup",
  queryPlan: "Query plan",
  waterfall: "Loading waterfall",
  signals: "Three signals, one ID",
  outboxFlow: "Sync chain vs outbox",
  reversal: "Cost of reversal",
};

type PostDiagramProps = {
  name: PostDiagramName;
  caption: string;
  /** Says what the drawing shows, for readers who cannot see it. */
  alt: string;
};

export function PostDiagram({ name, caption, alt }: PostDiagramProps) {
  return (
    <DiagramFrame title={TITLES[name]} caption={caption}>
      <PostDiagramArt name={name} alt={alt} className="w-full min-w-136" />
    </DiagramFrame>
  );
}
