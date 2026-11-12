import type { Locator, Page } from "@playwright/test";

import { contact } from "@/data/contact";
import { nav, site } from "@/data/site";

import {
  expect,
  expectScrolledTo,
  findConcealed,
  openAppearance,
  openMenu,
  openSiteNav,
  scrollThrough,
  scrollY,
  test,
} from "../fixtures";
import { getFirstPost, getPostPath, getSampleRoutes } from "../routes";

const ROUTES = [...getSampleRoutes(), "/nope"];
const WCAG_TARGET_PX = 24;
const READABLE = "h1, h2, h3, h4, p, li, a, button, figcaption, blockquote";

function getSkipLink(page: Page): Locator {
  return page.getByRole("link", { name: "Skip to content" });
}

function findSmallTargets(scope: Locator, min: number): Promise<string[]> {
  return scope.locator("a, button").evaluateAll((elements, size) => {
    const targets = elements
      .map((element) => ({ element, box: element.getBoundingClientRect() }))
      .filter(
        ({ element, box }) =>
          box.width > 0 && box.height > 0 && getComputedStyle(element).visibility === "visible",
      );

    return targets.flatMap(({ element, box }) => {
      if (box.width >= size && box.height >= size) return [];
      const centre = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
      const crowded = targets.some(
        (other) =>
          other.element !== element &&
          other.box.left < centre.x + size / 2 &&
          other.box.right > centre.x - size / 2 &&
          other.box.top < centre.y + size / 2 &&
          other.box.bottom > centre.y - size / 2,
      );
      const name = element.getAttribute("aria-label") ?? element.textContent.trim().slice(0, 30);
      return crowded ? [`${name}: ${Math.round(box.width)}×${Math.round(box.height)}`] : [];
    });
  }, min);
}

test.describe("page structure", () => {
  for (const path of ROUTES) {
    test(`${path} has one of each landmark and a single h1`, async ({ page, visit }) => {
      await visit(path);

      await expect(page.getByRole("banner")).toHaveCount(1);
      await expect(page.getByRole("main")).toHaveCount(1);
      await expect(page.getByRole("contentinfo")).toHaveCount(1);
      await expect(page.getByRole("main")).toHaveAttribute("id", "main");
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.locator("html")).toHaveAttribute("lang", /^en/);
    });

    test(`${path} names every navigation, link, button and image`, async ({ page, visit }) => {
      await visit(path);
      await scrollThrough(page);

      const labels = await page
        .locator("nav")
        .filter({ visible: true })
        .evaluateAll((navs) => navs.map((element) => element.getAttribute("aria-label") ?? ""));
      expect(labels).not.toContain("");
      expect(new Set(labels).size).toBe(labels.length);
      await expect(page.getByRole("link", { name: /^\s*$/ })).toHaveCount(0);
      await expect(page.getByRole("button", { name: /^\s*$/ })).toHaveCount(0);
      await expect(page.getByRole("img", { name: /^\s*$/ })).toHaveCount(0);
      await expect(page.locator("img:not([alt])")).toHaveCount(0);
    });

    test(`${path} keeps its headings in order`, async ({ page, visit }) => {
      await visit(path);

      const levels = await page
        .locator("h1, h2, h3, h4, h5, h6")
        .filter({ visible: true })
        .evaluateAll((headings) => headings.map((heading) => Number(heading.tagName.slice(1))));
      const jumps = levels.filter((level, index) => level - (levels[index - 1] ?? 0) > 1);

      expect(levels[0]).toBe(1);
      expect(jumps).toEqual([]);
    });
  }

  test("the primary navigation lists the site in order", async ({ page, visit, layout }) => {
    test.skip(layout !== "desktop", "smaller screens use the menu, covered in mobile-menu.spec.ts");
    await visit("/");

    await expect(page.getByRole("navigation", { name: "Primary" })).toMatchAriaSnapshot(
      ["- list:", ...nav.map((item) => `  - listitem:\n    - link "${item.label}"`)].join("\n"),
    );
  });

  test("the appearance controls expose their groups and choices", async ({
    page,
    visit,
    layout,
  }) => {
    await visit("/");
    const controls = await openAppearance(page, layout);

    await expect(controls.getByRole("group", { name: "Color theme" })).toMatchAriaSnapshot(`
      - button "System" [pressed]
      - button "Light"
      - button "Dark"
    `);
    await expect(controls.getByRole("radiogroup", { name: "Accent color" })).toMatchAriaSnapshot(`
      - radio "Gold" [checked]
      - radio "Orange"
      - radio "Red"
      - radio "Magenta"
    `);
  });

  test("the missing page explains itself and offers a way out", async ({ page, visit }) => {
    await visit("/nope");

    await expect(page.getByRole("main")).toMatchAriaSnapshot(`
      - main:
        - paragraph: Error 404
        - heading "Nothing here." [level=1]
        - paragraph
        - link "Back to home":
          - /url: /
    `);
  });
});

