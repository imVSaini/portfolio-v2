import { contact } from "@/data/contact";
import { experience } from "@/data/experience";
import { projects } from "@/data/projects";
import { site } from "@/data/site";
import { skillGroups } from "@/data/skills";

import { clickWhenSettled, expect, expectScrolledTo, scrollToEnd, test } from "../fixtures";

const CITY = site.location.split(",")[0] ?? site.location;
const PERIODS = ["Morning", "Afternoon", "Evening", "Night"] as const;

const MOMENTS = [
  { utc: "2026-01-15T23:30:00Z", time: "05:00:00", period: "Morning" },
  { utc: "2026-01-15T06:29:59Z", time: "11:59:59", period: "Morning" },
  { utc: "2026-01-15T06:30:00Z", time: "12:00:00", period: "Afternoon" },
  { utc: "2026-01-15T11:30:00Z", time: "17:00:00", period: "Evening" },
  { utc: "2026-01-15T15:30:00Z", time: "21:00:00", period: "Night" },
  { utc: "2026-01-15T18:30:00Z", time: "00:00:00", period: "Night" },
  { utc: "2026-01-15T23:29:59Z", time: "04:59:59", period: "Night" },
] as const;

const CALLS_TO_ACTION = [
  { name: "See selected work", target: "#work" },
  { name: "Start a conversation", target: "#contact" },
] as const;

test.describe("hero", () => {
  test("introduces the site above the fold", async ({ page, visit }) => {
    await visit("/");
    const hero = page.getByRole("region", { name: "Introduction" });

    await expect(hero.getByRole("heading", { level: 1 })).toHaveText(
      /Backend\s*depth,\s*frontend\s*finish\./,
    );
    await expect(hero.getByRole("heading", { level: 1 })).toBeInViewport();
    for (const { name, target } of CALLS_TO_ACTION) {
      await expect(hero.getByRole("link", { name })).toBeInViewport();
      await expect(hero.getByRole("link", { name })).toHaveAttribute("href", target);
    }
  });

  for (const { name, target } of CALLS_TO_ACTION) {
    test(`"${name}" travels to ${target} and moves focus there`, async ({ page, visit }) => {
      await visit("/");

      await page.getByRole("link", { name }).click();

      await expectScrolledTo(page, target);
      await expect(page).toHaveURL(new RegExp(`/${target}$`));
      await expect(page.locator(target)).toBeFocused();
    });
  }
});

test.describe("selected work", () => {
  test(
    "shows every project as a panel from tablet width up",
    { tag: "@desktop" },
    async ({ page, visit }) => {
      await visit("/");
      const work = page.locator("#work");
      const panels = work.locator("article[data-h-panel]");

      await expect(panels).toHaveCount(projects.length);
      await expect(work.getByRole("button")).toHaveCount(0);
      for (const [index, project] of projects.entries()) {
        const panel = panels.nth(index);

        await expect(panel.getByRole("heading", { level: 3 })).toHaveText(project.title);
        await expect(
          panel.getByRole("link", { name: `Visit ${project.title} (opens in a new tab)` }),
        ).toHaveAttribute("href", project.url);
        await expect(panel.getByRole("listitem")).toHaveText(project.stack);
      }
      await expect(work.getByRole("link", { name: /GitHub/ })).toHaveAttribute(
        "href",
        contact.links[1].href,
      );
    },
  );

  test("lists projects in an accordion on phones", { tag: "@mobile" }, async ({ page, visit }) => {
    await visit("/");
    const work = page.locator("#work");
    const triggers = work.getByRole("button");

    await expect(work.locator("article[data-h-panel]").first()).toBeHidden();
    await expect(triggers).toHaveCount(projects.length);
    for (const [index, project] of projects.entries()) {
      await expect(triggers.nth(index)).toContainText(project.title);
      await expect(triggers.nth(index)).toContainText(project.category);
      await expect(triggers.nth(index)).toHaveAttribute(
        "aria-expanded",
        index === 0 ? "true" : "false",
      );
    }
  });

  test(
    "opens one project at a time by tap or keyboard",
    { tag: "@mobile" },
    async ({ page, visit }) => {
      const [first, second] = projects;
      if (!first || !second) throw new Error("the accordion test needs two projects");
      await visit("/");
      const work = page.locator("#work");
      const triggers = work.getByRole("button");
      const firstLink = work.getByRole("link", {
        name: `Visit ${first.title} live (opens in a new tab)`,
      });
      const secondLink = work.getByRole("link", {
        name: `Visit ${second.title} live (opens in a new tab)`,
      });

      await expect(firstLink).toBeVisible();
      await expect(firstLink).toHaveAttribute("href", first.url);
      await expect(secondLink).toBeHidden();

      await triggers.nth(1).click();
      await expect(triggers.nth(1)).toHaveAttribute("aria-expanded", "true");
      await expect(triggers.nth(0)).toHaveAttribute("aria-expanded", "false");
      await expect(secondLink).toBeVisible();
      await expect(secondLink).toHaveAttribute("href", second.url);
      await expect(firstLink).toBeHidden();
      await expect(work.getByText(second.blurb).filter({ visible: true })).toHaveCount(1);

      await triggers.nth(1).press("Enter");
      await expect(triggers.nth(1)).toHaveAttribute("aria-expanded", "false");
      await expect(secondLink).toBeHidden();

      await triggers.nth(0).press("Space");
      await expect(triggers.nth(0)).toHaveAttribute("aria-expanded", "true");
      await expect(firstLink).toBeVisible();
    },
  );
});

