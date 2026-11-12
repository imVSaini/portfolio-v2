import { posts } from "@/data/posts";
import { site } from "@/data/site";

import { expect, scrollY, test } from "../fixtures";
import { getFirstPost, getPostPath } from "../routes";

function getSecondPost() {
  const [, second] = posts;
  if (!second) throw new Error("the blog index tests need at least two posts");
  return second;
}

test.describe("blog index", () => {
  test("features the newest post and lists the rest as cards", async ({ page, visit }) => {
    await visit("/blog");
    const latest = page.getByRole("region", { name: "Latest posts" });

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Notes\s*from\s*production\./);
    await expect(latest.getByRole("article")).toHaveCount(posts.length);
    await expect(latest.getByRole("listitem").getByRole("article")).toHaveCount(posts.length - 1);
    await expect(latest.getByRole("article").getByRole("heading", { level: 3 })).toHaveText(
      posts.map((post) => post.title),
    );
    await expect(latest.getByRole("article").first()).toBeInViewport();
  });

  test("the featured title opens its post without a full page load", async ({ page, visit }) => {
    const post = getFirstPost();
    await visit("/blog");
    await page.evaluate(() => document.documentElement.setAttribute("data-e2e", "kept"));

    await page.getByRole("link", { name: post.title, exact: true }).click();

    await expect(page).toHaveURL(new RegExp(`${getPostPath(post)}$`));
    await expect(page).toHaveTitle(`${post.title} — ${site.name}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(post.title);
    await expect(page.locator("html")).toHaveAttribute("data-e2e", "kept");
  });

  test("the whole featured card is clickable, cover included", async ({ page, visit }) => {
    const post = getFirstPost();
    await visit("/blog");

    await page
      .getByRole("region", { name: "Latest posts" })
      .getByRole("article")
      .first()
      .click({ position: { x: 24, y: 24 } });

    await expect(page).toHaveURL(new RegExp(`${getPostPath(post)}$`));
  });

  test("a card opens its post from anywhere on the card", async ({ page, visit }) => {
    const post = getSecondPost();
    await visit("/blog");
    const card = page.getByRole("article").filter({
      has: page.getByRole("heading", { name: post.title, exact: true }),
    });

    await card.scrollIntoViewIfNeeded();
    const box = await card.getByText(post.excerpt).boundingBox();
    if (!box) throw new Error("the card's excerpt is not rendered");
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);

    await expect(page).toHaveURL(new RegExp(`${getPostPath(post)}$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(post.title);
    await expect.poll(() => scrollY(page)).toBe(0);
  });

  test("a card opens from the keyboard", async ({ page, visit }) => {
    const post = getSecondPost();
    await visit("/blog");
    const link = page.getByRole("link", { name: post.title, exact: true });

    await link.focus();
    await expect(link).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(new RegExp(`${getPostPath(post)}$`));
  });

  test("every card links to its own post", async ({ page, visit }) => {
    await visit("/blog");

    for (const post of posts) {
      await expect(page.getByRole("link", { name: post.title, exact: true })).toHaveAttribute(
        "href",
        getPostPath(post),
      );
    }
  });

  test("the breadcrumb of a post leads back to the index and home", async ({ page, visit }) => {
    await visit(getPostPath(getFirstPost()));
    const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });

    await breadcrumb.getByRole("link", { name: "Blog" }).click();
    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.getByRole("region", { name: "Latest posts" })).toBeVisible();

    await page.goBack();
    await breadcrumb.getByRole("link", { name: "Home" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("region", { name: "Introduction" })).toBeVisible();
  });
});