test.describe("skip link", () => {
  test("stays out of sight until it is focused", async ({ page, visit }) => {
    await visit("/");
    const skip = getSkipLink(page);

    await expect(skip).toHaveAttribute("href", "#main");
    await expect(skip).not.toBeInViewport();

    await skip.focus();
    await expect(skip).toBeInViewport({ ratio: 1 });

    await skip.blur();
    await expect(skip).not.toBeInViewport();
  });

  test("is the first stop on the page", async ({ page, visit, browserName }) => {
    test.skip(browserName === "webkit", "Safari only tabs to links with Option held");
    await visit(getPostPath(getFirstPost()));

    await page.keyboard.press("Tab");

    await expect(getSkipLink(page)).toBeFocused();
  });

  for (const path of getSampleRoutes()) {
    test(`on ${path} it carries the keyboard past the header`, async ({
      page,
      visit,
      browserName,
    }) => {
      test.skip(browserName === "webkit", "Safari only tabs to links with Option held");
      await visit(path);

      await getSkipLink(page).focus();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/#main$/);
      await page.keyboard.press("Tab");

      await expect
        .poll(() => page.evaluate(() => document.activeElement?.closest("main")?.id ?? ""))
        .toBe("main");
    });
  }

  test("still reaches the content after moving between pages", async ({
    page,
    visit,
    layout,
    browserName,
  }) => {
    test.skip(browserName === "webkit", "Safari only tabs to links with Option held");
    await visit("/");
    const navigation = await openSiteNav(page, layout);
    await navigation.getByRole("link", { name: "Blog", exact: true }).click();
    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.getByRole("region", { name: "Latest posts" })).toBeVisible();

    await getSkipLink(page).focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");

    await expect
      .poll(() =>
        page.evaluate(() => {
          const main = document.activeElement?.closest("main");
          return main ? main.getClientRects().length > 0 : false;
        }),
      )
      .toBe(true);
  });
});

test.describe("keyboard", () => {
  test("tabs through the header in reading order", async ({ page, visit, layout, browserName }) => {
    test.skip(browserName === "webkit", "Safari only tabs to links with Option held");
    test.skip(layout !== "desktop", "smaller screens use the menu, covered in mobile-menu.spec.ts");
    await visit("/");
    const stops = [
      "Skip to content",
      `${site.name}, back to top`,
      ...nav.map((item) => item.label),
      "Appearance",
      ...contact.links.map((link) => `${link.label} (opens in a new tab)`),
    ];

    for (const name of stops) {
      await page.keyboard.press("Tab");
      await expect(page.locator(":focus")).toHaveAccessibleName(name);
    }
    await page.keyboard.press("Tab");
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.closest("main") !== null))
      .toBe(true);
  });

  test("tabs backwards out of the page content into the header", async ({
    page,
    visit,
    layout,
    browserName,
  }) => {
    test.skip(browserName === "webkit", "Safari only tabs to links with Option held");
    test.skip(layout !== "desktop", "smaller screens use the menu, covered in mobile-menu.spec.ts");
    const [last] = contact.links.slice(-1);
    await visit("/");

    await page.getByRole("link", { name: "See selected work" }).focus();
    await page.keyboard.press("Shift+Tab");

    await expect(page.locator(":focus")).toHaveAccessibleName(
      `${last?.label ?? ""} (opens in a new tab)`,
    );
  });

  test("shows a visible focus ring on keyboard focus only", async ({
    page,
    visit,
    browserName,
  }) => {
    test.skip(browserName === "webkit", "Safari only tabs to links with Option held");
    await visit("/privacy");
    const logo = page.getByRole("link", { name: `${site.name}, home` });

    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(logo).toBeFocused();
    await expect(logo).toHaveCSS("outline-style", "solid");
    await expect(logo).toHaveCSS("outline-width", "2px");

    await page.mouse.click(5, 300);
    await expect(logo).not.toBeFocused();
    await expect(logo).toHaveCSS("outline-style", "none");
  });

  test("moving focus to a section does not draw a ring around it", async ({ page, visit }) => {
    await visit("/");

    await page.getByRole("link", { name: "Start a conversation" }).click();
    await expect(page.locator("#contact")).toBeFocused();

    await expect(page.locator("#contact")).toHaveCSS("outline-style", "none");
  });
});