test.describe("experience and skills", () => {
  test("lists every role and an invitation that leads to contact", async ({ page, visit }) => {
    await visit("/");
    const section = page.locator("#experience");
    const roles = section.locator("li[data-xp-role]");

    await expect(roles).toHaveCount(experience.length + 1);
    for (const [index, role] of experience.entries()) {
      await expect(roles.nth(index).getByRole("heading")).toHaveText(role.title);
    }

    await clickWhenSettled(section.getByRole("link", { name: "Let’s talk" }));
    await expectScrolledTo(page, "#contact");
    await expect(page).toHaveURL(/\/#contact$/);
  });

  test("groups every skill under its discipline", async ({ page, visit }) => {
    await visit("/");
    const section = page.locator("#skills");

    for (const group of skillGroups) {
      await expect(
        section.getByRole("heading", { level: 3, name: group.name, exact: true }),
      ).toBeVisible();
    }
  });
});

test.describe("contact", () => {
  test("offers the email address as a mail link", async ({ page, visit }) => {
    await visit("/");
    const link = page.locator("#contact").getByRole("link", { name: contact.email });

    await link.scrollIntoViewIfNeeded();
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", `mailto:${contact.email}`);
  });

  for (const { utc, time, period } of MOMENTS) {
    test(`shows ${time} as ${period.toLowerCase()} in ${CITY}`, async ({ page, visit }) => {
      await page.clock.setFixedTime(new Date(utc));
      await visit("/");
      const section = page.locator("#contact");

      await expect(section.locator("time .sr-only")).toHaveText(time);
      await expect(section.locator("time")).toBeVisible();
      await expect(section.locator("[data-clock-strip]")).toHaveCount(6);
      for (const label of PERIODS) {
        const text = section.getByText(`${label} in ${CITY}`, { exact: true });
        if (label === period) await expect(text).toBeVisible();
        else await expect(text).toBeHidden();
      }
    });
  }

  test("keeps ticking once a second", async ({ page, visit }) => {
    await page.clock.setFixedTime(new Date("2026-01-15T04:00:00Z"));
    await visit("/");
    const clock = page.locator("#contact time .sr-only");

    await expect(clock).toHaveText("09:30:00");
    await page.clock.setFixedTime(new Date("2026-01-15T04:00:07Z"));
    await expect(clock).toHaveText("09:30:07");
    await expect(page.locator("#contact [data-clock-strip]").last()).toHaveAttribute(
      "data-value",
      "7",
    );
  });

  test.describe("for a visitor in another time zone", () => {
    test.use({ timezoneId: "America/Los_Angeles", locale: "en-US" });

    test("still shows the time in the site's own zone", async ({ page, visit }) => {
      await page.clock.setFixedTime(new Date("2026-07-01T15:45:30Z"));
      await visit("/");

      await expect(page.locator("#contact time .sr-only")).toHaveText("21:15:30");
      await expect(
        page.locator("#contact").getByText(`Night in ${CITY}`, { exact: true }),
      ).toBeVisible();
    });
  });
});

test.describe("footer", () => {
  test("shows the current year in the copyright line", async ({ page, visit }) => {
    await page.clock.setFixedTime(new Date("2031-06-01T12:00:00Z"));
    await visit("/privacy");

    await expect(page.getByRole("contentinfo")).toContainText(`© 2031 ${site.fullName}`);
  });

  test("reveals its links at the end of the page", async ({ page, visit }) => {
    await visit("/");
    await scrollToEnd(page);
    const footer = page.getByRole("contentinfo");

    for (const link of contact.links) {
      await expect(
        footer.getByRole("link", { name: `${link.label} (opens in a new tab)` }),
      ).toBeVisible();
    }
    await expect(footer.getByRole("link", { name: "Back to top" })).toBeVisible();
    await expect(footer.getByRole("link", { name: "Privacy policy" })).toBeVisible();
    await expect(footer).toContainText(`© ${new Date().getFullYear()} ${site.fullName}`);
  });
});
