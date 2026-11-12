import { expect, test } from "@playwright/test";

import { contact } from "@/data/contact";
import { experience } from "@/data/experience";
import { posts } from "@/data/posts";
import { projects } from "@/data/projects";
import { nav, site } from "@/data/site";
import { skillGroups } from "@/data/skills";
import { INTRO_KEY, STORAGE_KEYS } from "@/lib/appearance";
import { getHomeHref } from "@/lib/nav";
import { formatPostDate } from "@/lib/posts";

import { getFirstPost, getPostPath, PAGE_ROUTES } from "../routes";

const HOME_SECTIONS = ["top", "work", "experience", "skills", "contact"];

const PRIVACY_SECTIONS = [
  "What I collect",
  "Stored on your device",
  "Hosting",
  "If you email me",
  "Other sites",
  "Questions",
];

test.describe("pages without JavaScript", () => {
  for (const path of [...PAGE_ROUTES, "/nope"]) {
    test(`${path} shows its content`, async ({ page }) => {
      await page.goto(path);

      const concealed = await page
        .locator("main")
        .locator("h1, h2, h3, h4, p, li, a, button, figcaption, blockquote, pre")
        .evaluateAll((elements) =>
          elements
            .filter((element) => {
              if (element.closest("[aria-hidden='true'], .sr-only")) return false;
              if (element.getClientRects().length === 0) return false;
              if (getComputedStyle(element).visibility === "hidden") return true;
              for (let node: Element | null = element; node; node = node.parentElement) {
                if (getComputedStyle(node).opacity === "0") return true;
              }
              return false;
            })
            .map((element) => element.textContent.trim().slice(0, 60)),
        );

      await expect(page.locator("main#main")).toBeVisible();
      await expect(page.locator("h1")).toBeVisible();
      expect(concealed).toEqual([]);
    });

    test(`${path} has a heading outline without gaps`, async ({ page }) => {
      await page.goto(path);

      const levels = await page
        .locator("h1, h2, h3, h4, h5, h6")
        .evaluateAll((headings) => headings.map((heading) => Number(heading.tagName.slice(1))));
      const jumps = levels.filter((level, i) => level - (levels[i - 1] ?? 0) > 1);

      expect(levels[0]).toBe(1);
      expect(levels.filter((level) => level === 1)).toHaveLength(1);
      expect(jumps).toEqual([]);
    });

    test(`${path} starts with a skip link to the main content`, async ({ page }) => {
      await page.goto(path);

      const first = page.locator("body a").first();

      await expect(first).toHaveAttribute("href", "#main");
      await expect(first).toHaveText("Skip to content");
      await expect(page.locator("#main")).toHaveCount(1);
    });
  }
});

