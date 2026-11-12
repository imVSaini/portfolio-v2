import { caseStudies, caseStudiesPage, type CaseStudy } from "@/data/caseStudies";
import { site } from "@/data/site";
import { getHeadingId } from "@/lib/article";
import { DECISIONS_HEADING, getCaseStudyHeadings } from "@/lib/caseStudies";

import { clickWhenSettled, expect, expectScrolledTo, test } from "../fixtures";
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
});

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
