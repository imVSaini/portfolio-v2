import type { Page } from "@playwright/test";

import { notFound } from "@/data/notFound";

import { expect, getOverflow, test } from "../fixtures";

const FIT_SIZES = [
  { width: 320, height: 568 },
  { width: 375, height: 553 },
  { width: 375, height: 667 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 720 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
] as const;

async function measure(page: Page) {
  return page.getByRole("main").evaluate((main) => {
    const header = document.querySelector("header")?.getBoundingClientRect();
    const box = main.getBoundingClientRect();
    const lowest = Math.max(
      ...[...main.querySelectorAll("*")].map((el) => el.getBoundingClientRect().bottom),
    );
    return {
      viewport: window.innerHeight,
      headerBottom: header?.bottom ?? Number.NaN,
      top: box.top,
      bottom: box.bottom,
      contentBottom: lowest,
      contentTop: main.querySelector("p")?.getBoundingClientRect().top ?? Number.NaN,
    };
  });
}

async function expectOneScreen(page: Page) {
  await expect
    .poll(async () => {
      const m = await measure(page);
      return m.contentBottom <= m.viewport + 0.5 && Math.abs(m.bottom - m.viewport) <= 1;
    })
    .toBe(true);

  const m = await measure(page);
  expect(m.top).toBe(0);
  expect(m.contentTop).toBeGreaterThan(m.headerBottom);
  await expect(page.getByRole("contentinfo")).not.toBeInViewport();
}

test.describe("the not-found page", () => {
  test("fits the header and page into one screen, with the footer just below", async ({
    page,
    visit,
  }) => {
    await visit("/nope");

    await expectOneScreen(page);
    expect(await getOverflow(page)).toBe(0);
  });

  test("centres the numeral above the heading, the message and the way home", async ({
    page,
    visit,
  }) => {
    await visit("/nope");
    const main = page.getByRole("main");
    const parts = [
      main.locator("p[aria-hidden]"),
      main.getByRole("heading", { level: 1 }),
      main.getByText(notFound.description),
      main.getByRole("link", { name: notFound.cta.label }),
    ];

    await expect
      .poll(async () => {
        const width = page.viewportSize()?.width ?? Number.NaN;
        const offsets = await Promise.all(
          parts.map(async (part) => {
            const box = await part.boundingBox();
            return box ? Math.abs(box.x + box.width / 2 - width / 2) : Number.POSITIVE_INFINITY;
          }),
        );
        return Math.max(...offsets);
      })
      .toBeLessThanOrEqual(1);

    const boxes = await Promise.all(parts.map((part) => part.boundingBox()));
    for (const [index, box] of boxes.entries()) {
      const below = boxes[index + 1];
      if (below) expect(box && box.y + box.height <= below.y).toBe(true);
    }
  });
});

test.describe("the not-found page at common screen sizes", { tag: "@desktop" }, () => {
  for (const size of FIT_SIZES) {
    test(`fits one ${size.width}×${size.height} screen`, async ({ page, visit }) => {
      await page.setViewportSize(size);
      await visit("/nope");

      await expectOneScreen(page);
      expect(await getOverflow(page)).toBe(0);
    });
  }

  test("grows past a landscape phone's short screen instead of clipping", async ({
    page,
    visit,
  }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await visit("/nope");

    await expect
      .poll(async () => {
        const m = await measure(page);
        return m.bottom >= m.viewport && m.contentBottom <= m.bottom + 0.5;
      })
      .toBe(true);
    expect(await getOverflow(page)).toBe(0);
  });
});

test.describe("the not-found page with motion off", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("shows everything at rest, with a still seal", async ({ page, visit }) => {
    await visit("/nope");
    const main = page.getByRole("main");

    await expect(main.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(main.getByText(notFound.description)).toBeVisible();
    await expect(main.getByRole("link", { name: notFound.cta.label })).toBeVisible();
    const moving = await main.evaluate(
      (el) =>
        [...el.querySelectorAll("[data-nf-digit], [data-nf-seal], [data-nf-fade], svg")].filter(
          (node) =>
            getComputedStyle(node).transform !== "none" ||
            getComputedStyle(node).opacity !== "1" ||
            node.getAnimations().length > 0,
        ).length,
    );
    expect(moving).toBe(0);
  });
});