test.describe("home without JavaScript", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("introduces the site and links to the work and contact sections", async ({ page }) => {
    const hero = page.locator("#top");

    await expect(page.locator("h1")).toHaveText(/Backend depth,\s*frontend\s*finish\./);
    await expect(hero).toHaveAttribute("aria-label", "Introduction");
    await expect(hero).toContainText(`I’m ${site.shortName}, a full stack developer`);
    await expect(hero.getByRole("link", { name: "See selected work" })).toHaveAttribute(
      "href",
      "#work",
    );
    await expect(hero.getByRole("link", { name: "Start a conversation" })).toHaveAttribute(
      "href",
      "#contact",
    );
  });

  test("has every section the navigation points at", async ({ page }) => {
    for (const id of HOME_SECTIONS) {
      await expect(page.locator(`section#${id}`)).toHaveCount(1);
    }
    for (const item of nav) {
      if (item.kind === "section") await expect(page.locator(item.href)).toHaveCount(1);
    }
  });

  test("links the primary navigation to in-page sections", async ({ page }) => {
    const links = page.getByRole("navigation", { name: "Primary" }).getByRole("link");

    await expect(links).toHaveCount(nav.length);
    for (const [index, item] of nav.entries()) {
      await expect(links.nth(index)).toHaveAccessibleName(item.label);
      await expect(links.nth(index)).toHaveAttribute("href", item.href);
    }
  });

  test("lists every project with its client, summary, stack and live link", async ({ page }) => {
    const work = page.locator("#work");
    const panels = work.locator("article[data-h-panel]");

    await expect(work).toHaveAttribute("aria-label", "Selected work");
    await expect(panels).toHaveCount(projects.length);
    for (const [index, project] of projects.entries()) {
      const panel = panels.nth(index);

      await expect(panel.getByRole("heading", { level: 3 })).toHaveText(project.title);
      await expect(panel).toContainText(project.category);
      await expect(panel).toContainText(project.client);
      await expect(panel).toContainText(project.blurb);
      await expect(panel.locator("ul > li")).toHaveText(project.stack);
      for (const link of await panel.getByRole("link").all()) {
        await expect(link).toHaveAttribute("href", project.url);
      }
    }
    await expect(work.getByRole("link", { name: /GitHub/ })).toHaveAttribute(
      "href",
      contact.links.find((link) => link.label === "GitHub")?.href ?? "",
    );
  });

  test("keeps every project reachable without JavaScript", async ({ page }) => {
    test.fail(
      true,
      "The horizontal track is laid out by CSS alone, so without the script that pins it the " +
        "section clips every project after the first.",
    );

    const clipped = await page
      .locator("#work")
      .evaluate((section) => section.scrollWidth - section.clientWidth);

    expect(clipped).toBeLessThanOrEqual(1);
  });

  test("lists every role with its dates, summary, highlights and stack", async ({ page }) => {
    const section = page.locator("#experience");
    const roles = section.locator("li[data-xp-role]");

    await expect(section.getByRole("heading", { level: 2 })).toHaveText(
      "Seven years of keeping production calm.",
    );
    await expect(roles).toHaveCount(experience.length + 1);
    await expect(roles.last().getByRole("heading", { level: 3 })).toHaveText("Your team?");
    for (const [index, role] of experience.entries()) {
      const entry = roles.nth(index);

      await expect(entry.getByRole("heading", { level: 3 })).toHaveText(role.title);
      await expect(entry).toContainText(role.company);
      await expect(entry).toContainText(`${role.start} — ${role.end}`);
      await expect(entry).toContainText(role.summary);
      for (const highlight of role.highlights) {
        await expect(entry).toContainText(highlight);
      }
      for (const tool of role.stack) {
        await expect(entry.getByText(tool, { exact: true }).first()).toBeVisible();
      }
    }
    await expect(section.getByRole("link", { name: "Let’s talk" })).toHaveAttribute(
      "href",
      "#contact",
    );
  });

  test("groups every skill under its discipline", async ({ page }) => {
    const section = page.locator("#skills");
    const total = skillGroups.reduce((sum, group) => sum + group.items.length, 0);

    await expect(section.getByRole("heading", { level: 2 })).toHaveText(
      "One toolbox, the whole stack.",
    );
    await expect(section).toContainText(`${total} tools across ${skillGroups.length} disciplines`);
    await expect(section.getByRole("heading", { level: 3 })).toHaveText(
      skillGroups.map((group) => group.name),
    );
    for (const group of skillGroups) {
      const card = section
        .locator("li")
        .filter({ has: page.getByRole("heading", { level: 3, name: group.name, exact: true }) });

      await expect(card.locator("ul > li")).toHaveText(group.items);
    }
  });

  test("offers a way to get in touch", async ({ page }) => {
    const section = page.locator("#contact");

    await expect(section.getByRole("heading", { level: 2 })).toHaveText(
      /Got an idea\?\s*Say hello\./,
    );
    await expect(section.getByRole("link", { name: contact.email })).toHaveAttribute(
      "href",
      `mailto:${contact.email}`,
    );
    await expect(section.locator("time")).toHaveCount(1);
  });
});