test.describe("touch targets", () => {
  test("header, menu and footer controls are large enough to tap", async ({
    page,
    visit,
    layout,
  }) => {
    test.skip(layout === "desktop", "pointer targets are measured on touch layouts");
    await visit("/");

    expect(await findSmallTargets(page.getByRole("banner"), WCAG_TARGET_PX)).toEqual([]);
    await scrollThrough(page);
    expect(await findSmallTargets(page.getByRole("contentinfo"), WCAG_TARGET_PX)).toEqual([]);

    await page.evaluate(() => window.scrollTo(0, 0));
    const menu = await openMenu(page);
    await expect(menu.getByRole("link", { name: contact.email })).toBeVisible();
    expect(await findSmallTargets(menu, WCAG_TARGET_PX)).toEqual([]);
  });

  test("post controls are large enough to tap", async ({ page, visit, layout }) => {
    test.skip(layout === "desktop", "pointer targets are measured on touch layouts");
    await visit(getPostPath(getFirstPost()));
    const controls = page.getByRole("main").locator("nav, figure, aside");

    await scrollThrough(page);

    expect(await findSmallTargets(controls, WCAG_TARGET_PX)).toEqual([]);
  });
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  for (const path of ROUTES) {
    test(`${path} shows all of its content without animation`, async ({ page, visit }) => {
      await visit(path);

      await expect(page.locator("html")).not.toHaveClass(/motion-ok/);
      await expect(page.locator("html")).not.toHaveClass(/lenis/);
      expect(await findConcealed(page, READABLE)).toEqual([]);

      await scrollThrough(page);
      expect(await findConcealed(page, READABLE)).toEqual([]);
      await expect(page.getByRole("contentinfo").getByRole("link").first()).toBeVisible();
    });
  }

  test("in-page links jump straight to their section", async ({ page, visit, layout }) => {
    await visit("/");
    const navigation = await openSiteNav(page, layout);

    await navigation.getByRole("link", { name: "Contact", exact: true }).click();

    await expectScrolledTo(page, "#contact");
    const settled = await scrollY(page);
    await page.waitForTimeout(300);
    expect(await scrollY(page)).toBe(settled);
    await expect(page.locator("#contact")).toBeFocused();
  });

  test("nothing on the home page keeps moving", async ({ page, visit }) => {
    await visit("/");
    await scrollThrough(page);

    const running = await page.evaluate(() =>
      document
        .getAnimations()
        .filter((animation) => animation.playState === "running")
        .map((animation) => {
          const timing = animation.effect?.getComputedTiming();
          return timing?.iterations === Infinity ? "endless" : "finite";
        })
        .filter((kind) => kind === "endless"),
    );

    expect(running).toEqual([]);
  });
});

test.describe("with motion on", () => {
  for (const path of ROUTES) {
    test(`${path} leaves nothing hidden once it has been scrolled`, async ({ page, visit }) => {
      await visit(path);
      await scrollThrough(page);
      await expect(page.getByRole("contentinfo")).toBeInViewport();

      await expect.poll(() => findConcealed(page, "h2, h3, h4")).toEqual([]);

      await page.evaluate(() => window.scrollTo(0, 0));
      await expect.poll(() => findConcealed(page, "h1")).toEqual([]);
    });
  }
});
