import { contact } from "@/data/contact";
import { nav, site } from "@/data/site";

import {
  clickWhenSettled,
  expect,
  expectScrolledTo,
  openSiteNav,
  scrollToEnd,
  scrollY,
  test,
} from "../fixtures";
import { getFirstPost, getPostPath, MISSING_ROUTES } from "../routes";

const SECTION_LINKS = nav.filter((item) => item.kind === "section" && item.href !== "#top");
const BLOG_HEADING = /Notes\s*from\s*production\./;

test.describe("site navigation on the home page", () => {
  for (const { label, href } of SECTION_LINKS) {
    test(`"${label}" travels to ${href}`, async ({ page, visit, layout }) => {
      await visit("/");
      const navigation = await openSiteNav(page, layout);

      await navigation.getByRole("link", { name: label, exact: true }).click();

      await expectScrolledTo(page, href);
    });
  }

  for (const { label, href } of SECTION_LINKS) {
    test(
      `"${label}" records ${href} in the address bar`,
      { tag: "@desktop" },
      async ({ page, visit }) => {
        await visit("/");

        await page
          .getByRole("navigation", { name: "Primary" })
          .getByRole("link", { name: label, exact: true })
          .click();

        await expect(page).toHaveURL(new RegExp(`/${href}$`));
        await expect(page.locator(href)).toBeFocused();
      },
    );
  }

  test('"Home" returns to the top and clears the hash', async ({ page, visit, layout }) => {
    await visit("/");
    const navigation = await openSiteNav(page, layout);
    await navigation.getByRole("link", { name: "Contact", exact: true }).click();
    await expectScrolledTo(page, "#contact");

    const again = await openSiteNav(page, layout);
    await again.getByRole("link", { name: "Home", exact: true }).click();

    await expect.poll(() => scrollY(page)).toBe(0);
    if (layout === "desktop") {
      await expect(page).toHaveURL(/\/$/);
      await expect(page.locator("body")).toBeFocused();
    }
  });

  test("the logo returns to the top", async ({ page, visit }) => {
    await visit("/");
    await scrollToEnd(page);
    const logo = page.getByRole("link", { name: `${site.name}, back to top` });

    await expect(logo).toHaveAttribute("href", "#top");
    await clickWhenSettled(logo);

    await expect.poll(() => scrollY(page)).toBe(0);
    await expect(page).toHaveURL(/\/$/);
  });

  test('the footer\'s "Back to top" returns to the top', async ({ page, visit }) => {
    await visit("/");
    await scrollToEnd(page);

    await clickWhenSettled(
      page.getByRole("contentinfo").getByRole("link", { name: "Back to top" }),
    );

    await expect.poll(() => scrollY(page)).toBe(0);
  });

  test("a link straight to a section opens on that section", async ({ page, visit }) => {
    await visit("/#contact");

    await expectScrolledTo(page, "#contact");
  });
});

test.describe("moving between pages", () => {
  test('"Blog" opens the blog without a full page load', async ({ page, visit, layout }) => {
    await visit("/");
    await page.evaluate(() => document.documentElement.setAttribute("data-e2e", "kept"));
    const navigation = await openSiteNav(page, layout);

    await navigation.getByRole("link", { name: "Blog", exact: true }).click();

    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(BLOG_HEADING);
    await expect(page.locator("html")).toHaveAttribute("data-e2e", "kept");
    await expect.poll(() => scrollY(page)).toBe(0);
  });

  test("marks the current page in the navigation", async ({ page, visit, layout }) => {
    await visit("/blog");
    const navigation = await openSiteNav(page, layout);

    await expect(navigation.getByRole("link", { name: "Blog", exact: true })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(navigation.locator("[aria-current]")).toHaveCount(1);
  });

  test("a section link on another page lands on that section of home", async ({
    page,
    visit,
    layout,
  }) => {
    await visit("/blog");
    const navigation = await openSiteNav(page, layout);

    await navigation.getByRole("link", { name: "Work", exact: true }).click();

    await expect(page).toHaveURL(/\/#work$/);
    await expectScrolledTo(page, "#work");
  });

  test("the logo leads home from another page", async ({ page, visit }) => {
    await visit("/privacy");

    await page.getByRole("link", { name: `${site.name}, home` }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("region", { name: "Introduction" })).toBeVisible();
    await expect(page.getByRole("link", { name: `${site.name}, back to top` })).toBeVisible();
  });

  test("the footer leads to the privacy policy", async ({ page, visit }) => {
    await visit("/");
    await scrollToEnd(page);

    await page.getByRole("contentinfo").getByRole("link", { name: "Privacy policy" }).click();

    await expect(page).toHaveURL(/\/privacy$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page).toHaveTitle(`Privacy policy — ${site.name}`);
  });

  test("back and forward retrace home, blog and a post", async ({ page, visit, layout }) => {
    const post = getFirstPost();
    await visit("/");
    const navigation = await openSiteNav(page, layout);
    await navigation.getByRole("link", { name: "Blog", exact: true }).click();
    await expect(page).toHaveURL(/\/blog$/);

    await page.getByRole("link", { name: post.title, exact: true }).first().click();
    await expect(page).toHaveURL(new RegExp(`${getPostPath(post)}$`));
    await expect(page).toHaveTitle(`${post.title} — ${site.name}`);

    await page.goBack();
    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(BLOG_HEADING);

    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("region", { name: "Introduction" })).toBeVisible();

    await page.goForward();
    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(BLOG_HEADING);
  });

  test("an outside link opens in a new tab that cannot reach back", async ({
    page,
    context,
    visit,
  }) => {
    const [link] = contact.links;
    await context.route(
      (url) => url.hostname !== "localhost" && url.hostname !== "127.0.0.1",
      (route) => route.fulfill({ contentType: "text/html", body: "<title>Outside</title>" }),
    );
    await visit("/");
    await scrollToEnd(page);

    const opening = page.waitForEvent("popup");
    await page
      .getByRole("contentinfo")
      .getByRole("link", { name: `${link.label} (opens in a new tab)` })
      .click();
    const popup = await opening;
    await popup.waitForLoadState();

    expect(popup.url()).toBe(link.href);
    expect(await popup.evaluate(() => window.opener === null)).toBe(true);
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe("pages that do not exist", () => {
  for (const path of MISSING_ROUTES) {
    test(`${path} offers a way back home`, async ({ page, visit }) => {
      await visit(path);
      const main = page.getByRole("main");

      await expect(main.getByText("Error 404")).toBeVisible();
      await expect(main.getByRole("heading", { level: 1 })).toHaveText(/Nothing\s*here\./);
      await main.getByRole("link", { name: "Back to home" }).click();

      await expect(page).toHaveURL(/\/$/);
      await expect(page.getByRole("region", { name: "Introduction" })).toBeVisible();
    });
  }
});
