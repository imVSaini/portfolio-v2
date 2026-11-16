import type { Page } from "@playwright/test";

import { caseStudies, caseStudiesPage, type CaseStudy } from "@/data/caseStudies";
import { site } from "@/data/site";
import { getHeadingId } from "@/lib/article";
import { DECISIONS_HEADING, getCaseStudyHeadings } from "@/lib/caseStudies";

import {
  clickWhenSettled,
  expect,
  expectScrolledTo,
  hoverWhenSettled,
  isArrowSwapped,
  test,
} from "../fixtures";
import { getCaseStudyPath, getFirstCaseStudy } from "../routes";

const STUDY = getFirstCaseStudy();
const PATH = getCaseStudyPath(STUDY);

function getNextCaseStudy(): CaseStudy {
  const [, second] = caseStudies;
  if (!second) throw new Error("the case study tests need at least two case studies");
  return second;
}

test.describe("case studies index", () => {
  test("lists every case study in order", async ({ page, visit }) => {
    await visit(caseStudiesPage.path);
    const entries = page.getByRole("main").getByRole("article");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/How\s*it\s*was\s*built\./);
    await expect(entries).toHaveCount(caseStudies.length);
    await expect(entries.getByRole("heading", { level: 2 })).toHaveText(
      caseStudies.map((study) => study.title),
    );
    for (const study of caseStudies) {
      const entry = entries.filter({
        has: page.getByRole("heading", { name: study.title, exact: true }),
      });

      await expect(entry.getByText(study.headline)).toBeVisible();
      await expect(entry.getByRole("link", { name: study.title, exact: true })).toHaveAttribute(
        "href",
        getCaseStudyPath(study),
      );
    }
  });

  test("a title opens its case study without a full page load", async ({ page, visit }) => {
    await visit(caseStudiesPage.path);
    await page.evaluate(() => document.documentElement.setAttribute("data-e2e", "kept"));

    await page.getByRole("link", { name: STUDY.title, exact: true }).click();

    await expect(page).toHaveURL(new RegExp(`${PATH}$`));
    await expect(page).toHaveTitle(`${STUDY.title} case study — ${site.name}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(STUDY.title);
    await expect(page.locator("html")).toHaveAttribute("data-e2e", "kept");
  });

  test("the whole entry is clickable, cover included", async ({ page, visit }) => {
    await visit(caseStudiesPage.path);

    await page
      .getByRole("main")
      .getByRole("article")
      .first()
      .click({ position: { x: 24, y: 24 } });

    await expect(page).toHaveURL(new RegExp(`${PATH}$`));
  });

  test("an entry opens from the keyboard", async ({ page, visit }) => {
    const study = getNextCaseStudy();
    await visit(caseStudiesPage.path);
    const link = page.getByRole("link", { name: study.title, exact: true });

    await link.focus();
    await expect(link).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(new RegExp(`${getCaseStudyPath(study)}$`));
  });

  test("swaps the Read the case study arrow on keyboard focus", async ({ page, visit, tabKey }) => {
    const study = getNextCaseStudy();
    await visit(caseStudiesPage.path);
    const link = page.getByRole("link", { name: study.title, exact: true });
    const cue = getReadCue(page, study);

    await link.focus();
    await page.keyboard.press(`Shift+${tabKey}`);
    await expect.poll(() => isArrowSwapped(cue)).toBe(false);
    await page.keyboard.press(tabKey);
    await expect(link).toBeFocused();
    await expect.poll(() => isArrowSwapped(cue)).toBe(true);
  });

  test(
    "swaps the Read the case study arrow on hover",
    { tag: "@desktop" },
    async ({ page, visit }) => {
      await visit(caseStudiesPage.path);
      const cue = getReadCue(page, STUDY);

      await expect.poll(() => isArrowSwapped(cue)).toBe(false);
      await hoverWhenSettled(page.getByRole("link", { name: STUDY.title, exact: true }));
      await expect.poll(() => isArrowSwapped(cue)).toBe(true);
    },
  );
});

function getReadCue(page: Page, study: CaseStudy) {
  return page
    .getByRole("main")
    .getByRole("article")
    .filter({ has: page.getByRole("heading", { name: study.title, exact: true }) })
    .locator("p[aria-hidden='true']", { hasText: "Read the case study" });
}

test.describe("case study", () => {
  test("shows the facts, the numbers and the stack", async ({ page, visit }) => {
    await visit(PATH);
    const main = page.getByRole("main").getByRole("article").first();

    await expect(main.getByText(STUDY.headline)).toBeVisible();
    for (const fact of STUDY.facts) {
      await expect(main.getByRole("term").filter({ hasText: fact.label })).toBeVisible();
      await expect(main.getByRole("definition").filter({ hasText: fact.value })).toBeVisible();
    }
    for (const metric of STUDY.metrics) {
      await expect(main.getByRole("term").filter({ hasText: metric.label })).toBeVisible();
    }
    await expect(main.getByRole("list", { name: "Stack" }).getByRole("listitem")).toHaveText(
      STUDY.stack,
    );
  });

  test("sets out every decision with what was chosen and what it cost", async ({ page, visit }) => {
    await visit(PATH);
    const decisions = page.getByRole("region", { name: DECISIONS_HEADING });

    await expect(decisions.getByRole("heading", { level: 3 })).toHaveText(
      STUDY.decisions.map((decision) => decision.title),
    );
    await expect(decisions.getByRole("term").filter({ hasText: "What I chose" })).toHaveCount(
      STUDY.decisions.length,
    );
    await expect(decisions.getByRole("term").filter({ hasText: "What it cost" })).toHaveCount(
      STUDY.decisions.length,
    );
  });

  for (const study of caseStudies) {
    test(`${study.slug} draws its architecture with a caption and a description`, async ({
      page,
      visit,
    }) => {
      const diagrams = study.overview.flatMap((block) => (block.type === "diagram" ? [block] : []));
      await visit(getCaseStudyPath(study));

      expect(diagrams.length).toBeGreaterThan(0);
      for (const diagram of diagrams) {
        const figure = page.locator("figure").filter({ hasText: diagram.caption });

        await figure.scrollIntoViewIfNeeded();
        await expect(
          figure.getByRole("group", { name: `Diagram: ${diagram.caption}` }),
        ).toBeVisible();
        await expect(figure.getByRole("img", { name: diagram.alt })).toBeVisible();
        await expect(figure.locator("figcaption")).toHaveText(diagram.caption);
      }
    });
  }

  test("the contents list covers every section and travels to the decisions", async ({
    page,
    visit,
  }) => {
    await visit(PATH);
    const headings = getCaseStudyHeadings(STUDY);
    const id = getHeadingId(DECISIONS_HEADING);
    const contents = page.getByRole("navigation", { name: "On this page" });

    await expect(contents.getByRole("link")).toHaveCount(headings.length);
    for (const heading of headings) {
      await expect(contents.getByRole("link", { name: heading })).toHaveAttribute(
        "href",
        `#${getHeadingId(heading)}`,
      );
    }

    await clickWhenSettled(contents.getByRole("link", { name: DECISIONS_HEADING }));

    await expectScrolledTo(page, `[id="${id}"]`);
    await expect(page).toHaveURL(new RegExp(`${PATH}#${id}$`));
  });

  test("stays beside the write-up on desktop", { tag: "@desktop" }, async ({ page, visit }) => {
    await visit(PATH);
    const contents = page.getByRole("navigation", { name: "On this page" });

    await page
      .locator(`[id="${getHeadingId(DECISIONS_HEADING)}"]`)
      .evaluate((element) =>
        window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 100),
      );

    await expect(contents).toBeInViewport({ ratio: 1 });
  });

  test("the breadcrumb leads back to the index and home", async ({ page, visit }) => {
    await visit(PATH);
    const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });

    await breadcrumb.getByRole("link", { name: caseStudiesPage.title }).click();
    await expect(page).toHaveURL(new RegExp(`${caseStudiesPage.path}$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/How\s*it\s*was\s*built\./);

    await page.goBack();
    await breadcrumb.getByRole("link", { name: "Home" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("region", { name: "Introduction" })).toBeVisible();
  });

  test("ends by offering the next case study", async ({ page, visit }) => {
    const next = getNextCaseStudy();
    await visit(PATH);
    const region = page.getByRole("region", { name: "Next case study" });

    await expect(region.getByRole("article")).toHaveCount(1);
    await clickWhenSettled(region.getByRole("link", { name: next.title, exact: true }));

    await expect(page).toHaveURL(new RegExp(`${getCaseStudyPath(next)}$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(next.title);
  });

  test("links back to the full list from the last section", async ({ page, visit }) => {
    await visit(PATH);

    await clickWhenSettled(
      page
        .getByRole("region", { name: "Next case study" })
        .getByRole("link", { name: "All case studies" }),
    );

    await expect(page).toHaveURL(new RegExp(`${caseStudiesPage.path}$`));
    await expect(page.getByRole("main").getByRole("article")).toHaveCount(caseStudies.length);
  });
});

