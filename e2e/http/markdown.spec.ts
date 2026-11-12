import { expect, test } from "@playwright/test";

import { posts } from "@/data/posts";
import { site } from "@/data/site";

import { getFirstPost } from "../routes";

const MARKDOWN = "text/markdown; charset=utf-8";

test.describe("markdown twins", () => {
  test("/index.md serves the profile with a canonical link", async ({ request }) => {
    const response = await request.get("/index.md");
    const headers = response.headers();

    expect(response.status()).toBe(200);
    expect(headers["content-type"]).toBe(MARKDOWN);
    expect(headers["vary"]).toContain("Accept");
    expect(headers["link"]).toBe(`<${new URL(site.url).href}>; rel="canonical"`);
    expect((await response.text()).startsWith(`# ${site.fullName}\n`)).toBe(true);
  });

  for (const post of posts) {
    test(`/blog/${post.slug}/index.md serves the post`, async ({ request }) => {
      const response = await request.get(`/blog/${post.slug}/index.md`);
      const headers = response.headers();
      const text = await response.text();
      const url = `${site.url}/blog/${post.slug}`;

      expect(response.status()).toBe(200);
      expect(headers["content-type"]).toBe(MARKDOWN);
      expect(headers["vary"]).toContain("Accept");
      expect(headers["link"]).toBe(`<${url}>; rel="canonical"`);
      expect(text.startsWith(`# ${post.title}\n`)).toBe(true);
      expect(text).toContain(`> ${post.excerpt}`);
      expect(text).toContain(`Canonical: ${url}`);
      expect(text).toContain(`${post.readMinutes} min read`);
      for (const block of post.body) {
        if (block.type === "heading") expect(text).toContain(`## ${block.text}`);
        if (block.type === "code") expect(text).toContain("```" + block.language);
      }
    });
  }

  test("an unknown post has no markdown twin", async ({ request }) => {
    const response = await request.get("/blog/nope/index.md");

    expect(response.status()).toBe(404);
    expect(response.headers()["content-type"]).toContain("text/plain");
  });
});

test.describe("content negotiation", () => {
  const post = getFirstPost();
  const cases = [
    { path: "/", twin: "/index.md" },
    { path: `/blog/${post.slug}`, twin: `/blog/${post.slug}/index.md` },
  ];

  for (const { path, twin } of cases) {
    test(`${path} returns Markdown when the client asks for it`, async ({ request }) => {
      const negotiated = await request.get(path, { headers: { Accept: "text/markdown" } });
      const direct = await request.get(twin);

      expect(negotiated.status()).toBe(200);
      expect(negotiated.headers()["content-type"]).toBe(MARKDOWN);
      expect(negotiated.headers()["vary"]).toContain("Accept");
      expect(await negotiated.text()).toBe(await direct.text());
    });

    test(`${path} returns HTML to browsers`, async ({ request }) => {
      const response = await request.get(path, {
        headers: { Accept: "text/html,application/xhtml+xml,*/*;q=0.8" },
      });

      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("text/html");
    });
  }

  test("pages without a twin ignore the Markdown preference", async ({ request }) => {
    const response = await request.get("/privacy", { headers: { Accept: "text/markdown" } });

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("text/html");
  });
});
