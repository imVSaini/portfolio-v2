import { DiagramCanvas, type DiagramArt } from "@/components/article/DiagramParts";
import { architectureDiagrams } from "@/components/blog/diagrams/architectureDiagrams";
import { backendDiagrams } from "@/components/blog/diagrams/backendDiagrams";
import { devopsDiagrams } from "@/components/blog/diagrams/devopsDiagrams";
import { frontendDiagrams } from "@/components/blog/diagrams/frontendDiagrams";
import { leadershipDiagrams } from "@/components/blog/diagrams/leadershipDiagrams";
import type { PostDiagramName } from "@/data/posts";

const diagrams: Record<PostDiagramName, DiagramArt> = {
  ...architectureDiagrams,
  ...backendDiagrams,
  ...frontendDiagrams,
  ...devopsDiagrams,
  ...leadershipDiagrams,
};

type PostDiagramArtProps = {
  name: PostDiagramName;
  /** Says what the drawing shows, for readers who cannot see it. */
  alt: string;
  className?: string;
};

export function PostDiagramArt({ name, alt, className }: PostDiagramArtProps) {
  const { height, Art } = diagrams[name];

  return (
    <DiagramCanvas height={height} alt={alt} {...(className && { className })}>
      <Art />
    </DiagramCanvas>
  );
}
