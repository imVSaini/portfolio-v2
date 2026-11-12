import { projects } from "@/data/projects";

import { expect, getOverflow, openMenu, scrollThrough, test } from "../fixtures";
import { getSampleRoutes, PAGE_ROUTES } from "../routes";

const SIZES = [
  { width: 320, height: 568 },
  { width: 375, height: 667 },
  { width: 768, height: 1024 },
  { width: 844, height: 390 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
] as const;

const HEADER_STEPS = [
  { width: 767, navigation: false, menu: true, appearance: false },
  { width: 768, navigation: false, menu: true, appearance: true },
  { width: 1023, navigation: false, menu: true, appearance: true },
  { width: 1024, navigation: true, menu: false, appearance: true },
] as const;

test.describe("each page at this device's size", () => {
  for (const path of [...PAGE_ROUTES, "/nope"]) {
    test(`${path} never scrolls sideways`, async ({ page, visit }) => {
      await visit(path);
      expect(await getOverflow(page)).toBe(0);

      await scrollThrough(page);
      await expect.poll(() => getOverflow(page)).toBe(0);
    });
  }
});

test.describe("while the footer animates in", () => {
  test("the page never grows wider than the screen", async ({ page, visit }) => {
    test.fixme(
      true,
      "the back-to-top seal overshoots as it pops in and briefly makes phones 3px too wide",
    );
    await visit("/privacy");
    await scrollThrough(page);

    const widest = await page.evaluate(async () => {
      const root = document.documentElement;
      const limit = root.scrollHeight - window.innerHeight;
      let overflow = 0;
      for (let y = limit - 700; y <= limit; y += 10) {
        window.scrollTo(0, y);
        for (let frame = 0; frame < 4; frame += 1) {
          await new Promise((resolve) => requestAnimationFrame(resolve));
          overflow = Math.max(overflow, root.scrollWidth - root.clientWidth);
        }
      }
      return overflow;
    });

    expect(widest).toBe(0);
  });
});

test.describe("across screen sizes", () => {
  for (const size of SIZES) {
    test.describe(`${size.width}×${size.height}`, () => {
      test.use({ viewport: size });

      for (const path of getSampleRoutes()) {
        test(`${path} fits without sideways scroll`, async ({ page, visit, isMobile }) => {
          test.skip(isMobile, "device projects keep their own screen size");
          await visit(path);
          const heading = page.getByRole("heading", { level: 1 });

          expect(await getOverflow(page)).toBe(0);
          const box = await heading.boundingBox();
          expect(box?.x).toBeGreaterThanOrEqual(0);
          expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(size.width);

          await scrollThrough(page);
          await expect.poll(() => getOverflow(page)).toBe(0);
          await expect(page.getByRole("contentinfo")).toBeInViewport();
        });
      }

      test("the header keeps its controls on screen", async ({ page, visit, isMobile }) => {
        test.skip(isMobile, "device projects keep their own screen size");
        await visit("/");
        const header = page.getByRole("banner");

        const edges = await header
          .locator("a, button")
          .filter({ visible: true })
          .evaluateAll((controls) =>
            controls.map((control) => {
              const box = control.getBoundingClientRect();
              return { left: Math.floor(box.left), right: Math.ceil(box.right) };
            }),
          );

        expect(edges.length).toBeGreaterThan(1);
        for (const edge of edges) {
          expect(edge.left).toBeGreaterThanOrEqual(0);
          expect(edge.right).toBeLessThanOrEqual(size.width);
        }
      });
    });
  }
});

test.describe("header breakpoints", () => {
  for (const step of HEADER_STEPS) {
    test.describe(`at ${step.width}px`, () => {
      test.use({ viewport: { width: step.width, height: 800 } });

      test("shows the right controls", async ({ page, visit, isMobile }) => {
        test.skip(isMobile, "device projects keep their own screen size");
        await visit("/");
        const header = page.getByRole("banner");

        await expect(header.getByRole("navigation", { name: "Primary" })).toBeVisible({
          visible: step.navigation,
        });
        await expect(header.getByRole("button", { name: "Open menu" })).toBeVisible({
          visible: step.menu,
        });
        await expect(header.getByRole("button", { name: "Appearance" })).toBeVisible({
          visible: step.appearance,
        });
      });
    });
  }
});

test.describe("work section breakpoints", () => {
  for (const { width, accordion } of [
    { width: 767, accordion: true },
    { width: 768, accordion: false },
  ]) {
    test.describe(`at ${width}px`, () => {
      test.use({ viewport: { width, height: 800 } });

      test(`shows ${accordion ? "the accordion" : "the panels"}`, async ({
        page,
        visit,
        isMobile,
      }) => {
        test.skip(isMobile, "device projects keep their own screen size");
        await visit("/");
        const work = page.locator("#work");

        await expect(work.getByRole("button")).toHaveCount(accordion ? projects.length : 0);
        await expect(work.locator("article[data-h-panel]").filter({ visible: true })).toHaveCount(
          accordion ? 0 : projects.length,
        );
      });
    });
  }
});

test.describe("when the window is resized", () => {
  test("the page adapts from desktop to phone and back", async ({ page, visit, isMobile }) => {
    test.skip(isMobile, "device projects keep their own screen size");
    await page.setViewportSize({ width: 1280, height: 800 });
    await visit("/");
    const header = page.getByRole("banner");
    const work = page.locator("#work");
    await expect(header.getByRole("navigation", { name: "Primary" })).toBeVisible();

    await page.setViewportSize({ width: 390, height: 800 });
    await expect(header.getByRole("navigation", { name: "Primary" })).toBeHidden();
    await expect(header.getByRole("button", { name: "Open menu" })).toBeVisible();
    await expect(work.getByRole("button")).toHaveCount(projects.length);
    await scrollThrough(page);
    await expect.poll(() => getOverflow(page)).toBe(0);
    expect(
      await work
        .locator("> div")
        .evaluate((track) => new DOMMatrixReadOnly(getComputedStyle(track).transform).m41),
    ).toBe(0);

    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(header.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect(work.getByRole("button")).toHaveCount(0);
    await expect.poll(() => getOverflow(page)).toBe(0);
  });

  test("a menu left open on a widened window can still be dismissed", async ({
    page,
    visit,
    isMobile,
  }) => {
    test.skip(isMobile, "device projects keep their own screen size");
    await page.setViewportSize({ width: 390, height: 800 });
    await visit("/");
    const menu = await openMenu(page);

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.keyboard.press("Escape");

    await expect(menu).toBeHidden();
    const navigation = page.getByRole("navigation", { name: "Primary" });
    await navigation.getByRole("link", { name: "Blog", exact: true }).click();
    await expect(page).toHaveURL(/\/blog$/);
  });
});

test.describe("text scaled up by the reader", () => {
  test.use({ viewport: { width: 640, height: 800 } });

  test("a 200% root font size still fits a narrow window", async ({ page, visit, isMobile }) => {
    test.skip(isMobile, "device projects keep their own screen size");
    await page.addInitScript(() => {
      const style = document.createElement("style");
      style.textContent = "html { font-size: 200% !important; }";
      document.addEventListener("DOMContentLoaded", () => document.head.append(style));
    });
    await visit("/privacy");

    await scrollThrough(page);

    await expect.poll(() => getOverflow(page)).toBe(0);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
