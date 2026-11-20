import { DiagramFrame } from "@/components/article/DiagramFrame";
import { PostDiagramArt } from "@/components/blog/PostDiagramArt";
import type { PostDiagramName } from "@/data/posts";

const TITLES: Record<PostDiagramName, string> = {
  cellRouter: "Cells behind a router",
  shuffleShards: "Shuffle sharding",
  workflowSprawl: "A hand-rolled workflow",
  journalReplay: "Journal and replay",
  retryBudget: "Retries under load",
  degradeLadder: "Degradation levels",
  skipLocked: "A queue in Postgres",
  postgresEnvelope: "When to leave Postgres",
  lockQueue: "The lock queue",
  expandContract: "Expand and contract",
  ragPipeline: "Retrieval pipeline",
  toolLoop: "Tool-calling loop",
  serverTree: "Server and client components",
  streamingShell: "Shell, then streams",
  inpAnatomy: "Anatomy of an interaction",
  yieldChunks: "Yielding to input",
  moduleBoundaries: "Module boundaries",
  tokenLayers: "Design token layers",
  canarySteps: "Canary with analysis",
  deployRelease: "Deploy is not release",
  gitopsLoop: "The GitOps loop",
  goldenPath: "A golden path",
  supplyChain: "Threats and controls",
  signedBuild: "Keyless signing",
  doorTest: "Decision weight",
  rfcFlow: "From RFC to ADR",
  doraMetrics: "Five delivery metrics",
  aiAmplifier: "AI as an amplifier",
  reviewGates: "Gates before people",
  reviewAttention: "Where review time goes",
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
