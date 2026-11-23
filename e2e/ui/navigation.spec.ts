import type { Page } from "@playwright/test";

import { contact } from "@/data/contact";
import { notFound } from "@/data/notFound";
import { nav, site } from "@/data/site";

import {
  clickWhenSettled,
  expect,
  expectScrolledTo,
  openSiteNav,
  scrollToEnd,
  scrollY,
  test,
} from "../fixtures";
import { getFirstPost, getPostPath, MISSING_ROUTES } from "../routes";

const SECTION_LINKS = nav.filter((item) => item.kind === "section" && item.href !== "#top");
const BLOG_HEADING = /Notes\s*from\s*production\./;
const SCROLL_SAVE_MS = 500;

function getSlitScales(page: Page): Promise<number[]> {
  return page
    .locator("[data-logo] [data-slit]")
    .evaluateAll((rects: SVGRectElement[]) =>
      rects.map(
        (rect) => Math.round((rect.transform.baseVal.consolidate()?.matrix.a ?? 1) * 100) / 100,
      ),
    );
}

test.describe("site navigation on the home page", () => {
  for (const { label, href } of SECTION_LINKS) {
    test(`"${label}" travels to ${href}`, async ({ page, visit }) => {
      await visit("/");
      const navigation = await openSiteNav(page);

      await navigation.getByRole("link", { name: label, exact: true }).click();

      await expectScrolledTo(page, href);
    });
  }

  for (const { label, href } of SECTION_LINKS) {
    test(
      `"${label}" records ${href} in the address bar`,
      { tag: "@desktop" },
      async ({ page, visit }) => {
        await visit("/");

        await page
          .getByRole("navigation", { name: "Primary" })
          .getByRole("link", { name: label, exact: true })
          .click();

        await expect(page).toHaveURL(new RegExp(`/${href}$`));
        await expect(page.locator(href)).toBeFocused();
      },
    );
  }

  test('"Home" returns to the top and clears the hash', async ({ page, visit, layout }) => {
    await visit("/");
    const navigation = await openSiteNav(page);
    await navigation.getByRole("link", { name: "Contact", exact: true }).click();
    await expectScrolledTo(page, "#contact");

    const again = await openSiteNav(page);
    await again.getByRole("link", { name: "Home", exact: true }).click();

    await expect.poll(() => scrollY(page)).toBe(0);
    if (layout === "desktop") {
      await expect(page).toHaveURL(/\/$/);
      await expect(page.locator("body")).toBeFocused();
    }
  });

  test("the logo returns to the top", async ({ page, visit }) => {
    await visit("/");
    await scrollToEnd(page);
    const logo = page.getByRole("link", { name: `${site.name}, back to top` });

    await expect(logo).toHaveAttribute("href", "#top");
    await clickWhenSettled(logo);

    await expect.poll(() => scrollY(page)).toBe(0);
    await expect(page).toHaveURL(/\/$/);
  });

  test("the logo folds to the favicon's slit VS and stays folded at the very bottom", async ({
    page,
    visit,
  }) => {
    await visit("/");
    await expect(page.locator("[data-logo] [data-slit]")).toHaveCount(2);
    await expect.poll(() => getSlitScales(page)).toEqual([0, 0]);

    await scrollToEnd(page);
    await expect.poll(() => getSlitScales(page)).toEqual([1, 1]);

    await page.getByRole("link", { name: `${site.name}, back to top` }).hover();
    await expect.poll(() => getSlitScales(page)).toEqual([0, 0]);
  });

  test("a reload part-way down shows the folded VS at once, with no rise or fold", async ({
    page,
    visit,
  }) => {
    await visit("/");
    await page.addInitScript(() => {
      const counts = { frames: 0, moving: 0 };
      Object.assign(window, { logoCounts: counts });
      const matrixOf = (node: Element) =>
        node instanceof SVGGraphicsElement ? node.transform.baseVal.consolidate()?.matrix : null;
      const sample = () => {
        const svg = document.querySelector("header [data-logo]");
        if (svg instanceof SVGSVGElement && getComputedStyle(svg).visibility === "visible") {
          const below = svg.viewBox.baseVal.height;
          const rising = [...svg.querySelectorAll("[data-letter]")].some((letter) => {
            const y = Math.abs(matrixOf(letter)?.f ?? 0);
            return y > 0.5 && y < below - 0.5;
          });
          const folding = [...svg.querySelectorAll("[data-slit]")].some((slit) => {
            const scale = matrixOf(slit)?.a ?? 1;
            return scale > 0.01 && scale < 0.99;
          });
          counts.frames += 1;
          if (rising || folding) counts.moving += 1;
        }
        requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });

    await expect(async () => {
      await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
      await expect.poll(() => getSlitScales(page)).toEqual([1, 1]);
      await page.waitForTimeout(SCROLL_SAVE_MS);
      await page.reload();
      await expect(page.locator("html")).toHaveAttribute("data-motion-ready", "");
      await expect.poll(() => scrollY(page), { timeout: 2000 }).toBeGreaterThan(0);
    }).toPass();

    await expect.poll(() => getSlitScales(page)).toEqual([1, 1]);
    await expect
      .poll(() =>
        page
          .locator("header [data-logo] [data-letter]")
          .evaluateAll((letters: SVGPathElement[]) =>
            letters.every(
              (letter) => Math.abs(letter.transform.baseVal.consolidate()?.matrix.f ?? 0) < 0.5,
            ),
          ),
      )
      .toBe(true);
    const counts = await page.evaluate(() => {
      const value: unknown = Reflect.get(window, "logoCounts");
      return typeof value === "object" && value !== null
        ? {
            frames: Number(Reflect.get(value, "frames")),
            moving: Number(Reflect.get(value, "moving")),
          }
        : { frames: 0, moving: -1 };
    });
    expect(counts.frames).toBeGreaterThan(0);
    expect(counts.moving).toBe(0);
  });

  test('the footer\'s "Back to top" returns to the top', async ({ page, visit }) => {
    await visit("/");
    await scrollToEnd(page);

    await clickWhenSettled(
      page.getByRole("contentinfo").getByRole("link", { name: "Back to top" }),
    );

    await expect.poll(() => scrollY(page)).toBe(0);
  });

  test("a link straight to a section opens on that section", async ({ page, visit }) => {
    await visit("/#contact");

    await expectScrolledTo(page, "#contact");
  });
});

test.describe("the logo with reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("keeps the full name without slits after scrolling", async ({ page, visit }) => {
    await visit("/");
    await scrollToEnd(page);

    await expect.poll(() => getSlitScales(page)).toEqual([0, 0]);
  });
});

