import { gzipSync } from "node:zlib";

import { expect, test, type APIRequestContext } from "@playwright/test";

import { PAGE_ROUTES } from "../routes";

/** Gzipped JavaScript a page may load before any interaction, in kilobytes. */
const SCRIPT_BUDGET_KB = 330;

const SCRIPT_SRC = /<script\b[^>]*\bsrc="([^"]+)"/g;

async function getScriptKilobytes(request: APIRequestContext, path: string): Promise<number> {
  const html = await (await request.get(path)).text();
  const sources = new Set([...html.matchAll(SCRIPT_SRC)].flatMap(([, src]) => (src ? [src] : [])));
  let bytes = 0;

  for (const src of sources) {
    const response = await request.get(src);
    expect(response.status(), src).toBe(200);
    bytes += gzipSync(await response.body()).length;
  }

  return bytes / 1024;
}

test.describe("JavaScript budget", () => {
  for (const path of PAGE_ROUTES) {
    test(`${path} stays within ${SCRIPT_BUDGET_KB} KB of gzipped script`, async ({ request }) => {
      const kilobytes = await getScriptKilobytes(request, path);

      expect(
        kilobytes,
        "measured nothing, so the script pattern no longer matches",
      ).toBeGreaterThan(0);
      expect(kilobytes).toBeLessThanOrEqual(SCRIPT_BUDGET_KB);
    });
  }
});
