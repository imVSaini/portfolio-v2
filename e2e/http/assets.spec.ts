import { expect, test } from "@playwright/test";

import { posts } from "@/data/posts";
import { site } from "@/data/site";

const PNG_SIGNATURE = "89504e470d0a1a0a";

function readPngSize(body: Buffer): { width: number; height: number } {
  return { width: body.readUInt32BE(16), height: body.readUInt32BE(20) };
}

test.describe("static assets", () => {
  test("the default link-preview card is a PNG at the declared size", async ({ request }) => {
    const response = await request.get(site.ogImage.url);
    const body = await response.body();

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("image/png");
    expect(body.subarray(0, 8).toString("hex")).toBe(PNG_SIGNATURE);
    expect(readPngSize(body)).toEqual({ width: site.ogImage.width, height: site.ogImage.height });
  });

  test("the SVG icon is served", async ({ request }) => {
    const response = await request.get("/icon.svg");

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/svg+xml");
    expect(await response.text()).toContain("<svg");
  });

  test("the Apple touch icon is a 180px PNG", async ({ request }) => {
    const response = await request.get("/apple-icon.png");
    const body = await response.body();

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("image/png");
    expect(readPngSize(body)).toEqual({ width: 180, height: 180 });
  });
});

test.describe("generated link-preview cards", () => {
  for (const post of posts) {
    test(`${post.slug} has a 1200×630 card`, async ({ request }) => {
      const response = await request.get(`/blog/${post.slug}/opengraph-image/card`);
      const body = await response.body();

      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toBe("image/png");
      expect(body.subarray(0, 8).toString("hex")).toBe(PNG_SIGNATURE);
      expect(readPngSize(body)).toEqual({ width: 1200, height: 630 });
    });
  }
});