test.describe("moving between pages", () => {
  test('"Blog" opens the blog without a full page load', async ({ page, visit }) => {
    await visit("/");
    await page.evaluate(() => document.documentElement.setAttribute("data-e2e", "kept"));
    const navigation = await openSiteNav(page);

    await navigation.getByRole("link", { name: "Blog", exact: true }).click();

    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(BLOG_HEADING);
    await expect(page.locator("html")).toHaveAttribute("data-e2e", "kept");
    await expect.poll(() => scrollY(page)).toBe(0);
  });

  test("marks the current page in the navigation", async ({ page, visit }) => {
    await visit("/blog");
    const navigation = await openSiteNav(page);

    await expect(navigation.getByRole("link", { name: "Blog", exact: true })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(navigation.locator("[aria-current]")).toHaveCount(1);
  });

  test("a section link on another page lands on that section of home", async ({ page, visit }) => {
    await visit("/blog");
    const navigation = await openSiteNav(page);

    await navigation.getByRole("link", { name: "Work", exact: true }).click();

    await expect(page).toHaveURL(/\/#work$/);
    await expectScrolledTo(page, "#work");
  });

  test("the logo leads home from another page", async ({ page, visit }) => {
    await visit("/privacy");

    await page.getByRole("link", { name: `${site.name}, home` }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("region", { name: "Introduction" })).toBeVisible();
    await expect(page.getByRole("link", { name: `${site.name}, back to top` })).toBeVisible();
  });

  test("the footer leads to the privacy policy", async ({ page, visit }) => {
    await visit("/");
    await scrollToEnd(page);

    await page.getByRole("contentinfo").getByRole("link", { name: "Privacy policy" }).click();

    await expect(page).toHaveURL(/\/privacy$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page).toHaveTitle(`Privacy policy — ${site.name}`);
  });

  test("back and forward retrace home, blog and a post", async ({ page, visit }) => {
    const post = getFirstPost();
    await visit("/");
    const navigation = await openSiteNav(page);
    await navigation.getByRole("link", { name: "Blog", exact: true }).click();
    await expect(page).toHaveURL(/\/blog$/);

    await page.getByRole("link", { name: post.title, exact: true }).first().click();
    await expect(page).toHaveURL(new RegExp(`${getPostPath(post)}$`));
    await expect(page).toHaveTitle(`${post.metaTitle} — ${site.name}`);

    await page.goBack();
    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(BLOG_HEADING);

    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("region", { name: "Introduction" })).toBeVisible();

    await page.goForward();
    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(BLOG_HEADING);
  });

  test("an outside link opens in a new tab that cannot reach back", async ({
    page,
    context,
    visit,
  }) => {
    const [link] = contact.links;
    await context.route(
      (url) => url.hostname !== "localhost" && url.hostname !== "127.0.0.1",
      (route) => route.fulfill({ contentType: "text/html", body: "<title>Outside</title>" }),
    );
    await visit("/");
    await scrollToEnd(page);

    const opening = page.waitForEvent("popup");
    await page
      .getByRole("contentinfo")
      .getByRole("link", { name: `${link.label} (opens in a new tab)` })
      .click();
    const popup = await opening;
    await popup.waitForLoadState();

    expect(popup.url()).toBe(link.href);
    expect(await popup.evaluate(() => window.opener === null)).toBe(true);
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe("pages that do not exist", () => {
  for (const path of MISSING_ROUTES) {
    test(`${path} offers a way back home`, async ({ page, visit }) => {
      await visit(path);
      const main = page.getByRole("main");

      await expect(main.getByRole("heading", { level: 1 })).toHaveText(notFound.heading);
      await main.getByRole("link", { name: notFound.cta.label }).click();

      await expect(page).toHaveURL(/\/$/);
      await expect(page.getByRole("region", { name: "Introduction" })).toBeVisible();
    });
  }

  test("the way home works from the keyboard", async ({ page, visit }) => {
    await visit("/nope");
    const cta = page.getByRole("main").getByRole("link", { name: notFound.cta.label });

    await cta.focus();
    await expect(cta).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(/\/$/);
  });
});
