import type { Page } from "@playwright/test";

import { notFound } from "@/data/notFound";

import { expect, getOverflow, test } from "../fixtures";

const SM = 640;
const LG = 1024;
const XL = 1280;

const ARRANGEMENT_SIZES = [
  { width: 360, height: 740 },
  { width: 640, height: 900 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1279, height: 800 },
  { width: 1440, height: 900 },
] as const;

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

async function readParts(page: Page) {
  const main = page.getByRole("main");
  await expect
    .poll(() =>
      main.evaluate((el) =>
        [...el.querySelectorAll("[data-nf-fade], [data-nf-seal]")].every((node) => {
          const style = getComputedStyle(node);
          return style.opacity === "1" && new DOMMatrixReadOnly(style.transform).isIdentity;
        }),
      ),
    )
    .toBe(true);

  const [numeral, heading, description, link, copy] = await Promise.all(
    [
      main.locator("p[aria-hidden]"),
      main.getByRole("heading", { level: 1 }),
      main.getByText(notFound.description),
      main.getByRole("link", { name: notFound.cta.label }),
      main.locator("[data-nf-copy]"),
    ].map((part) => part.boundingBox()),
  );
  if (!numeral || !heading || !description || !link || !copy) {
    throw new Error("not-found parts did not render");
  }
  return { numeral, heading, description, link, copy };
}

/**
 * Below `lg` one start-aligned column with a full-width button on compact widths; at `lg` the
 * numeral spans the page above a heading | message row; from `xl` numeral and copy sit side by side.
 */
async function expectArrangement(page: Page) {
  const width = page.viewportSize()?.width ?? Number.NaN;
  const { numeral, heading, description, link, copy } = await readParts(page);
  const bottom = (box: { y: number; height: number }) => box.y + box.height;

  expect(bottom(description)).toBeLessThanOrEqual(link.y);

  if (width >= XL) {
    expect(numeral.x + numeral.width).toBeLessThan(heading.x);
    expect(bottom(heading)).toBeLessThanOrEqual(description.y);
    for (const box of [description, link])
      expect(Math.abs(box.x - heading.x)).toBeLessThanOrEqual(1);
    const copyMiddle = (heading.y + bottom(link)) / 2;
    expect(Math.abs(copyMiddle - (numeral.y + numeral.height / 2))).toBeLessThanOrEqual(1);
    return;
  }

  expect(bottom(numeral)).toBeLessThan(heading.y);
  expect(Math.abs(numeral.x - heading.x)).toBeLessThanOrEqual(1);

  if (width >= LG) {
    expect(heading.x + heading.width).toBeLessThan(description.x);
    expect(Math.abs(heading.y - description.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(link.x - description.x)).toBeLessThanOrEqual(1);
    return;
  }

  expect(bottom(heading)).toBeLessThanOrEqual(description.y);
  for (const box of [description, link]) expect(Math.abs(box.x - heading.x)).toBeLessThanOrEqual(1);
  if (width < SM) expect(Math.abs(link.width - copy.width)).toBeLessThanOrEqual(1);
  else expect(link.width).toBeLessThan(copy.width / 2);
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

  test("arranges the numeral and the copy for the screen's width", async ({ page, visit }) => {
    await visit("/nope");

    await expectArrangement(page);
  });

  test("fills the numeral's column without spilling out of it", async ({ page, visit }) => {
    await visit("/nope");

    const spill = await page.locator("[data-nf-numeral]").evaluate((column) => {
      const edge = column.getBoundingClientRect().right;
      const glyphs = [...column.querySelectorAll("p > span")];
      return Math.max(...glyphs.map((glyph) => glyph.getBoundingClientRect().right)) - edge;
    });
    expect(spill).toBeLessThanOrEqual(0);
    expect(spill).toBeGreaterThan(-0.1 * (page.viewportSize()?.width ?? 0));
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

  for (const size of ARRANGEMENT_SIZES) {
    test(`arranges the numeral and the copy at ${size.width}×${size.height}`, async ({
      page,
      visit,
    }) => {
      await page.setViewportSize(size);
      await visit("/nope");

      await expectArrangement(page);
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

    const { numeral, heading } = await readParts(page);
    expect(heading.height).toBeLessThan(numeral.height / 2);
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
