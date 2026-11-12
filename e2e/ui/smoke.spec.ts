import type { Page } from "@playwright/test";

import { expect, scrollThrough, test } from "../fixtures";
import { MISSING_ROUTES, PAGE_ROUTES } from "../routes";

type Problems = { errors: string[]; responses: string[] };

function watch(page: Page): Problems {
  const problems: Problems = { errors: [], responses: [] };

  page.on("pageerror", (error) => problems.errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") problems.errors.push(message.text());
  });
  page.on("response", (response) => {
    if (response.status() >= 400) {
      problems.responses.push(`${response.status()} ${new URL(response.url()).pathname}`);
    }
  });

  return problems;
}

test.describe("smoke", () => {
  for (const path of PAGE_ROUTES) {
    test(`${path} loads, hydrates and scrolls without errors`, async ({ page, visit }) => {
      const problems = watch(page);

      await visit(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await scrollThrough(page);
      await expect(page.getByRole("contentinfo")).toBeInViewport();

      expect(problems.responses).toEqual([]);
      expect(problems.errors).toEqual([]);
    });
  }

  for (const path of MISSING_ROUTES) {
    test(`${path} fails only with its own 404`, async ({ page, visit }) => {
      const problems = watch(page);

      await visit(path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Nothing\s*here\./);

      expect(problems.responses).toEqual([`404 ${path}`]);
      expect(problems.errors.filter((error) => !error.includes("404"))).toEqual([]);
    });
  }
});
