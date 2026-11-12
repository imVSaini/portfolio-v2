import type { Page } from "@playwright/test";

import { site } from "@/data/site";
import { INTRO_KEY } from "@/lib/appearance";

import { expect, expectScrolledTo, openSiteNav, scrollY, test } from "../fixtures";

const HAND_OVER = { timeout: 15_000 };

function getParts(page: Page) {
  return {
    root: page.locator("html"),
    sheet: page.locator("[data-preloader]"),
    status: page.locator('p[role="status"]'),
    main: page.locator("main").filter({ visible: true }),
  };
}

async function expectHandedOver(page: Page): Promise<void> {
  const { root, sheet, main } = getParts(page);

  await expect(root).not.toHaveAttribute("data-intro", /.*/, HAND_OVER);
  await expect(sheet).toBeHidden(HAND_OVER);
  await expect(main).toHaveJSProperty("inert", false);
}

test.describe("intro on the first visit", () => {
  test.use({ intro: "play" });

  test("covers the page, announces loading, then hands the page over", async ({ page }) => {
    const { root, sheet, status, main } = getParts(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(root).toHaveAttribute("data-intro", "play");
    await expect(sheet).toBeVisible();
    await expect(sheet).toHaveAttribute("aria-hidden", "true");
    await expect(status).toHaveText("Loading");
    await expect(main).toHaveJSProperty("inert", true);
    await expect(page.locator("header")).toHaveJSProperty("inert", true);
    await expect(page.locator("footer")).toHaveJSProperty("inert", true);
    await expect(page.locator('a[href="#main"]')).toHaveJSProperty("inert", true);

    await expect(status).toHaveText("Loaded", HAND_OVER);
    await expectHandedOver(page);
    await expect(page.locator("header")).toHaveJSProperty("inert", false);
    await expect(page.locator("footer")).toHaveJSProperty("inert", false);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: `${site.name}, back to top` })).toBeVisible();
    expect(await page.evaluate((key) => sessionStorage.getItem(key), INTRO_KEY)).toBe("1");
  });

  test("counts up to 100 before leaving", async ({ page }) => {
    const count = page.locator("[data-preloader-count]");
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(count).toHaveText(/^\d{3}$/);
    await expect(count).toHaveText("100", HAND_OVER);
  });

  test("holds the page still until it is done", { tag: "@desktop" }, async ({ page }) => {
    test.fail(
      true,
      "SmoothScroll stops Locomotive before it auto-starts on the next frame, so the stop is lost",
    );
    const { status } = getParts(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(status).toHaveText("Loading");

    await page.mouse.move(300, 300);
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(300);

    expect(await scrollY(page)).toBe(0);
  });

  test("leaves a working page behind", async ({ page, layout }) => {
    await page.goto("/");
    await expectHandedOver(page);
    const navigation = await openSiteNav(page, layout);

    await navigation.getByRole("link", { name: "Contact", exact: true }).click();

    await expectScrolledTo(page, "#contact");
  });

  test("does not play again on reload", async ({ page }) => {
    const { root, sheet, status } = getParts(page);
    await page.goto("/");
    await expectHandedOver(page);

    await page.reload();

    await expect(root).toHaveAttribute("data-motion-ready", "");
    await expect(root).not.toHaveAttribute("data-intro", /.*/);
    await expect(sheet).toBeHidden();
    await expect(status).toHaveText("");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("does not play again when coming back from another page", async ({ page, layout }) => {
    const { sheet, main } = getParts(page);
    await page.goto("/");
    await expectHandedOver(page);
    const navigation = await openSiteNav(page, layout);
    await navigation.getByRole("link", { name: "Blog", exact: true }).click();
    await expect(page).toHaveURL(/\/blog$/);

    await page.goBack();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("region", { name: "Introduction" })).toBeVisible();
    await expect(sheet).toBeHidden();
    await expect(main).toHaveJSProperty("inert", false);
  });

  test("is not part of other pages", async ({ page }) => {
    await page.goto("/blog");

    await expect(page.locator("html")).toHaveAttribute("data-motion-ready", "");
    await expect(page.locator("[data-preloader]")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("stays out of the way when home is reached from another page", async ({ page }) => {
    const { sheet, main } = getParts(page);
    await page.goto("/privacy");
    await expect(page.locator("html")).toHaveAttribute("data-motion-ready", "");

    await page.getByRole("link", { name: `${site.name}, home` }).click();

    await expect(page.getByRole("region", { name: "Introduction" })).toBeVisible();
    await expect(sheet).toBeHidden();
    await expect(main).toHaveJSProperty("inert", false);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("hands over even if the fonts never arrive", async ({ page }) => {
    await page.route("**/*.woff2", () => {});
    await page.goto("/", { waitUntil: "commit" });

    await expect(page.locator('p[role="status"]')).toHaveText("Loaded", HAND_OVER);
    await expectHandedOver(page);
  });

  test("gives the page back if its scripts never arrive", async ({ page }) => {
    await page.route("**/_next/static/**/*.js", (route) => route.abort());
    const { root, sheet } = getParts(page);
    await page.goto("/", { waitUntil: "commit" });

    await expect(root).toHaveClass(/motion-ok/);
    await expect(sheet).toBeVisible();

    await expect(root).not.toHaveClass(/motion-ok/, HAND_OVER);
    await expect(sheet).toBeHidden();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: "See selected work" })).toBeVisible();
  });

  test.describe("with reduced motion", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });

    test("is skipped entirely", async ({ page }) => {
      const { root, sheet, status, main } = getParts(page);
      await page.goto("/");

      await expect(root).toHaveAttribute("data-motion-ready", "");
      await expect(root).not.toHaveAttribute("data-intro", /.*/);
      await expect(root).not.toHaveClass(/motion-ok/);
      await expect(sheet).toBeHidden();
      await expect(status).toHaveText("");
      await expect(main).toHaveJSProperty("inert", false);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });
  });
});

test.describe("intro on a returning visit", () => {
  test("is not shown", async ({ page, visit }) => {
    const { root, sheet, main } = getParts(page);
    await visit("/");

    await expect(root).not.toHaveAttribute("data-intro", /.*/);
    await expect(sheet).toBeHidden();
    await expect(main).toHaveJSProperty("inert", false);
  });
});
