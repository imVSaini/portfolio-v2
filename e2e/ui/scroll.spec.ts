import type { Locator, Page } from "@playwright/test";

import { projects } from "@/data/projects";

import { expect, scrollToEnd, scrollY, test } from "../fixtures";
import { getFirstPost, getPostPath } from "../routes";

const PINNED = { width: 1280, height: 800 };
const SHEET = "body > div.isolate";

function getProgressBar(page: Page): Locator {
  return page.locator('header > div[aria-hidden="true"]').first();
}

function getBands(page: Page): Locator {
  return page.locator('body > div[aria-hidden="true"]:not([data-preloader])');
}

function readScale(bar: Locator): Promise<number> {
  return bar.evaluate((element) => {
    const match = /scaleX\(([\d.]+)\)/.exec(element.style.transform);
    return match?.[1] === undefined ? -1 : Number(match[1]);
  });
}

function readShift(target: Locator): Promise<{ x: number; y: number }> {
  return target.evaluate((element) => {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
    return { x: Math.round(matrix.m41) || 0, y: Math.round(matrix.m42) || 0 };
  });
}

function readLimit(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
}

async function readDistanceToEnd(page: Page): Promise<number> {
  return (await readLimit(page)) - (await scrollY(page));
}

async function jumpTo(page: Page, top: number): Promise<void> {
  await page.evaluate((y) => window.scrollTo(0, y), top);
}

test.describe("reading progress", () => {
  test("the bar fills from empty to full along the page", async ({ page, visit }) => {
    await visit(getPostPath(getFirstPost()));
    const bar = getProgressBar(page);

    expect(await readScale(bar)).toBe(0);

    await jumpTo(page, Math.round((await readLimit(page)) / 2));
    await expect.poll(() => readScale(bar)).toBeGreaterThan(0.4);
    expect(await readScale(bar)).toBeLessThan(0.6);

    await scrollToEnd(page);
    await expect.poll(() => readScale(bar)).toBeGreaterThan(0.95);

    await jumpTo(page, 0);
    await expect.poll(() => readScale(bar)).toBe(0);
  });

  test("the bar is completely full at the end of the page", async ({ page, visit }) => {
    await visit(getPostPath(getFirstPost()));

    await scrollToEnd(page);

    await expect.poll(() => readScale(getProgressBar(page))).toBeGreaterThan(0.999);
  });

  test("the header gains its backdrop once the page leaves the top", async ({ page, visit }) => {
    await visit("/");
    const header = page.getByRole("banner");

    await expect(header).toHaveClass(/border-transparent/);

    await jumpTo(page, 200);
    await expect(header).toHaveClass(/border-line/);
    await expect(header).not.toHaveClass(/border-transparent/);
    await expect(header).toBeInViewport();

    await jumpTo(page, 0);
    await expect(header).toHaveClass(/border-transparent/);
  });

  test.describe("with reduced motion", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });

    test("the bar and header still follow the page", async ({ page, visit }) => {
      await visit(getPostPath(getFirstPost()));
      const bar = getProgressBar(page);

      await scrollToEnd(page);

      await expect.poll(() => readScale(bar)).toBeGreaterThan(0.999);
      await expect(page.getByRole("banner")).toHaveClass(/border-line/);
    });
  });
});

test.describe("scrolling by hand", () => {
  test("the wheel moves the page", { tag: "@desktop" }, async ({ page, visit }) => {
    await visit("/");

    await page.mouse.move(300, 300);
    await page.mouse.wheel(0, 800);

    await expect.poll(() => scrollY(page)).toBeGreaterThan(300);
  });

  test("End and Home reach both ends of the page", { tag: "@desktop" }, async ({ page, visit }) => {
    await visit("/blog");

    await expect(async () => {
      await page.keyboard.press("End");
      await expect.poll(() => scrollY(page), { timeout: 2_000 }).toBeGreaterThan(500);
      await expect.poll(() => readDistanceToEnd(page), { timeout: 2_000 }).toBeLessThan(4);
    }).toPass();

    await expect(async () => {
      await page.keyboard.press("Home");
      await expect.poll(() => scrollY(page), { timeout: 2_000 }).toBe(0);
    }).toPass();
  });

  test("going back restores where the reader left the list", async ({ page, visit }) => {
    const post = getFirstPost();
    await visit("/blog");
    const link = page.getByRole("link", { name: post.title, exact: true });
    await jumpTo(page, 300);
    await expect.poll(() => scrollY(page)).toBe(300);

    await link.click();
    await expect(page).toHaveURL(new RegExp(`${getPostPath(post)}$`));
    await expect.poll(() => scrollY(page)).toBe(0);
    await page.goBack();

    await expect(page).toHaveURL(/\/blog$/);
    await expect.poll(() => scrollY(page)).toBeGreaterThan(200);
  });
});

