import { expect, test, type Page } from "@playwright/test";

import { blog } from "@/data/blog";
import { posts } from "@/data/posts";
import { site } from "@/data/site";

import { getCanonical, getFirstPost, getPostPath, PAGE_ROUTES, STATIC_ROUTES } from "../routes";

type PageMeta = {
  path: string;
  title: string;
  socialTitle: string;
  description?: string;
};

const HOME_TITLE = `${site.name} — ${site.role}`;
const DEFAULT_CARD = `${site.url}${site.ogImage.url}`;
const FEED_TITLE = `${blog.title} — ${site.name}`;

const STATIC_PAGES: PageMeta[] = [
  { path: "/", title: HOME_TITLE, socialTitle: HOME_TITLE, description: site.description },
  { path: "/blog", title: FEED_TITLE, socialTitle: FEED_TITLE, description: blog.description },
  {
    path: "/privacy",
    title: `Privacy policy — ${site.name}`,
    socialTitle: `Privacy policy — ${site.name}`,
  },
];

const POST_PAGES: PageMeta[] = posts.map((post) => ({
  path: getPostPath(post),
  title: `${post.title} — ${site.name}`,
  socialTitle: post.title,
  description: post.excerpt,
}));

function meta(page: Page, key: string) {
  const attribute = key.startsWith("og:") || key.startsWith("article:") ? "property" : "name";
  return page.locator(`head meta[${attribute}="${key}"]`);
}

async function content(page: Page, key: string): Promise<string> {
  return (await meta(page, key).getAttribute("content")) ?? "";
}

