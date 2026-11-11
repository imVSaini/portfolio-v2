import { posts } from "@/data/posts";
import { textResponse } from "@/lib/http";
import { getPostMarkdown } from "@/lib/llms";

export function generateStaticParams() {
  return posts.map(({ slug }) => ({ slug }));
}

export async function GET(_request: Request, { params }: RouteContext<"/blog/[slug]/index.md">) {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);
  if (!post) return new Response("Not found", { status: 404 });

  return textResponse(getPostMarkdown(post), {
    type: "markdown",
    canonical: `/blog/${post.slug}`,
  });
}
