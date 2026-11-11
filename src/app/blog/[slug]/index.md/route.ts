import { posts } from "@/data/posts";
import { site } from "@/data/site";
import { getPostMarkdown } from "@/lib/llms";

export function generateStaticParams() {
  return posts.map(({ slug }) => ({ slug }));
}

export async function GET(_request: Request, { params }: RouteContext<"/blog/[slug]/index.md">) {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);
  if (!post) return new Response("Not found", { status: 404 });

  return new Response(getPostMarkdown(post), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Link: `<${site.url}/blog/${post.slug}>; rel="canonical"`,
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