test.describe("document metadata", () => {
  for (const { path, title, socialTitle, description } of [...STATIC_PAGES, ...POST_PAGES]) {
    test.describe(path, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(path);
      });

      test("has a unique title, description and canonical URL", async ({ page }) => {
        await expect(page).toHaveTitle(title);
        await expect(page.locator("head title")).toHaveCount(1);
        await expect(meta(page, "description")).toHaveCount(1);
        await expect(meta(page, "description")).toHaveAttribute("content", description ?? /\S{3}/);
        await expect(page.locator('head link[rel="canonical"]')).toHaveCount(1);
        await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute(
          "href",
          getCanonical(path),
        );
        await expect(meta(page, "robots")).toHaveCount(0);
      });

      test("declares its language, viewport and colour schemes", async ({ page }) => {
        await expect(page.locator("html")).toHaveAttribute("lang", "en");
        await expect(page.locator("head meta[charset]")).toHaveAttribute("charset", /utf-8/i);
        await expect(meta(page, "viewport")).toHaveAttribute(
          "content",
          "width=device-width, initial-scale=1",
        );
        await expect(meta(page, "color-scheme")).toHaveAttribute("content", "light dark");
        await expect(meta(page, "theme-color")).toHaveAttribute("content", /^#[0-9a-f]{6}$/);
        await expect(meta(page, "author")).toHaveAttribute("content", site.name);
      });

      test("describes itself to link previews", async ({ page }) => {
        const pageDescription = await content(page, "description");

        await expect(meta(page, "og:title")).toHaveAttribute("content", socialTitle);
        await expect(meta(page, "og:description")).toHaveAttribute("content", pageDescription);
        await expect(meta(page, "og:url")).toHaveAttribute("content", getCanonical(path));
        await expect(meta(page, "og:site_name")).toHaveAttribute("content", site.name);
        await expect(meta(page, "og:locale")).toHaveAttribute("content", "en_IN");
        await expect(meta(page, "og:image:width")).toHaveAttribute("content", "1200");
        await expect(meta(page, "og:image:height")).toHaveAttribute("content", "630");
        await expect(meta(page, "og:image:alt")).toHaveAttribute("content", /\S{3}/);
        await expect(meta(page, "twitter:card")).toHaveAttribute("content", "summary_large_image");
        await expect(meta(page, "twitter:title")).toHaveAttribute("content", socialTitle);
        await expect(meta(page, "twitter:description")).toHaveAttribute("content", pageDescription);
        await expect(meta(page, "twitter:image")).toHaveAttribute(
          "content",
          await content(page, "og:image"),
        );
      });

      test("advertises the blog feed", async ({ page }) => {
        const feed = page.locator('head link[rel="alternate"][type="application/rss+xml"]');

        await expect(feed).toHaveCount(1);
        await expect(feed).toHaveAttribute("href", blog.feedUrl);
        await expect(feed).toHaveAttribute("title", FEED_TITLE);
      });

      test("keeps metadata out of the body and has one main heading", async ({ page }) => {
        await expect(page.locator("body meta, body title, body link[rel='canonical']")).toHaveCount(
          0,
        );
        await expect(page.locator("h1")).toHaveCount(1);
      });
    });
  }

  for (const path of STATIC_ROUTES) {
    test(`${path} is a website page with the default preview card`, async ({ page }) => {
      await page.goto(path);

      await expect(meta(page, "og:type")).toHaveAttribute("content", "website");
      await expect(meta(page, "og:image")).toHaveAttribute("content", DEFAULT_CARD);
      await expect(meta(page, "og:image:alt")).toHaveAttribute("content", site.ogImage.alt);
    });
  }

  for (const post of posts) {
    test(`${getPostPath(post)} is an article with its own preview card`, async ({ page }) => {
      const url = getCanonical(getPostPath(post));
      await page.goto(getPostPath(post));

      await expect(meta(page, "og:type")).toHaveAttribute("content", "article");
      await expect(meta(page, "article:published_time")).toHaveAttribute("content", post.date);
      await expect(meta(page, "article:author")).toHaveAttribute("content", site.name);
      await expect(meta(page, "og:image:alt")).toHaveAttribute("content", post.title);
      await expect(meta(page, "og:image:type")).toHaveAttribute("content", "image/png");
      expect(await content(page, "og:image")).toMatch(
        new RegExp(`^${url}/opengraph-image/card(\\?\\w+)?$`),
      );
      await expect(
        page.locator('head link[rel="alternate"][type="text/markdown"]'),
      ).toHaveAttribute("href", `${url}/index.md`);
    });
  }

  test("only pages with a Markdown twin advertise one", async ({ page }) => {
    const twin = page.locator('head link[rel="alternate"][type="text/markdown"]');

    await page.goto("/");
    await expect(twin).toHaveAttribute("href", `${site.url}/index.md`);

    for (const path of ["/blog", "/privacy"]) {
      await page.goto(path);
      await expect(twin).toHaveCount(0);
    }
  });

  test("no two pages share a title or a description", async ({ page }) => {
    const titles: string[] = [];
    const descriptions: string[] = [];

    for (const path of PAGE_ROUTES) {
      await page.goto(path);
      titles.push(await page.title());
      descriptions.push(await content(page, "description"));
    }

    expect(new Set(titles).size).toBe(PAGE_ROUTES.length);
    expect(new Set(descriptions).size).toBe(PAGE_ROUTES.length);
  });

  test("preview cards and icons resolve on this host", async ({ page, request }) => {
    for (const path of ["/", getPostPath(getFirstPost())]) {
      await page.goto(path);
      const card = new URL(await content(page, "og:image"));
      const icon = (await page.locator('head link[rel="icon"]').getAttribute("href")) ?? "";
      const touch =
        (await page.locator('head link[rel="apple-touch-icon"]').getAttribute("href")) ?? "";

      for (const target of [`${card.pathname}${card.search}`, icon, touch]) {
        const response = await request.get(target);
        expect(response.status(), target).toBe(200);
        expect(response.headers()["content-type"], target).toMatch(/^image\//);
      }
    }
  });

  test("the not-found page is kept out of search indexes", async ({ page }) => {
    const response = await page.goto("/nope");

    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle(`Page not found — ${site.name}`);
    await expect(meta(page, "robots")).toHaveAttribute("content", "noindex");
  });
});
