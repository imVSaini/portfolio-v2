import type { Page } from "@playwright/test";

import { posts, type Post } from "@/data/posts";
import { site } from "@/data/site";
import { STORAGE_KEYS } from "@/lib/appearance";
import { getHeadingId } from "@/lib/article";

import { readPostArticle } from "../articles";
import {
  clickWhenSettled,
  expect,
  expectScrolledTo,
  getOverflow,
  openArticleAside,
  scrollY,
  test,
} from "../fixtures";
import { getFirstPost, getPostPath } from "../routes";

const POST = getFirstPost();
const PATH = getPostPath(POST);
const ARTICLE = readPostArticle(POST);
const HEADINGS = ARTICLE.headings;
const DIAGRAMS = ARTICLE.diagrams;

function getCodeHeavyPost(): Post {
  const ranked = [...posts].sort((a, b) => countCode(b) - countCode(a));
  const [first] = ranked;
  if (!first) throw new Error("src/data/posts has no posts to test against");
  return first;
}

function countCode(post: Post): number {
  return readPostArticle(post).codeSamples.length;
}

async function pickRoomyHeading(page: Page): Promise<string> {
  const ids = HEADINGS.map(getHeadingId);
  const index = await page.evaluate((list) => {
    const tops = list.map((id) => document.getElementById(id)?.getBoundingClientRect().top ?? 0);
    return tops.findIndex(
      (top, i) => i > 0 && (tops[i + 1] ?? Infinity) - top > window.innerHeight * 0.5,
    );
  }, ids);
  const heading = HEADINGS[index];
  if (!heading) throw new Error(`${PATH} has no section tall enough to test the contents list`);
  return heading;
}

async function expectContentsToggle(page: Page): Promise<void> {
  const toggle = page.getByRole("button", { name: "On this page" });
  const contents = page.getByRole("navigation", { name: "On this page" });
  const copy = page.getByRole("button", { name: "Copy link" });

  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(contents).toHaveCount(0);
  await expect(copy).toHaveCount(0);
  expect((await toggle.boundingBox())?.height).toBeGreaterThanOrEqual(44);

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(contents.getByRole("link")).toHaveCount(HEADINGS.length);
  for (const [index, heading] of HEADINGS.entries()) {
    await expect(contents.getByRole("link").nth(index)).toContainText(heading);
  }
  await expect(copy).toBeVisible();
  await expect(page.getByRole("link", { name: /^Share on / })).toHaveCount(2);

  await toggle.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(contents).toHaveCount(0);
  await expect(copy).toHaveCount(0);

  await toggle.press("Space");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(contents).toBeVisible();
}

test.describe("post table of contents", () => {
  test("travels to a section, records it and moves focus there", async ({
    page,
    visit,
    layout,
  }) => {
    await visit(PATH);
    const heading = await pickRoomyHeading(page);
    const id = getHeadingId(heading);
    await openArticleAside(page, layout);
    const contents = page.getByRole("navigation", { name: "On this page" });

    await clickWhenSettled(contents.getByRole("link", { name: heading }));

    await expectScrolledTo(page, `[id="${id}"]`);
    await expect(page).toHaveURL(new RegExp(`${PATH}#${id}$`));
    await expect(page.locator(`[id="${id}"]`)).toBeFocused();
    await expect(contents.getByRole("link", { name: heading })).toHaveAttribute(
      "aria-current",
      "location",
    );
    await expect(contents.locator("[aria-current]")).toHaveCount(1);
  });

  test("highlights the section being read while scrolling", async ({ page, visit, layout }) => {
    await visit(PATH);
    await openArticleAside(page, layout);
    const contents = page.getByRole("navigation", { name: "On this page" });
    const heading = await pickRoomyHeading(page);

    await page
      .locator(`[id="${getHeadingId(heading)}"]`)
      .evaluate((element) =>
        window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 100),
      );

    await expect(contents.getByRole("link", { name: heading })).toHaveAttribute(
      "aria-current",
      "location",
    );
  });

  test("stays beside the article on desktop", { tag: "@desktop" }, async ({ page, visit }) => {
    await visit(PATH);
    const contents = page.getByRole("navigation", { name: "On this page" });
    const last = HEADINGS.at(-1) ?? "";

    await page
      .locator(`[id="${getHeadingId(last)}"]`)
      .evaluate((element) =>
        window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 100),
      );

    await expect(contents).toBeInViewport({ ratio: 1 });
  });

  test(
    "keeps the contents and share open in the sidebar with no toggle",
    { tag: "@desktop" },
    async ({ page, visit }) => {
      await visit(PATH);

      await expect(page.getByRole("button", { name: "On this page" })).toHaveCount(0);
      await expect(
        page.getByRole("navigation", { name: "On this page" }).getByRole("link"),
      ).toHaveCount(HEADINGS.length);
      await expect(page.getByRole("button", { name: "Copy link" })).toBeVisible();
    },
  );

  for (const motion of ["no-preference", "reduce"] as const) {
    test.describe(`with motion set to ${motion}`, { tag: "@mobile" }, () => {
      test.use({ contextOptions: { reducedMotion: motion } });

      test("folds contents and share behind a toggle that opens by tap and keyboard", async ({
        page,
        visit,
      }) => {
        await visit(PATH);
        await expectContentsToggle(page);
      });
    });
  }

  test.describe("at tablet width", { tag: "@desktop" }, () => {
    test.use({ viewport: { width: 820, height: 1180 } });

    test("folds contents and share behind a toggle", async ({ page, visit }) => {
      await visit(PATH);
      await expectContentsToggle(page);
    });
  });

  test("a link straight to a section opens on that section", async ({ page, visit }) => {
    const id = getHeadingId(HEADINGS.at(-1) ?? "");
    await visit(`${PATH}#${id}`);

    await expectScrolledTo(page, `[id="${id}"]`);
  });
});

