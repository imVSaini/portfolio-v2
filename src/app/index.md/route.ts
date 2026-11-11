import { textResponse } from "@/lib/http";
import { getProfileMarkdown } from "@/lib/llms";

export function GET() {
  return textResponse(getProfileMarkdown(), { type: "markdown", canonical: "/" });
}
