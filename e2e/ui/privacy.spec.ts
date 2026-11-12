import type { Page } from "@playwright/test";

import { contact } from "@/data/contact";
import { site } from "@/data/site";
import { INTRO_KEY, STORAGE_KEYS } from "@/lib/appearance";

import { expect, openAppearance, scrollThrough, test } from "../fixtures";
import { getSampleRoutes } from "../routes";

const OWN_HOSTS = ["localhost", "127.0.0.1", new URL(site.assetsUrl).hostname];

function readKeys(page: Page, area: "localStorage" | "sessionStorage"): Promise<string[]> {
  return page.evaluate((name) => Object.keys(window[name]).sort(), area);
}

function watchHosts(page: Page): Set<string> {
  const hosts = new Set<string>();
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.protocol === "http:" || url.protocol === "https:") hosts.add(url.hostname);
  });
  return hosts;
}

test.describe("privacy promises", () => {
  for (const path of getSampleRoutes()) {
    test(`${path} sets no cookies and calls no outside service`, async ({
      page,
      context,
      visit,
    }) => {
      const hosts = watchHosts(page);

      await visit(path);
      await scrollThrough(page);
      await expect(page.getByRole("contentinfo")).toBeInViewport();

      expect(await context.cookies()).toEqual([]);
      expect([...hosts].filter((host) => !OWN_HOSTS.includes(host))).toEqual([]);
    });
  }

  test("a first visit stores nothing but the intro flag", async ({ page, visit }) => {
    await visit("/");
    await scrollThrough(page);

    expect(await readKeys(page, "localStorage")).toEqual([]);
    expect(await readKeys(page, "sessionStorage")).toEqual([INTRO_KEY]);
  });

  test("changing the appearance stores only the three documented keys", async ({
    page,
    visit,
    layout,
  }) => {
    await visit("/");
    const controls = await openAppearance(page, layout);

    await controls.getByRole("button", { name: "Dark", exact: true }).click();
    await controls.getByRole("radio", { name: "Red" }).click();

    await expect
      .poll(() => readKeys(page, "localStorage"))
      .toEqual(Object.values(STORAGE_KEYS).sort());
    expect(await readKeys(page, "sessionStorage")).toEqual([INTRO_KEY]);
    expect(await page.context().cookies()).toEqual([]);
  });

  test("the policy names everything the site stores", async ({ page, visit }) => {
    await visit("/privacy");
    const main = page.getByRole("main");

    await expect(main.getByRole("heading", { level: 1 })).toHaveText(/Privacy\s*policy/);
    for (const key of [...Object.values(STORAGE_KEYS), INTRO_KEY]) {
      await expect(main.locator("code").filter({ hasText: key })).toHaveCount(1);
    }
    await expect(main.getByRole("link", { name: contact.email })).toHaveAttribute(
      "href",
      `mailto:${contact.email}`,
    );
  });

  test("the policy keeps its sections in a readable outline", async ({ page, visit }) => {
    await visit("/privacy");

    await expect(page.getByRole("main").getByRole("heading", { level: 2 })).toHaveText([
      "What I collect",
      "Stored on your device",
      "Hosting",
      "If you email me",
      "Other sites",
      "Questions",
    ]);
  });
});