const COVER_PATHS = [caseStudiesPage.path, ...caseStudies.map(getCaseStudyPath)];

const COVER_SIZES = [
  { width: 320, height: 568 },
  { width: 375, height: 667 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
] as const;

async function getCroppedCovers(page: Page) {
  return page.getByRole("main").evaluate((main) => {
    const covers = [...main.querySelectorAll("[data-cover]")];
    if (covers.length === 0) return ["no covers found"];
    return covers.flatMap((cover) => {
      const window = cover.lastElementChild;
      if (!window) return ["missing window"];
      const bottom = cover.getBoundingClientRect().bottom;
      const cropped = [...window.querySelectorAll("*")].some((part) => {
        const box = part.getBoundingClientRect();
        return box.width > 0 && box.height > 0 && box.bottom > bottom + 0.5;
      });
      return cropped ? [window.firstElementChild?.textContent ?? ""] : [];
    });
  });
}

test.describe("case study covers", () => {
  for (const path of COVER_PATHS) {
    test(
      `${path} shows every cover mock-up in full`,
      { tag: "@mobile" },
      async ({ page, visit }) => {
        await visit(path);
        expect(await getCroppedCovers(page)).toEqual([]);
      },
    );
  }

  for (const size of COVER_SIZES) {
    test.describe(`at ${size.width}×${size.height}`, { tag: "@desktop" }, () => {
      test.use({ viewport: size });

      for (const path of COVER_PATHS) {
        test(`${path} shows every cover mock-up in full`, async ({ page, visit }) => {
          await visit(path);
          expect(await getCroppedCovers(page)).toEqual([]);
        });
      }
    });
  }
});

const XL_SIZES = [
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
] as const;

async function getMovedFrames(page: Page) {
  return page.getByRole("main").evaluate((main) => {
    const covers = [...main.querySelectorAll("[data-cover]")];
    if (covers.length === 0) return ["no covers found"];
    return covers.flatMap((cover) => {
      const window = cover.lastElementChild;
      const [across = 0, down = 0] = getComputedStyle(cover).aspectRatio.split("/").map(Number);
      const frame = cover.getBoundingClientRect();
      const box = window?.getBoundingClientRect();
      const label = window?.firstElementChild?.textContent ?? "missing window";
      if (!box || across === 0) return [label];
      const fits =
        Math.abs(frame.height - (frame.width * down) / across) < 1 &&
        Math.abs(box.top - frame.top - frame.height * 0.14) < 1 &&
        Math.abs(box.bottom - frame.bottom) < 1 &&
        Math.abs(box.left - frame.left - frame.width * 0.08) < 1;
      return fits ? [] : [label];
    });
  });
}

test.describe("case study covers on xl screens", { tag: "@desktop" }, () => {
  for (const size of XL_SIZES) {
    test.describe(`at ${size.width}×${size.height}`, () => {
      test.use({ viewport: size });

      for (const path of COVER_PATHS) {
        test(`${path} keeps the fixed cover frame`, async ({ page, visit }) => {
          await visit(path);
          expect(await getMovedFrames(page)).toEqual([]);
        });
      }
    });
  }
});
