import { site } from "@/data/site";
import { getProfileMarkdown } from "@/lib/llms";

export function GET() {
  return new Response(getProfileMarkdown(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Link: `<${site.url}>; rel="canonical"`,
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
