import type { Locator, Page } from "@playwright/test";

import { contact } from "@/data/contact";
import { nav, site } from "@/data/site";

import { expect, expectScrolledTo, getOverflow, openMenu, scrollY, test } from "../fixtures";

async function getBox(locator: Locator) {
  const box = await locator.boundingBox();
  return box && [box.x, box.y, box.width, box.height].map(Math.round);
}

async function getBarRotations(menu: Locator) {
  return menu
    .getByRole("button", { name: "Close menu" })
    .evaluate((button) => [...button.children].map((bar) => getComputedStyle(bar).rotate));
}

async function getHiddenLinks(menu: Locator) {
  return menu.getByRole("navigation", { name: "Mobile" }).evaluate((nav) =>
    [...nav.querySelectorAll("a")].flatMap((link) => {
      const mask = link.getBoundingClientRect();
      const text = link.firstElementChild?.getBoundingClientRect();
      const shown = text && text.top >= mask.top - 0.5 && text.bottom <= mask.bottom + 0.5;
      return shown ? [] : [link.textContent ?? ""];
    }),
  );
}

async function watchMenuMotion(page: Page) {
  await page.evaluate(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      const menu = document.querySelector('[role="dialog"]');
      if (!menu) return;
      observer.disconnect();
      const started = performance.now();
      let most = 0;
      const sample = () => {
        most = Math.max(most, menu.getAnimations({ subtree: true }).length);
        if (performance.now() - started < 500) requestAnimationFrame(sample);
        else root.dataset.menuAnimations = String(most);
      };
      requestAnimationFrame(sample);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

test.describe("mobile menu", () => {
  test.use({ viewport: { width: 390, height: 800 } });

  test("opens as a labelled dialog and lists every destination", async ({ page, visit }) => {
    await visit("/");
    const trigger = page.getByRole("button", { name: "Open menu" });

    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    const menu = await openMenu(page);

    await expect(page.locator('button[aria-label="Open menu"]')).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expect(menu.getByRole("heading", { name: "Menu", level: 2 })).toBeVisible();
    await expect(menu.getByRole("button", { name: "Close menu" })).toBeFocused();
    const links = menu.getByRole("navigation", { name: "Mobile" }).getByRole("link");
    await expect(links).toHaveCount(nav.length);
    for (const [index, item] of nav.entries()) {
      await expect(links.nth(index)).toHaveAccessibleName(item.label);
      await expect(links.nth(index)).toHaveAttribute("href", item.href);
    }
  });

  test("the close button closes it and hands focus back", async ({ page, visit }) => {
    await visit("/");
    const menu = await openMenu(page);

    await menu.getByRole("button", { name: "Close menu" }).click();

    await expect(menu).toBeHidden();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
    await expect(page.getByRole("button", { name: "Open menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  test("Escape closes it and hands focus back", async ({ page, visit }) => {
    await visit("/");
    const menu = await openMenu(page);

    await page.keyboard.press("Escape");

    await expect(menu).toBeHidden();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  });

  test("keeps keyboard focus inside while open", async ({ page, visit, tabKey }) => {
    await visit("/");
    const menu = await openMenu(page);

    for (let presses = 1; presses <= 24; presses += 1) {
      await page.keyboard.press(tabKey);
      await expect
        .poll(() => menu.evaluate((dialog) => dialog.contains(document.activeElement)), {
          message: `after ${presses} Tab presses`,
        })
        .toBe(true);
    }
    await page.keyboard.press(`Shift+${tabKey}`);
    await expect
      .poll(() => menu.evaluate((dialog) => dialog.contains(document.activeElement)))
      .toBe(true);
  });

  test("hides the page behind it from assistive technology", async ({ page, visit }) => {
    await visit("/");
    await openMenu(page);

    await expect(page.getByRole("main")).toHaveCount(0);
    await expect(page.getByRole("contentinfo")).toHaveCount(0);
  });

  test("a section link closes the menu, then travels there", async ({ page, visit }) => {
    await visit("/");
    const menu = await openMenu(page);

    await menu.getByRole("link", { name: "Experience", exact: true }).click();

    await expect(menu).toBeHidden();
    await expectScrolledTo(page, "#experience");
    await expect(page.locator("#experience")).toBeFocused();
  });

  test("a section link records its target in the address bar", async ({ page, visit }) => {
    await visit("/");
    const menu = await openMenu(page);

    await menu.getByRole("link", { name: "Experience", exact: true }).click();
    await expectScrolledTo(page, "#experience");

    await expect(page).toHaveURL(/\/#experience$/, { timeout: 2_000 });
  });

  test("a page link navigates and closes the menu", async ({ page, visit }) => {
    await visit("/");
    const menu = await openMenu(page);

    await menu.getByRole("link", { name: "Blog", exact: true }).click();

    await expect(page).toHaveURL(/\/blog$/);
    await expect(menu).toBeHidden();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("on another page, section links lead back to home", async ({ page, visit }) => {
    await visit("/blog");
    const menu = await openMenu(page);
    const links = menu.getByRole("navigation", { name: "Mobile" }).getByRole("link");

    for (const [index, item] of nav.entries()) {
      await expect(links.nth(index)).toHaveAttribute(
        "href",
        item.kind === "page" ? item.href : item.href === "#top" ? "/" : `/${item.href}`,
      );
    }
    await menu.getByRole("link", { name: "Contact", exact: true }).click();

    await expect(page).toHaveURL(/\/#contact$/);
    await expect(menu).toBeHidden();
    await expectScrolledTo(page, "#contact");
  });

  test("carries the contact links", async ({ page, visit }) => {
    await visit("/");
    const menu = await openMenu(page);

    await expect(menu.getByRole("link", { name: contact.email })).toHaveAttribute(
      "href",
      `mailto:${contact.email}`,
    );
    for (const link of contact.links) {
      const outside = menu.getByRole("link", { name: `${link.label} (opens in a new tab)` });

      await expect(outside).toHaveAttribute("href", link.href);
      await expect(outside).toHaveAttribute("target", "_blank");
      await expect(outside).toHaveAttribute("rel", "noreferrer");
    }
  });

  test(
    "keeps the page behind it still under the wheel",
    { tag: "@desktop" },
    async ({ page, visit }) => {
      await visit("/");
      await openMenu(page);

      await page.mouse.move(200, 400);
      await page.mouse.wheel(0, 1200);
      await page.waitForTimeout(1_000);

      expect(await scrollY(page)).toBe(0);
    },
  );

  test("releases the page once closed", { tag: "@desktop" }, async ({ page, visit }) => {
    await visit("/");
    const menu = await openMenu(page);

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await page.mouse.move(200, 400);
    await page.mouse.wheel(0, 1200);

    await expect.poll(() => scrollY(page)).toBeGreaterThan(0);
  });

  test(
    "scrolls a menu taller than the window under the wheel, not the page",
    { tag: "@desktop" },
    async ({ page, visit }) => {
      await page.setViewportSize({ width: 390, height: 420 });
      await visit("/");
      const menu = await openMenu(page);
      await expect.poll(() => getHiddenLinks(menu)).toEqual([]);

      await page.mouse.move(200, 300);
      await page.mouse.wheel(0, 600);

      await expect.poll(() => menu.evaluate((panel) => panel.scrollTop)).toBeGreaterThan(0);
      expect(await scrollY(page)).toBe(0);
    },
  );

  test(
    "closes once the window widens to the desktop navigation",
    { tag: "@desktop" },
    async ({ page, visit }) => {
      await visit("/");
      const menu = await openMenu(page);

      await page.setViewportSize({ width: 1280, height: 800 });

      await expect(menu).toBeHidden();
      await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    },
  );

  test("gives its own controls a 44px touch target", async ({ page, visit }) => {
    await visit("/");
    const trigger = await page.getByRole("button", { name: "Open menu" }).boundingBox();
    expect(trigger?.width).toBeGreaterThanOrEqual(44);
    expect(trigger?.height).toBeGreaterThanOrEqual(44);
    const menu = await openMenu(page);
    const outside = contact.links.map((link) => `${link.label} (opens in a new tab)`);
    const targets: [string, Locator][] = [
      ["Close menu", menu.getByRole("button", { name: "Close menu" })],
      ...nav.map((item): [string, Locator] => [
        item.label,
        menu.getByRole("link", { name: item.label, exact: true }),
      ]),
      [contact.email, menu.getByRole("link", { name: contact.email })],
      ...outside.map((name): [string, Locator] => [name, menu.getByRole("link", { name })]),
    ];

    for (const [name, target] of targets) {
      const box = await target.boundingBox();
      expect.soft(box?.width, `${name} width`).toBeGreaterThanOrEqual(44);
      expect.soft(box?.height, `${name} height`).toBeGreaterThanOrEqual(44);
    }
  });

  test.describe("with reduced motion", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });

    test(
      "keeps the page behind it still under the wheel",
      { tag: "@desktop" },
      async ({ page, visit }) => {
        await visit("/");
        await openMenu(page);

        await page.mouse.move(200, 400);
        await page.mouse.wheel(0, 1200);
        await page.waitForTimeout(1_000);

        expect(await scrollY(page)).toBe(0);
      },
    );
  });

  test("fits a 320px screen without clipping its controls", async ({ page, visit }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await visit("/");
    const menu = await openMenu(page);

    const controls = [
      ...["System", "Light", "Dark"].map((name) => menu.getByRole("button", { name, exact: true })),
      ...["Gold", "Orange", "Red", "Magenta"].map((name) => menu.getByRole("radio", { name })),
    ];
    for (const control of controls) {
      await control.scrollIntoViewIfNeeded();
      await expect(control).toBeInViewport({ ratio: 1 });
    }
    expect(await getOverflow(page)).toBe(0);
    await menu.getByRole("link", { name: contact.email }).scrollIntoViewIfNeeded();
    await expect(menu.getByRole("link", { name: contact.email })).toBeInViewport();
  });
});

test.describe("mobile menu motion", () => {
  test.use({ viewport: { width: 390, height: 800 } });

  test("puts the close button exactly over the trigger", async ({ page, visit }) => {
    await visit("/");
    const trigger = await getBox(page.getByRole("button", { name: "Open menu" }));
    const menu = await openMenu(page);

    await expect
      .poll(() => getBox(menu.getByRole("button", { name: "Close menu" })))
      .toEqual(trigger);
  });

  test("lines the panel up with the header gutter", async ({ page, visit }) => {
    await visit("/");
    const logo = await page.getByRole("link", { name: `${site.name}, back to top` }).boundingBox();
    const menu = await openMenu(page);

    await expect
      .poll(async () =>
        Math.round((await menu.getByRole("heading", { name: "Menu" }).boundingBox())?.x ?? -1),
      )
      .toBe(Math.round(logo?.x ?? 0));
  });

  test("folds the hamburger into a cross", async ({ page, visit }) => {
    await visit("/");
    const menu = await openMenu(page);

    await expect.poll(() => getBarRotations(menu)).toEqual(["45deg", "-45deg"]);
  });

  test("settles with every link fully revealed", async ({ page, visit }) => {
    await visit("/");
    const menu = await openMenu(page);

    await expect.poll(() => getHiddenLinks(menu)).toEqual([]);
  });

  test("animates open rather than snapping", async ({ page, visit }) => {
    await visit("/");
    await watchMenuMotion(page);
    await openMenu(page);

    await expect
      .poll(async () => Number(await page.locator("html").getAttribute("data-menu-animations")))
      .toBeGreaterThan(0);
  });

  test.describe("with reduced motion", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });

    test("opens already settled", async ({ page, visit }) => {
      await visit("/");
      await watchMenuMotion(page);
      const menu = await openMenu(page);

      await expect.poll(() => page.locator("html").getAttribute("data-menu-animations")).toBe("0");
      expect(await getBarRotations(menu)).toEqual(["45deg", "-45deg"]);
      expect(await getHiddenLinks(menu)).toEqual([]);
    });
  });
});

test.describe("mobile menu on a tablet", () => {
  test.use({ viewport: { width: 800, height: 900 } });

  test("opens as a side sheet and closes on an outside click", async ({ page, visit }) => {
    await visit("/");
    const menu = await openMenu(page);

    await expect
      .poll(async () => {
        const box = await menu.boundingBox();
        return box ? Math.round(box.x + box.width) : 0;
      })
      .toBe(800);
    expect((await menu.boundingBox())?.width).toBeLessThan(800);
    await page.mouse.click(40, 450);

    await expect(menu).toBeHidden();
  });

  test("puts the close button exactly over the trigger", async ({ page, visit }) => {
    await visit("/");
    const trigger = await getBox(page.getByRole("button", { name: "Open menu" }));
    const menu = await openMenu(page);

    await expect
      .poll(() => getBox(menu.getByRole("button", { name: "Close menu" })))
      .toEqual(trigger);
  });
});

test.describe("mobile menu on a desktop", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("gives way to the primary navigation", async ({ page, visit }) => {
    await visit("/");

    await expect(page.getByRole("button", { name: "Open menu" })).toBeHidden();
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  });
});
