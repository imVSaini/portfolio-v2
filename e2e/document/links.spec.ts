import { expect, test, type Page } from "@playwright/test";

import { contact } from "@/data/contact";

import { PAGE_ROUTES } from "../routes";

type Anchor = {
  href: string;
  target: string | null;
  rel: string | null;
  label: string;
};

const CRAWLED_ROUTES = [...PAGE_ROUTES, "/nope"];

const IMPLICIT_TOP = "#top";
const NEW_TAB_HINT = "(opens in a new tab)";
const UNLABELLED_ROUTES = ["/"];

async function readAnchors(page: Page): Promise<Anchor[]> {
  return page.locator("a").evaluateAll((anchors) =>
    anchors.map((anchor) => ({
      href: anchor.getAttribute("href") ?? "",
      target: anchor.getAttribute("target"),
      rel: anchor.getAttribute("rel"),
      label: anchor.getAttribute("aria-label") ?? anchor.textContent.trim(),
    })),
  );
}

async function hasTarget(page: Page, hash: string): Promise<boolean> {
  return (await page.locator(`[id="${hash.slice(1)}"]`).count()) === 1;
}

test.describe("links", () => {
  for (const path of CRAWLED_ROUTES) {
    test(`${path} has no empty, placeholder or scripted links`, async ({ page }) => {
      await page.goto(path);

      for (const { href, label } of await readAnchors(page)) {
        expect(href, label).not.toBe("");
        expect(href, label).not.toBe("#");
        expect(href, label).not.toMatch(/^javascript:/i);
        expect(label, href).not.toBe("");
      }
    });

    test(`${path} points every in-page link at an element that exists`, async ({ page }) => {
      await page.goto(path);
      const hashes = (await readAnchors(page))
        .map((anchor) => anchor.href)
        .filter((href) => href.startsWith("#") && href !== IMPLICIT_TOP);

      expect(hashes.length).toBeGreaterThan(0);
      for (const hash of new Set(hashes)) {
        expect(await hasTarget(page, hash), `${path}${hash}`).toBe(true);
      }
    });

    test(`${path} opens outside links safely in a new tab`, async ({ page }) => {
      await page.goto(path);
      const anchors = await readAnchors(page);
      const outside = anchors.filter((anchor) => /^https?:/.test(anchor.href));

      expect(outside.length).toBeGreaterThan(0);
      for (const { href, target, rel } of outside) {
        expect(href, href).toMatch(/^https:\/\//);
        expect(target, href).toBe("_blank");
        expect(rel ?? "", href).toContain("noreferrer");
      }
      for (const { href, target } of anchors) {
        if (!/^https?:/.test(href)) expect(target, href).toBeNull();
      }
    });

    test(`${path} says so when a link opens in a new tab`, async ({ page }) => {
      test.fail(
        UNLABELLED_ROUTES.includes(path),
        "the desktop work panels' Visit live and GitHub links open a new tab without saying so",
      );
      await page.goto(path);
      const unannounced = (await readAnchors(page))
        .filter((anchor) => anchor.target === "_blank" && !anchor.label.includes(NEW_TAB_HINT))
        .map((anchor) => `${anchor.label} → ${anchor.href}`);

      expect(unannounced).toEqual([]);
    });

    test(`${path} only emails the site's contact address`, async ({ page }) => {
      await page.goto(path);
      const mails = (await readAnchors(page))
        .map((anchor) => anchor.href)
        .filter((href) => href.startsWith("mailto:"));

      for (const href of mails) expect(href).toBe(`mailto:${contact.email}`);
    });
  }

  test("every internal link on the site resolves, anchors included", async ({ page, request }) => {
    test.slow();
    const targets = new Set<string>();

    for (const path of CRAWLED_ROUTES) {
      await page.goto(path);
      for (const { href } of await readAnchors(page)) {
        if (href.startsWith("/")) targets.add(href);
      }
    }

    expect(targets.size).toBeGreaterThan(PAGE_ROUTES.length);
    for (const target of targets) {
      const { pathname, hash } = new URL(target, "http://site.test");

      if (hash) {
        await page.goto(pathname);
        expect(await hasTarget(page, hash), target).toBe(true);
      } else {
        expect((await request.get(target)).status(), target).toBe(200);
      }
    }
  });

  test("every page of the site is linked from another page", async ({ page }) => {
    const linked = new Set<string>();

    for (const path of CRAWLED_ROUTES) {
      await page.goto(path);
      for (const { href } of await readAnchors(page)) {
        const { pathname } = new URL(href, "http://site.test");
        if (href.startsWith("/") && pathname !== path) linked.add(pathname);
      }
    }

    for (const path of PAGE_ROUTES) expect(linked.has(path), path).toBe(true);
  });
});
