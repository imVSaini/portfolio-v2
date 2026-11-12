import { expect, test } from "@playwright/test";

import { MISSING_ROUTES, PAGE_ROUTES } from "../routes";

const SECURITY_HEADERS = {
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
  "permissions-policy": "camera=(), microphone=(), geolocation=(), browsing-topics=()",
} as const;

const HEADER_ROUTES = ["/", "/blog", "/privacy", "/rss.xml", "/robots.txt", "/og.png", "/nope"];

test.describe("page responses", () => {
  for (const path of PAGE_ROUTES) {
    test(`${path} responds with HTML`, async ({ request }) => {
      const response = await request.get(path);

      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("text/html");
      expect(await response.text()).toContain("<!DOCTYPE html>");
    });
  }

  for (const path of MISSING_ROUTES) {
    test(`${path} responds with a real 404`, async ({ request }) => {
      const response = await request.get(path);

      expect(response.status()).toBe(404);
      expect(response.headers()["content-type"]).toContain("text/html");
    });
  }

  test("an unmatched path server-renders the not-found page", async ({ request }) => {
    const html = await (await request.get("/nope")).text();

    expect(html).toContain("Error 404");
    expect(html).toContain('<meta name="robots" content="noindex"/>');
  });

  test("HEAD requests succeed without a body", async ({ request }) => {
    const response = await request.head("/");

    expect(response.status()).toBe(200);
    expect(await response.text()).toBe("");
  });
});

test.describe("security headers", () => {
  for (const path of HEADER_ROUTES) {
    test(`${path} carries the security headers`, async ({ request }) => {
      const headers = (await request.get(path)).headers();

      for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
        expect(headers[name], name).toBe(value);
      }
      expect(headers["x-powered-by"]).toBeUndefined();
    });
  }
});
