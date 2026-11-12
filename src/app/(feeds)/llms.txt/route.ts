import { textResponse } from "@/lib/http";
import { getLlmsTxt } from "@/lib/llms";

export function GET() {
  return textResponse(getLlmsTxt(), { type: "text" });
}
