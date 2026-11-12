import { textResponse } from "@/lib/http";
import { getLlmsFullTxt } from "@/lib/llms";

export function GET() {
  return textResponse(getLlmsFullTxt(), { type: "text" });
}
