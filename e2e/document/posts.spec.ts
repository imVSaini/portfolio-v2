import { expect, test } from "@playwright/test";

import { contact } from "@/data/contact";
import { posts, type Post } from "@/data/posts";
import { site } from "@/data/site";
import { formatPostDate, getHeadingId } from "@/lib/posts";

import { getCanonical, getPostPath } from "../routes";

const RELATED_COUNT = 3;

function stripInlineCode(text: string): string {
  return text.replaceAll("`", "");
}

function getRelated(current: Post): Post[] {
  const others = posts.filter((post) => post.slug !== current.slug);
  return [
    ...others.filter((post) => post.topic === current.topic),
    ...others.filter((post) => post.topic !== current.topic),
  ].slice(0, RELATED_COUNT);
}

test.describe("post data", () => {
  test("slugs, titles and heading anchors are unique", () => {
    const slugs = posts.map((post) => post.slug);
    const titles = posts.map((post) => post.title);

    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(titles).size).toBe(titles.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    for (const post of posts) {
      const ids = post.body.flatMap((block) =>
        block.type === "heading" ? [getHeadingId(block.text)] : [],
      );

      expect(new Set(ids).size, post.slug).toBe(ids.length);
      expect(ids.every((id) => id.length > 0)).toBe(true);
    }
  });

  test("posts are ordered newest first and dated on real days", () => {
    const times = posts.map((post) => new Date(post.date).getTime());

    expect(times.every((time) => Number.isFinite(time))).toBe(true);
    expect(times).toEqual([...times].sort((a, b) => b - a));
    for (const post of posts) {
      expect(post.readMinutes, post.slug).toBeGreaterThan(0);
      if (post.updatedAt) expect(post.updatedAt >= post.date, post.slug).toBe(true);
    }
  });
});

