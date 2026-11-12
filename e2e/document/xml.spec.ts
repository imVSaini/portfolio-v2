import { expect, test, type Page } from "@playwright/test";

import { blog } from "@/data/blog";
import { posts } from "@/data/posts";

import { PAGE_ROUTES } from "../routes";

type Parsed = {
  error: string | null;
  root: string;
  counts: Record<string, number>;
};

async function parseXml(page: Page, xml: string, tags: string[]): Promise<Parsed> {
  return page.evaluate(
    ({ source, names }) => {
      const parsed = new DOMParser().parseFromString(source, "application/xml");
      return {
        error: parsed.querySelector("parsererror")?.textContent ?? null,
        root: parsed.documentElement.nodeName,
        counts: Object.fromEntries(
          names.map((name) => [name, parsed.getElementsByTagName(name).length]),
        ),
      };
    },
    { source: xml, names: tags },
  );
}

test.describe("XML documents", () => {
  test("the feed parses as RSS 2.0 with one item per post", async ({ page, request }) => {
    const xml = await (await request.get(blog.feedPath)).text();
    const feed = await parseXml(page, xml, ["channel", "item", "guid", "pubDate", "atom:link"]);

    expect(feed.error).toBeNull();
    expect(feed.root).toBe("rss");
    expect(xml).toContain('<rss version="2.0"');
    expect(feed.counts).toEqual({
      channel: 1,
      item: posts.length,
      guid: posts.length,
      pubDate: posts.length,
      "atom:link": 1,
    });
  });

  test("the sitemap parses as a urlset with one entry per page", async ({ page, request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    const sitemap = await parseXml(page, xml, ["url", "loc"]);

    expect(sitemap.error).toBeNull();
    expect(sitemap.root).toBe("urlset");
    expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(sitemap.counts).toEqual({ url: PAGE_ROUTES.length, loc: PAGE_ROUTES.length });
  });

  test("the site icon parses as SVG", async ({ page, request }) => {
    const xml = await (await request.get("/icon.svg")).text();
    const icon = await parseXml(page, xml, []);

    expect(icon.error).toBeNull();
    expect(icon.root).toBe("svg");
  });
});