test.describe("post code samples", () => {
  test("copy puts the exact sample on the clipboard and confirms it", async ({
    page,
    visit,
    clipboard,
  }) => {
    const post = getCodeHeavyPost();
    const samples = readPostArticle(post).codeSamples;
    await visit(getPostPath(post));
    const figures = page.locator("figure").filter({ has: page.locator("pre") });

    await expect(figures).toHaveCount(samples.length);
    for (const [index, sample] of samples.entries()) {
      const button = figures.nth(index).getByRole("button");

      await expect(button).toHaveText("Copy");
      await button.click();

      await expect(button).toHaveText("Copied");
      expect(await clipboard.read()).toBe(sample.code);
      await expect(button).toHaveText("Copy");
    }
  });

  test("copy works from the keyboard", async ({ page, visit, clipboard }) => {
    const [sample] = ARTICLE.codeSamples;
    await visit(PATH);
    const button = page
      .locator("figure")
      .filter({ has: page.locator("pre") })
      .first()
      .getByRole("button");

    await button.focus();
    await page.keyboard.press("Enter");

    await expect(button).toHaveText("Copied");
    expect(await clipboard.read()).toBe(sample?.code);
  });

  test("does not claim success when the clipboard refuses", async ({ page, visit }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: () => Promise.reject(new Error("denied")) },
      });
    });
    await visit(PATH);
    const button = page
      .locator("figure")
      .filter({ has: page.locator("pre") })
      .first()
      .getByRole("button");

    await button.click();
    await page.waitForTimeout(500);

    await expect(button).toHaveText("Copy");
  });

  test("a wide sample scrolls inside its frame and can be reached by keyboard", async ({
    page,
    visit,
  }) => {
    await visit(PATH);
    const sample = page.locator("pre").first();

    await sample.focus();
    await expect(sample).toBeFocused();
    await expect(sample).toHaveAccessibleName(/code sample$/);
    expect(await sample.evaluate((element) => getComputedStyle(element).overflowX)).toBe("auto");
    expect(await getOverflow(page)).toBe(0);
  });

  for (const theme of ["light", "dark"] as const) {
    test(`colours code tokens with the ${theme} theme`, async ({ page, visit }) => {
      await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), {
        key: STORAGE_KEYS.theme,
        value: theme,
      });
      await visit(getPostPath(getCodeHeavyPost()));
      const tokens = page.locator("pre code span[style]");

      await expect(tokens.first()).toBeAttached();
      const colours = await tokens.evaluateAll((spans, variable) => {
        const probe = document.createElement("span");
        document.body.append(probe);
        const pairs = spans.slice(0, 20).map((span) => {
          probe.style.color = span.style.getPropertyValue(variable);
          return [getComputedStyle(span).color, getComputedStyle(probe).color];
        });
        probe.remove();
        return pairs;
      }, `--shiki-${theme}`);

      expect(colours.length).toBeGreaterThan(0);
      for (const [shown, expected] of colours) expect(shown).toBe(expected);
    });
  }
});

