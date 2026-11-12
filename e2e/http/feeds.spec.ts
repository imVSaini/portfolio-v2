import { expect, test } from "@playwright/test";

import { blog } from "@/data/blog";
import { caseStudies } from "@/data/caseStudies";
import { contact } from "@/data/contact";
import { posts } from "@/data/posts";
import { site } from "@/data/site";

import { getCanonical, getCaseStudyPath, PAGE_ROUTES } from "../routes";

function matchAll(source: string, pattern: RegExp): string[] {
  return [...source.matchAll(pattern)].flatMap((match) => match[1] ?? []);
}

function decodeXml(text: string): string {
  return text
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&");
}

test.describe("rss.xml", () => {
  test("is served as a cacheable RSS document", async ({ request }) => {
    const response = await request.get(blog.feedPath);

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("application/rss+xml; charset=utf-8");
    expect(response.headers()["cache-control"]).toContain("max-age=3600");
    expect(await response.text()).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>\s*<rss /);
  });

  test("describes the channel", async ({ request }) => {
    const xml = await (await request.get(blog.feedPath)).text();
    const channel = xml.slice(0, xml.indexOf("<item>"));

    expect(channel).toContain(`<title>${blog.title} — ${site.name}</title>`);
    expect(channel).toContain(`<link>${site.url}/blog</link>`);
    expect(channel).toContain("<language>en-IN</language>");
    expect(channel).toContain(`<description>${blog.description}</description>`);
    expect(channel).toMatch(
      new RegExp(`<atom:link href="${site.url}${blog.feedPath}" rel="self" type="[^"]+" />`),
    );
  });

  test("lists every post once, newest first, in site order", async ({ request }) => {
    const xml = await (await request.get(blog.feedPath)).text();
    const links = matchAll(xml, /<item>\s*<title>[^<]*<\/title>\s*<link>([^<]+)<\/link>/g);
    const dates = matchAll(xml, /<item>[\s\S]*?<pubDate>([^<]+)<\/pubDate>/g).map((date) =>
      new Date(date).getTime(),
    );

    expect(links).toEqual(posts.map((post) => `${site.url}/blog/${post.slug}`));
    expect(dates.every((date) => Number.isFinite(date))).toBe(true);
    expect(dates).toEqual([...dates].sort((a, b) => b - a));
  });

  test("gives each item a permalink, date, author, topic and full content", async ({ request }) => {
    const xml = await (await request.get(blog.feedPath)).text();
    const items = matchAll(xml, /<item>([\s\S]*?)<\/item>/g);

    expect(items).toHaveLength(posts.length);
    for (const [index, post] of posts.entries()) {
      const item = items[index] ?? "";
      const url = `${site.url}/blog/${post.slug}`;

      expect(decodeXml(item)).toContain(`<title>${post.title}</title>`);
      expect(item).toContain(`<guid isPermaLink="true">${url}</guid>`);
      expect(item).toContain(`<pubDate>${new Date(post.date).toUTCString()}</pubDate>`);
      expect(item).toContain(`<dc:creator>${site.name}</dc:creator>`);
      expect(decodeXml(item)).toContain(`<category>${post.topic}</category>`);
      expect(decodeXml(item)).toContain(post.excerpt);
      expect(item).toMatch(/<content:encoded>[\s\S]+<\/content:encoded>/);
    }
  });

  test("escapes markup inside content", async ({ request }) => {
    const xml = await (await request.get(blog.feedPath)).text();
    const bodies = matchAll(xml, /<content:encoded>([\s\S]*?)<\/content:encoded>/g);

    for (const body of bodies) {
      const cdata = body.startsWith("<![CDATA[");
      expect(cdata || !/<(?!!\[CDATA\[)/.test(body)).toBe(true);
    }
  });
});

test.describe("sitemap.xml", () => {
  test("is served as XML", async ({ request }) => {
    const response = await request.get("/sitemap.xml");

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/xml");
  });

  test("lists exactly the indexable pages with canonical URLs", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    const locations = matchAll(xml, /<loc>([^<]+)<\/loc>/g);

    expect([...locations].sort()).toEqual(PAGE_ROUTES.map(getCanonical).sort());
    expect(new Set(locations).size).toBe(locations.length);
  });

  test("gives every post an entry and dates the edited ones", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    const entries = matchAll(xml, /<url>([\s\S]*?)<\/url>/g);

    for (const post of posts) {
      const entry = entries.find((item) => item.includes(`/blog/${post.slug}</loc>`));
      const [modified] = matchAll(entry ?? "", /<lastmod>([^<]+)<\/lastmod>/g);

      expect(entry, post.slug).toBeDefined();
      if (post.updatedAt) expect(modified?.slice(0, 10)).toBe(post.updatedAt);
    }
  });
});

test.describe("robots.txt", () => {
  test("allows crawling and points at the sitemap", async ({ request }) => {
    const response = await request.get("/robots.txt");
    const lines = (await response.text()).split("\n").map((line) => line.trim());

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("text/plain");
    expect(lines).toContain("User-Agent: *");
    expect(lines).toContain("Allow: /");
    expect(lines).toContain(`Sitemap: ${site.url}/sitemap.xml`);
    expect(lines.some((line) => line.startsWith("Disallow: /"))).toBe(false);
  });
});

test.describe("llms.txt", () => {
  test("indexes the profile, every case study and every post as Markdown", async ({ request }) => {
    const response = await request.get("/llms.txt");
    const text = await response.text();

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("text/plain; charset=utf-8");
    expect(text.startsWith(`# ${site.name}\n`)).toBe(true);
    expect(text).toContain("## Profile");
    expect(text).toContain("## Blog");
    expect(text).toContain("## Case studies");
    expect(text).toContain("## Optional");
    expect(text).toContain(`(${site.url}/index.md)`);
    for (const post of posts) {
      expect(text).toContain(`[${post.title}](${site.url}/blog/${post.slug}/index.md)`);
    }
    for (const study of caseStudies) {
      expect(text).toContain(
        `[${study.title}](${getCanonical(getCaseStudyPath(study))}/index.md): ${study.headline}`,
      );
    }
    for (const link of contact.links) {
      expect(text).toContain(link.href);
    }
  });

  test("llms-full.txt carries the profile and the full text of every study and post", async ({
    request,
  }) => {
    const response = await request.get("/llms-full.txt");
    const text = await response.text();

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("text/plain; charset=utf-8");
    expect(text.startsWith(`# ${site.fullName}\n`)).toBe(true);
    for (const study of caseStudies) {
      expect(text).toContain(`# ${study.title} case study`);
      for (const decision of study.decisions) {
        expect(text).toContain(`### ${decision.title}`);
      }
    }
    for (const post of posts) {
      expect(text).toContain(`# ${post.title}`);
      for (const block of post.body) {
        if (block.type === "heading") expect(text).toContain(`## ${block.text}`);
      }
    }
  });
});