test.describe("work track on a wide screen", { tag: "@desktop" }, () => {
  test.use({ viewport: PINNED });

  test("pins the section and carries every project across", async ({ page, visit }) => {
    await visit("/");
    const work = page.locator("#work");
    const track = work.locator("> div");
    const panels = work.locator("[data-h-panel]");

    const start = await work.evaluate(
      (section) => (section.parentElement ?? section).getBoundingClientRect().top + window.scrollY,
    );
    const distance = await track.evaluate((row) => row.scrollWidth - window.innerWidth);
    expect(distance).toBeGreaterThan(PINNED.width);
    expect(await readShift(track)).toEqual({ x: 0, y: 0 });

    await jumpTo(page, Math.round(start + distance / 2));
    await expect.poll(async () => (await readShift(track)).x).toBeLessThan(-distance / 4);
    await expect
      .poll(async () => Math.abs(Math.round((await work.boundingBox())?.y ?? Number.NaN)))
      .toBe(0);
    expect(Math.round((await work.boundingBox())?.height ?? 0)).toBe(PINNED.height);

    await jumpTo(page, Math.round(start + distance));
    await expect.poll(async () => (await readShift(track)).x).toBe(-Math.round(distance));
    await expect(panels.last()).toBeInViewport({ ratio: 0.9 });
    await expect(panels).toHaveCount(projects.length + 1);
  });

  test.describe("with reduced motion", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });

    test("lays the projects out as a grid that scrolls normally", async ({ page, visit }) => {
      await visit("/");
      const work = page.locator("#work");
      const panels = work.locator("article[data-h-panel]");

      await work.scrollIntoViewIfNeeded();
      expect(await readShift(work.locator("> div"))).toEqual({ x: 0, y: 0 });
      expect((await work.boundingBox())?.height).toBeGreaterThan(PINNED.height);
      for (const index of projects.keys()) {
        await panels.nth(index).scrollIntoViewIfNeeded();
        await expect(panels.nth(index).getByRole("heading", { level: 3 })).toBeInViewport();
      }
      const [first, second] = await Promise.all([
        panels.nth(0).boundingBox(),
        panels.nth(1).boundingBox(),
      ]);
      expect(Math.round(first?.y ?? 0)).toBe(Math.round(second?.y ?? -1));
    });
  });
});

test.describe("work track on a short screen", { tag: "@desktop" }, () => {
  test.use({ viewport: { width: 1280, height: 500 } });

  test("does not pin, so nothing is trapped in a cramped viewport", async ({ page, visit }) => {
    await visit("/");
    const work = page.locator("#work");

    await work.scrollIntoViewIfNeeded();

    expect(await readShift(work.locator("> div"))).toEqual({ x: 0, y: 0 });
    expect((await work.boundingBox())?.height).toBeGreaterThan(500);
    await expect(work.getByText("Keep scrolling")).toBeHidden();
  });
});

test.describe("end of the page", () => {
  test("the colour bands stay hidden until the end is near", async ({ page, visit }) => {
    await visit("/blog");
    const bands = getBands(page);

    await expect(bands).toHaveCount(1);
    await expect(bands).toHaveCSS("visibility", "hidden");

    await scrollToEnd(page);
    await expect(bands).toHaveAttribute("data-near-end", "");
    await expect(bands).toHaveCSS("visibility", "visible");

    await jumpTo(page, 0);
    await expect(bands).toHaveCSS("visibility", "hidden");
  });

  test(
    "pulling past the end lifts the page, then lets it settle back",
    { tag: "@desktop" },
    async ({ page, visit }) => {
      await visit("/blog");
      await scrollToEnd(page);
      await expect(getBands(page)).toHaveAttribute("data-near-end", "");
      await expect.poll(() => readDistanceToEnd(page)).toBeLessThan(2);

      await page.mouse.move(300, 300);
      const lifted = page.waitForFunction(
        (selector) => {
          const sheet = document.querySelector(selector);
          return (
            sheet !== null && new DOMMatrixReadOnly(getComputedStyle(sheet).transform).m42 < -20
          );
        },
        SHEET,
        { polling: "raf" },
      );
      await page.mouse.wheel(0, 240);
      await lifted;

      await expect.poll(async () => (await readShift(page.locator(SHEET))).y).toBe(0);
      await expect.poll(() => readDistanceToEnd(page)).toBeLessThan(2);
    },
  );
});