for (const post of posts) {
  test.describe(getPostPath(post), () => {
    const headings = post.body.flatMap((block) => (block.type === "heading" ? [block.text] : []));

    test.beforeEach(async ({ page }) => {
      await page.goto(getPostPath(post));
    });

    test("opens with the title, breadcrumb, author, date and reading time", async ({ page }) => {
      const header = page.locator("main article > header");
      const crumbs = header.getByRole("navigation", { name: "Breadcrumb" });
      const date = header.locator("time").first();

      await expect(header.getByRole("heading", { level: 1 })).toHaveText(post.title);
      await expect(crumbs.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
      await expect(crumbs.getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog");
      await expect(crumbs.getByRole("listitem").last()).toHaveText(post.topic);
      await expect(header).toContainText(site.name);
      await expect(header).toContainText(`${post.readMinutes} min read`);
      await expect(date).toHaveAttribute("datetime", post.date);
      await expect(date).toHaveText(formatPostDate(post.date));
    });

    test("anchors every section and lists it in the table of contents", async ({ page }) => {
      const body = page.locator("main article");
      const toc = page.getByRole("navigation", { name: "On this page" }).getByRole("link");

      await expect(toc).toHaveCount(headings.length);
      for (const [index, heading] of headings.entries()) {
        const id = getHeadingId(heading);

        await expect(body.locator(`h2[id="${id}"]`)).toHaveText(heading);
        await expect(toc.nth(index)).toHaveAttribute("href", `#${id}`);
        await expect(toc.nth(index)).toContainText(heading);
      }
    });

    test("renders every paragraph, list and pull quote of the body", async ({ page }) => {
      const body = page.locator("main article");
      const paragraphs = await body.locator("p").allTextContents();
      const items = await body.locator("ul > li").allTextContents();
      const quotes = post.body.flatMap((block) => (block.type === "quote" ? [block.text] : []));

      for (const block of post.body) {
        if (block.type === "paragraph") {
          expect(paragraphs, block.text).toContain(stripInlineCode(block.text));
        }
        if (block.type === "list") {
          for (const item of block.items) expect(items, item).toContain(stripInlineCode(item));
        }
      }
      await expect(body.locator("blockquote")).toHaveText(quotes);
    });

    test("prints code samples line for line under their language", async ({ page }) => {
      const samples = post.body.flatMap((block) => (block.type === "code" ? [block] : []));
      const blocks = page.locator("main article figure").filter({ has: page.locator("pre") });

      await expect(blocks).toHaveCount(samples.length);
      for (const [index, sample] of samples.entries()) {
        const block = blocks.nth(index);
        const lines = await block.locator("pre code > span > span:last-child").allTextContents();

        await expect(block.locator("figcaption")).toContainText(sample.language);
        await expect(block.locator("pre")).toHaveAttribute(
          "aria-label",
          `${sample.language} code sample`,
        );
        await expect(block.locator("pre")).toHaveAttribute("tabindex", "0");
        await expect(block.getByRole("button", { name: "Copy" })).toBeVisible();
        expect(lines.map((line) => (line === " " ? "" : line)).join("\n")).toBe(sample.code);
      }
    });

    test("captions and describes every diagram", async ({ page }) => {
      const diagrams = post.body.flatMap((block) => (block.type === "diagram" ? [block] : []));
      const figures = page
        .locator("main article figure")
        .filter({ has: page.locator('[role="group"]') });

      await expect(figures).toHaveCount(diagrams.length);
      for (const [index, diagram] of diagrams.entries()) {
        const figure = figures.nth(index);

        await expect(figure.locator('[role="group"]')).toHaveAttribute(
          "aria-label",
          `Diagram: ${diagram.caption}`,
        );
        await expect(figure.locator('[role="group"]')).toHaveAttribute("tabindex", "0");
        await expect(figure.locator('svg[role="img"]')).toHaveAttribute("aria-label", diagram.alt);
        await expect(figure.locator("figcaption")).toHaveText(diagram.caption);
      }
    });

    test("offers sharing links for its canonical URL", async ({ page }) => {
      const url = encodeURIComponent(getCanonical(getPostPath(post)));
      const linkedIn = page.getByRole("link", { name: "Share on LinkedIn (opens in a new tab)" });
      const x = page.getByRole("link", { name: "Share on X (opens in a new tab)" });

      await expect(page.getByRole("button", { name: "Copy link" })).toBeVisible();
      await expect(linkedIn).toHaveAttribute(
        "href",
        `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      );
      await expect(x).toHaveAttribute(
        "href",
        `https://x.com/intent/tweet?url=${url}&text=${encodeURIComponent(post.title)}`,
      );
      for (const link of [linkedIn, x]) {
        await expect(link).toHaveAttribute("target", "_blank");
        await expect(link).toHaveAttribute("rel", /noreferrer/);
      }
    });

    test("closes with the author card", async ({ page }) => {
      const card = page.locator("main article footer");

      await expect(card).toContainText(site.name);
      await expect(card).toContainText(site.role);
      await expect(card.getByRole("link", { name: `Email ${site.name}` })).toHaveAttribute(
        "href",
        `mailto:${contact.email}`,
      );
      for (const link of contact.links) {
        await expect(
          card.getByRole("link", { name: `${site.name} on ${link.label} (opens in a new tab)` }),
        ).toHaveAttribute("href", link.href);
      }
    });

    test("suggests three other posts, same topic first", async ({ page }) => {
      const related = getRelated(post);
      const section = page.locator('section[aria-labelledby="more-posts"]');
      const links = section.getByRole("heading", { level: 3 }).getByRole("link");

      await expect(section.getByRole("heading", { level: 2 })).toHaveText("Keep reading");
      await expect(section.getByRole("link", { name: "All posts" })).toHaveAttribute(
        "href",
        "/blog",
      );
      await expect(links).toHaveText(related.map((item) => item.title));
      for (const [index, item] of related.entries()) {
        await expect(links.nth(index)).toHaveAttribute("href", getPostPath(item));
      }
      await expect(section.locator(`a[href="${getPostPath(post)}"]`)).toHaveCount(0);
    });
  });
}