test.describe("site chrome without JavaScript", () => {
  for (const path of ["/blog", "/privacy", getPostPath(getFirstPost())]) {
    test(`${path} links the navigation back to the home sections`, async ({ page }) => {
      await page.goto(path);
      const links = page.getByRole("navigation", { name: "Primary" }).getByRole("link");

      await expect(links).toHaveCount(nav.length);
      for (const [index, item] of nav.entries()) {
        await expect(links.nth(index)).toHaveAccessibleName(item.label);
        await expect(links.nth(index)).toHaveAttribute(
          "href",
          item.kind === "page" ? item.href : getHomeHref(item.href),
        );
      }
      await expect(page.getByRole("link", { name: `${site.name}, home` })).toHaveAttribute(
        "href",
        "/",
      );
    });
  }

  test("marks the blog as the current page only inside the blog", async ({ page }) => {
    const current = page.getByRole("navigation", { name: "Primary" }).locator("[aria-current]");

    await page.goto("/blog");
    await expect(current).toHaveAccessibleName("Blog");
    await expect(current).toHaveAttribute("aria-current", "page");

    await page.goto("/privacy");
    await expect(current).toHaveCount(0);
  });

  for (const path of ["/", "/blog", "/privacy"]) {
    test(`${path} ends with the footer links and the copyright line`, async ({ page }) => {
      await page.goto(path);
      const footer = page.locator("body footer").last();

      for (const link of contact.links) {
        const anchor = footer.getByRole("link", { name: `${link.label} (opens in a new tab)` });

        await expect(anchor).toHaveAttribute("href", link.href);
        await expect(anchor).toHaveAttribute("target", "_blank");
        await expect(anchor).toHaveAttribute("rel", /noreferrer/);
      }
      await expect(footer.getByRole("link", { name: "RSS feed of the blog" })).toHaveAttribute(
        "href",
        "/rss.xml",
      );
      await expect(footer.getByRole("link", { name: "Back to top" })).toHaveAttribute(
        "href",
        "#top",
      );
      await expect(
        footer.getByRole("navigation", { name: "Legal" }).getByRole("link", {
          name: "Privacy policy",
        }),
      ).toHaveAttribute("href", "/privacy");
      await expect(footer).toContainText(new RegExp(`© \\d{4} ${site.fullName}`));
    });
  }
});

test.describe("blog index without JavaScript", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blog");
  });

  test("lists every post newest first, each linked to its page", async ({ page }) => {
    const cards = page.locator("main article");
    const titles = cards.getByRole("heading", { level: 3 }).getByRole("link");

    await expect(page.locator("h1")).toHaveText(/Notes from\s*production\./);
    await expect(cards).toHaveCount(posts.length);
    await expect(titles).toHaveText(posts.map((post) => post.title));
    for (const [index, post] of posts.entries()) {
      await expect(titles.nth(index)).toHaveAttribute("href", getPostPath(post));
    }
  });

  test("shows each post's topic, date, excerpt and reading time", async ({ page }) => {
    const cards = page.locator("main article");

    for (const [index, post] of posts.entries()) {
      const card = cards.nth(index);
      const date = card.locator("time").first();

      await expect(card).toContainText(post.topic);
      await expect(card).toContainText(post.excerpt);
      await expect(card).toContainText(`${post.readMinutes} min read`);
      await expect(card).toContainText(site.name);
      await expect(date).toHaveAttribute("datetime", post.date);
      await expect(date).toHaveText(formatPostDate(post.date));
    }
  });

  test("leads with the latest post as the featured one", async ({ page }) => {
    const [latest] = posts;
    const featured = page.locator("main section > article");

    await expect(featured).toHaveCount(1);
    await expect(featured.getByRole("heading", { level: 3 })).toHaveText(latest?.title ?? "");
    await expect(page.locator("main section > ul > li")).toHaveCount(posts.length - 1);
  });
});

test.describe("privacy policy without JavaScript", () => {
  test("covers each topic and names the keys it stores", async ({ page }) => {
    await page.goto("/privacy");
    const main = page.locator("main");

    await expect(page.locator("h1")).toHaveText("Privacy policy");
    await expect(main.getByRole("heading", { level: 2 })).toHaveText(PRIVACY_SECTIONS);
    await expect(main).toContainText(/Last updated \d{1,2} \w+ \d{4}\./);
    await expect(main.locator("code")).toHaveText([...Object.values(STORAGE_KEYS), INTRO_KEY]);
    await expect(main.getByRole("link", { name: contact.email })).toHaveAttribute(
      "href",
      `mailto:${contact.email}`,
    );
  });
});

test.describe("not found without JavaScript", () => {
  test("an unmatched path explains itself and links home", async ({ page }) => {
    await page.goto("/nope");
    const main = page.locator("main");

    await expect(main).toContainText("Error 404");
    await expect(page.locator("h1")).toHaveText(/Nothing\s*here\./);
    await expect(main.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/");
  });

  test("an unknown post renders the same page on the server", async ({ page }) => {
    test.fail(
      true,
      "/blog/<unknown> answers 404 with an empty shell that only fills in after hydration, so " +
        "readers and crawlers without JavaScript get a blank page.",
    );

    await page.goto("/blog/nope");

    await expect(page.locator("h1")).toHaveText(/Nothing\s*here\./, { timeout: 2_000 });
  });
});