test.describe("post diagrams", () => {
  test("can be replayed while motion is on", async ({ page, visit }) => {
    const [diagram] = DIAGRAMS;
    if (!diagram) throw new Error(`${PATH} has no diagram to test`);
    await visit(PATH);
    const figure = page.locator("figure").filter({ hasText: diagram.caption });
    const replay = figure.getByRole("button", { name: "Replay" });

    await replay.scrollIntoViewIfNeeded();
    await expect(replay).toBeVisible();
    await replay.click();

    await expect(figure.getByRole("img", { name: diagram.alt })).toBeVisible();
    await expect(figure.locator("figcaption")).toHaveText(diagram.caption);
  });

  test("is a labelled, focusable frame that scrolls sideways on small screens", async ({
    page,
    visit,
    layout,
  }) => {
    const [diagram] = DIAGRAMS;
    if (!diagram) throw new Error(`${PATH} has no diagram to test`);
    await visit(PATH);
    const frame = page.getByRole("group", { name: `Diagram: ${diagram.caption}` });

    await frame.focus();
    await expect(frame).toBeFocused();
    if (layout === "phone") {
      const before = await frame.evaluate((element) => element.scrollWidth - element.clientWidth);
      expect(before).toBeGreaterThan(0);
      await frame.evaluate((element) => element.scrollTo({ left: 120 }));
      await expect.poll(() => frame.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
    }
    expect(await getOverflow(page)).toBe(0);
  });

  test.describe("with reduced motion", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });

    test("shows the finished drawing and no replay control", async ({ page, visit }) => {
      const [diagram] = DIAGRAMS;
      if (!diagram) throw new Error(`${PATH} has no diagram to test`);
      await visit(PATH);
      const figure = page.locator("figure").filter({ hasText: diagram.caption });

      await figure.scrollIntoViewIfNeeded();
      await expect(figure.getByRole("img", { name: diagram.alt })).toBeVisible();
      await expect(figure.getByRole("button", { name: "Replay" })).toBeHidden();
      expect(
        await figure
          .locator("[data-d]")
          .evaluateAll(
            (pieces) => pieces.filter((piece) => getComputedStyle(piece).opacity !== "1").length,
          ),
      ).toBe(0);
    });
  });
});

test.describe("post sharing", () => {
  test("copy link puts the canonical address on the clipboard and announces it", async ({
    page,
    visit,
    layout,
    clipboard,
  }) => {
    await visit(PATH);
    await openArticleAside(page, layout);
    const button = page.getByRole("button", { name: "Copy link" });

    await expect(button.locator("[aria-live]")).toHaveText("");
    await button.click();

    await expect(button.locator("[aria-live]")).toHaveText("Copied");
    expect(await clipboard.read()).toBe(`${site.url}${PATH}`);
    await expect(button).toHaveAccessibleName(/Copy link/);
    await expect(button.locator("[aria-live]")).toHaveText("");
  });

  test("share links carry this post's address", async ({ page, visit, layout }) => {
    await visit(PATH);
    await openArticleAside(page, layout);
    const target = encodeURIComponent(`${site.url}${PATH}`);

    await expect(
      page.getByRole("link", { name: "Share on LinkedIn (opens in a new tab)" }),
    ).toHaveAttribute("href", `https://www.linkedin.com/sharing/share-offsite/?url=${target}`);
    await expect(
      page.getByRole("link", { name: "Share on X (opens in a new tab)" }),
    ).toHaveAttribute(
      "href",
      `https://x.com/intent/tweet?url=${target}&text=${encodeURIComponent(POST.title)}`,
    );
  });
});

test.describe("post further reading", () => {
  test("a suggested post opens at its top", async ({ page, visit }) => {
    await visit(PATH);
    const more = page.getByRole("region", { name: "Keep reading" });
    const link = more.getByRole("article").first().getByRole("link");
    const href = (await link.getAttribute("href")) ?? "";

    await link.click();

    await expect(page).toHaveURL(new RegExp(`${href}$`));
    expect(href).not.toBe(PATH);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect.poll(() => scrollY(page)).toBe(0);
  });

  test('"All posts" returns to the index', async ({ page, visit }) => {
    await visit(PATH);

    await page
      .getByRole("region", { name: "Keep reading" })
      .getByRole("link", { name: "All posts" })
      .click();

    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.getByRole("region", { name: "Latest posts" })).toBeVisible();
  });
});
