import type { Locator, Page } from "@playwright/test";

import { contact } from "@/data/contact";
import { nav, site } from "@/data/site";

import {
  expect,
  expectScrolledTo,
  getOverflow,
  openMenu,
  scrollToEnd,
  scrollY,
  test,
} from "../fixtures";

async function getBox(locator: Locator) {
  const box = await locator.boundingBox();
  return box && [box.x, box.y, box.width, box.height].map(Math.round);
}

async function getBarRotations(menu: Locator) {
  return menu
    .getByRole("button", { name: "Close menu" })
    .evaluate((button) =>
      [...(button.lastElementChild?.children ?? [])].map((bar) => getComputedStyle(bar).rotate),
    );
}

async function getLogoState(scope: Locator) {
  return scope.locator("[data-logo]").evaluate((svg) => {
    const matrixOf = (node: Element) =>
      node instanceof SVGGraphicsElement ? node.transform.baseVal.consolidate()?.matrix : null;
    return {
      slits: [...svg.querySelectorAll("[data-slit]")].map(
        (slit) => Math.round((matrixOf(slit)?.a ?? 1) * 100) / 100,
      ),
      risen: [...svg.querySelectorAll("[data-letter]")].every(
        (letter) => Math.abs(matrixOf(letter)?.f ?? 0) < 0.5,
      ),
    };
  });
}

async function getScrimStrength(page: Page) {
  return page.evaluate(() => {
    const alphaOf = (color: string) => {
      if (color === "transparent") return 0;
      const slash = /\/\s*([\d.]+%?)\s*\)$/.exec(color)?.[1];
      const comma = /^rgba\([^)]*,\s*([\d.]+)\)$/.exec(color)?.[1];
      const value = slash ?? comma;
      if (value === undefined) return 1;
      return value.endsWith("%") ? parseFloat(value) / 100 : parseFloat(value);
    };
    return Math.max(
      0,
      ...[...document.body.querySelectorAll("div")].map((layer) => {
        const style = getComputedStyle(layer);
        const box = layer.getBoundingClientRect();
        const covers =
          style.position === "fixed" &&
          Number(style.zIndex) > 50 &&
          box.width >= window.innerWidth &&
          box.height >= window.innerHeight;
        return covers ? alphaOf(style.backgroundColor) * Number(style.opacity) : 0;
      }),
    );
  });
}

async function getScrimBlur(page: Page) {
  return page.evaluate(() => {
    const layer = [...document.body.querySelectorAll("div")].find((div) => {
      const style = getComputedStyle(div);
      const box = div.getBoundingClientRect();
      return (
        style.position === "fixed" &&
        Number(style.zIndex) > 50 &&
        box.width >= window.innerWidth &&
        box.height >= window.innerHeight &&
        style.backgroundColor !== "rgba(0, 0, 0, 0)"
      );
    });
    if (!layer) return null;
    const style = getComputedStyle(layer);
    const filter =
      style.backdropFilter || style.getPropertyValue("-webkit-backdrop-filter") || "none";
    return parseFloat(/blur\(([\d.]+)px\)/.exec(filter)?.[1] ?? "0");
  });
}

async function getBottom(locator: Locator) {
  const box = await locator.boundingBox();
  return box && Math.round(box.y + box.height);
}

async function getShownLabel(button: Locator) {
  return button.evaluate((control) => {
    const mask = control.querySelector("span")?.getBoundingClientRect();
    if (!mask) return [];
    return [...(control.querySelector("span")?.children ?? [])].flatMap((word) => {
      const box = word.getBoundingClientRect();
      const shown =
        getComputedStyle(word).visibility === "visible" &&
        box.top >= mask.top - 0.5 &&
        box.bottom <= mask.bottom + 0.5;
      return shown ? [word.textContent ?? ""] : [];
    });
  });
}

async function watchMenuReveal(page: Page, phase: "open" | "close") {
  await page.evaluate((phase) => {
    const root = document.documentElement;
    const resolve = (value: string, size: number) => {
      const fromEnd = /^calc\(100% - ([\d.]+)px\)$/.exec(value);
      if (fromEnd) return size - Number(fromEnd[1]);
      if (value.endsWith("%")) return (parseFloat(value) / 100) * size;
      if (value.endsWith("px")) return parseFloat(value);
      return Number.NaN;
    };
    const covers = (menu: Element, close: Element) => {
      const box = menu.getBoundingClientRect();
      const clip = getComputedStyle(menu).clipPath;
      const [, radius = "", unit, at = ""] = /^circle\(([\d.]+)(px|%) at (.+)\)$/.exec(clip) ?? [];
      const [x = "", y = ""] = at.match(/calc\([^)]*\)|\S+/g) ?? [];
      const r =
        unit === "%"
          ? (Number(radius) / 100) * (Math.hypot(box.width, box.height) / Math.SQRT2)
          : Number(radius);
      const origin = { x: resolve(x, box.width), y: resolve(y, box.height) };
      if ([r, origin.x, origin.y].some(Number.isNaN)) return `unparsed ${clip}`;
      const button = close.getBoundingClientRect();
      const inside = (px: number, py: number) => Math.hypot(px - origin.x, py - origin.y) <= r;
      const atButton = inside(
        button.left + button.width / 2 - box.left,
        button.top + button.height / 2 - box.top,
      );
      return `${atButton}/${inside(box.width - 2, box.height - 2)}`;
    };
    const sampleFrom = async (menu: Element) => {
      const close = menu.querySelector('[aria-label="Close menu"]');
      if (!close) return;
      const findReveal = () =>
        menu
          .getAnimations()
          .find(
            (animation): animation is CSSTransition =>
              animation instanceof CSSTransition && animation.transitionProperty === "clip-path",
          );
      let reveal = findReveal();
      for (let frame = 0; !reveal && frame < 120; frame += 1) {
        await new Promise((done) => requestAnimationFrame(done));
        reveal = findReveal();
      }
      if (!reveal) {
        root.dataset.menuReveal = "no clip-path transition";
        return;
      }
      reveal.pause();
      const duration = Number(reveal.effect?.getComputedTiming().duration);
      const frames: string[] = [];
      for (let step = 1; step <= 10; step += 1) {
        reveal.currentTime = (duration * step) / 10;
        frames.push(covers(menu, close));
      }
      reveal.finish();
      root.dataset.menuReveal = frames.join(",");
    };
    const open = document.querySelector('[role="dialog"]');
    if (phase === "close" && open) {
      const onStart = (event: Event) => {
        if (!(event instanceof TransitionEvent) || event.target !== open) return;
        if (event.propertyName !== "clip-path") return;
        open.removeEventListener("transitionstart", onStart);
        void sampleFrom(open);
      };
      open.addEventListener("transitionstart", onStart);
      return;
    }
    const observer = new MutationObserver(() => {
      const menu = document.querySelector('[role="dialog"]');
      if (!menu) return;
      observer.disconnect();
      void sampleFrom(menu);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }, phase);
}

async function readMenuReveal(page: Page) {
  await expect.poll(() => page.locator("html").getAttribute("data-menu-reveal")).not.toBeNull();
  return (await page.locator("html").getAttribute("data-menu-reveal"))?.split(",") ?? [];
}

async function getHiddenLinks(menu: Locator) {
  return menu.getByRole("navigation", { name: "Mobile" }).evaluate((nav) =>
    [...nav.querySelectorAll("a")].flatMap((link) => {
      const mask = link.getBoundingClientRect();
      const shown = [...link.children].every((part) => {
        const box = part.getBoundingClientRect();
        return box.top >= mask.top - 0.5 && box.bottom <= mask.bottom + 0.5;
      });
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
    await expect(menu.getByRole("heading", { name: "Menu", level: 2 })).toBeAttached();
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

  test("the logo closes the menu, then travels back to the top", async ({ page, visit }) => {
    await visit("/");
    let menu = await openMenu(page);
    await menu.getByRole("link", { name: "Experience", exact: true }).click();
    await expectScrolledTo(page, "#experience");
    menu = await openMenu(page);

    await menu.getByRole("link", { name: `${site.name}, back to top` }).click();

    await expect(menu).toBeHidden();
    await expect.poll(() => scrollY(page)).toBe(0);
    await expect(page).toHaveURL(/\/$/);
  });

  test("on another page, the logo leads home", async ({ page, visit }) => {
    await visit("/blog");
    const menu = await openMenu(page);

    await menu.getByRole("link", { name: `${site.name}, home` }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(menu).toBeHidden();
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

  test("spaces its links as 48px targets on an even 8px rhythm", async ({ page, visit }) => {
    await visit("/");
    const menu = await openMenu(page);
    await expect.poll(() => getHiddenLinks(menu)).toEqual([]);

    const rows = await menu
      .getByRole("navigation", { name: "Mobile" })
      .evaluate((nav) =>
        [...nav.querySelectorAll("a")].map((link) => link.getBoundingClientRect()),
      );
    for (const row of rows) expect(row.height).toBeGreaterThanOrEqual(48);
    const gaps = rows.slice(1).map((row, i) => Math.round(row.top - (rows[i]?.bottom ?? 0)));
    expect(gaps).toEqual(rows.slice(1).map(() => 8));
  });

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
      ["Appearance", menu.getByRole("button", { name: "Appearance" })],
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
});

test.describe("mobile menu on common phones", () => {
  const PHONES = [
    { name: "iPhone Pro Max in Safari", width: 430, height: 739 },
    { name: "Galaxy S", width: 360, height: 780 },
    { name: "iPhone", width: 390, height: 844 },
    { name: "Pixel", width: 412, height: 839 },
  ] as const;

  for (const phone of PHONES) {
    test.describe(`${phone.name} (${phone.width}×${phone.height})`, () => {
      test.use({ viewport: { width: phone.width, height: phone.height } });

      test("fits on one screen without scrolling", async ({ page, visit }) => {
        await visit("/");
        const menu = await openMenu(page);
        await expect.poll(() => getHiddenLinks(menu)).toEqual([]);

        expect(await menu.evaluate((panel) => panel.scrollHeight - panel.clientHeight)).toBe(0);
        await expect(menu.getByRole("link", { name: contact.email })).toBeInViewport({ ratio: 1 });
      });
    });
  }
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

  test("keeps the logo on the left exactly where the header has it", async ({ page, visit }) => {
    await visit("/");
    const logo = await getBox(page.getByRole("link", { name: `${site.name}, back to top` }));
    const menu = await openMenu(page);

    await expect
      .poll(() => getBox(menu.getByRole("link", { name: `${site.name}, back to top` })))
      .toEqual(logo);
  });

  test("swaps the Menu label for Close", async ({ page, visit }) => {
    await visit("/");
    const trigger = page.getByRole("button", { name: "Open menu" });

    expect(await getShownLabel(trigger)).toEqual(["Menu"]);
    const menu = await openMenu(page);

    await expect
      .poll(() => getShownLabel(menu.getByRole("button", { name: "Close menu" })))
      .toEqual(["Close"]);
  });

  test("folds back into the close button as it closes", async ({ page, visit }) => {
    await visit("/");
    const menu = await openMenu(page);
    await expect.poll(() => getHiddenLinks(menu)).toEqual([]);
    await watchMenuReveal(page, "close");

    await menu.getByRole("button", { name: "Close menu" }).click();

    await expect(menu).toBeHidden();
    const frames = await readMenuReveal(page);
    expect(frames).toContain("true/false");
    expect(frames).not.toContain("false/true");
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

  test("grows out of the close button", async ({ page, visit }) => {
    await visit("/");
    await watchMenuReveal(page, "open");
    await openMenu(page);

    const frames = await readMenuReveal(page);
    expect(frames).toContain("true/false");
    expect(frames).not.toContain("false/true");
    expect(frames.at(-1)).toBe("true/true");
  });

  test("sets the current page apart", async ({ page, visit }) => {
    await visit("/blog");
    const menu = await openMenu(page);
    const links = menu.getByRole("navigation", { name: "Mobile" }).getByRole("link");

    await expect(links.filter({ hasText: "Blog" })).toHaveAttribute("aria-current", "page");
    const colors = await menu.getByRole("navigation", { name: "Mobile" }).evaluate((nav) =>
      [...nav.querySelectorAll("a")].map((link) => ({
        current: link.getAttribute("aria-current") === "page",
        color: getComputedStyle(link).color,
      })),
    );
    const current = colors.filter((link) => link.current);
    const others = new Set(colors.filter((link) => !link.current).map((link) => link.color));
    expect(current).toHaveLength(1);
    expect(others.size).toBe(1);
    expect(others.has(current[0]?.color ?? "")).toBe(false);
  });

  test("keeps the close button in reach while the panel scrolls", async ({ page, visit }) => {
    await page.setViewportSize({ width: 390, height: 500 });
    await visit("/");
    const menu = await openMenu(page);
    await expect.poll(() => getHiddenLinks(menu)).toEqual([]);

    await menu.evaluate((panel) => panel.scrollTo({ top: panel.scrollHeight }));

    await expect(menu.getByRole("link", { name: contact.email })).toBeInViewport();
    await expect(menu.getByRole("button", { name: "Close menu" })).toBeInViewport({ ratio: 1 });
    await menu.getByRole("button", { name: "Close menu" }).click();
    await expect(menu).toBeHidden();
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
      expect(await getShownLabel(menu.getByRole("button", { name: "Close menu" }))).toEqual([
        "Close",
      ]);
      expect(await getHiddenLinks(menu)).toEqual([]);
    });
  });
});

test.describe("mobile menu on a tablet", () => {
  test.use({ viewport: { width: 800, height: 900 } });

  test("covers the whole screen", async ({ page, visit }) => {
    await visit("/");
    const menu = await openMenu(page);

    await expect.poll(() => getBox(menu)).toEqual([0, 0, 800, 900]);
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

test.describe("appearance drawer", () => {
  test.use({ viewport: { width: 390, height: 800 } });

  async function openDrawer(page: Page) {
    const menu = await openMenu(page);
    await menu.getByRole("button", { name: "Appearance" }).click();
    const drawer = page.getByRole("dialog", { name: "Appearance" });
    await expect(drawer).toBeVisible();
    return { menu, drawer };
  }

  test("the menu carries a theme icon instead of the controls", async ({ page, visit }) => {
    await visit("/");
    const menu = await openMenu(page);

    await expect(menu.getByRole("button", { name: "Appearance" })).toBeVisible();
    await expect(menu.getByRole("group", { name: "Color theme" })).toHaveCount(0);
    await expect(menu.getByRole("radiogroup", { name: "Accent color" })).toHaveCount(0);
  });

  test("the icon opens the controls in a drawer along the bottom", async ({ page, visit }) => {
    await visit("/");
    const { drawer } = await openDrawer(page);

    await expect.poll(() => getBottom(drawer)).toBe(800);
    const box = await drawer.boundingBox();
    expect([box?.x, box?.width]).toEqual([0, 390]);
    await expect(drawer.getByRole("group", { name: "Color theme" })).toBeInViewport();
    await expect(drawer.getByRole("radiogroup", { name: "Accent color" })).toBeInViewport();
  });

  test("stays open while choices are made", async ({ page, visit }) => {
    await visit("/");
    const { drawer } = await openDrawer(page);

    await drawer.getByRole("button", { name: "Dark", exact: true }).click();
    await drawer.getByRole("radio", { name: "Orange" }).click();

    await expect(drawer).toBeVisible();
    await expect(page.locator("html")).toHaveClass(/(^|\s)dark(\s|$)/);
    await expect(page.locator("html")).toHaveAttribute("data-accent", "orange");
  });

  test("keeps the same height in light and dark", async ({ page, visit }) => {
    await visit("/");
    const { drawer } = await openDrawer(page);
    await drawer.getByRole("button", { name: "Light", exact: true }).click();
    await expect.poll(() => getBottom(drawer)).toBe(800);
    const light = (await drawer.boundingBox())?.height;

    await drawer.getByRole("button", { name: "Dark", exact: true }).click();
    await expect(page.locator("html")).toHaveClass(/(^|\s)dark(\s|$)/);

    expect((await drawer.boundingBox())?.height).toBe(light);
  });

  test("dims the menu behind it with a scrim", async ({ page, visit }) => {
    await visit("/");
    const { menu } = await openDrawer(page);

    await expect.poll(() => getScrimStrength(page)).toBeCloseTo(0.32, 2);
    await page.keyboard.press("Escape");
    await expect.poll(() => getScrimStrength(page)).toBe(0);
    await expect(menu).toBeVisible();
  });

  test("blurs the menu behind it", async ({ page, visit }) => {
    await visit("/");
    const { drawer } = await openDrawer(page);

    await expect.poll(() => getScrimBlur(page)).toBeGreaterThan(0);
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
    expect(await getScrimBlur(page)).toBeNull();
  });

  test("is a frosted sheet over the menu", async ({ page, visit }) => {
    await visit("/");
    const { drawer } = await openDrawer(page);

    const sheet = await drawer.evaluate((popup) => {
      const style = getComputedStyle(popup);
      const filter =
        style.backdropFilter || style.getPropertyValue("-webkit-backdrop-filter") || "none";
      const alpha = /\/\s*([\d.]+)\s*\)$|,\s*([\d.]+)\)$/.exec(style.backgroundColor);
      return {
        blur: parseFloat(/blur\(([\d.]+)px\)/.exec(filter)?.[1] ?? "0"),
        alpha: parseFloat(alpha?.[1] ?? alpha?.[2] ?? "1"),
      };
    });
    expect(sheet.blur).toBeGreaterThan(await getScrimBlur(page).then((blur) => blur ?? 0));
    expect(sheet.alpha).toBeGreaterThanOrEqual(0.8);
    expect(sheet.alpha).toBeLessThan(1);
  });

  test.describe("in the dark theme", () => {
    test.use({ colorScheme: "dark" });

    test("dims the menu behind it just as much", async ({ page, visit }) => {
      await visit("/");
      await expect(page.locator("html")).toHaveClass(/(^|\s)dark(\s|$)/);
      await openDrawer(page);

      await expect.poll(() => getScrimStrength(page)).toBeCloseTo(0.32, 2);
    });
  });

  test("Escape closes the drawer and leaves the menu open", async ({ page, visit }) => {
    await visit("/");
    const { menu, drawer } = await openDrawer(page);

    await page.keyboard.press("Escape");

    await expect(drawer).toBeHidden();
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("button", { name: "Appearance" })).toBeFocused();
  });

  test("a tap above the drawer closes it", async ({ page, visit }) => {
    await visit("/");
    const { menu, drawer } = await openDrawer(page);

    await page.mouse.click(195, 120);

    await expect(drawer).toBeHidden();
    await expect(menu).toBeVisible();
  });

  test("slides up rather than snapping", async ({ page, visit }) => {
    await visit("/");
    const menu = await openMenu(page);
    await page.evaluate(() => {
      const root = document.documentElement;
      const observer = new MutationObserver(() => {
        const drawer = document.querySelectorAll('[role="dialog"]')[1];
        if (!drawer) return;
        observer.disconnect();
        const started = performance.now();
        let most = 0;
        const sample = () => {
          most = Math.max(most, drawer.getAnimations().length);
          if (performance.now() - started < 400) requestAnimationFrame(sample);
          else root.dataset.drawerAnimations = String(most);
        };
        requestAnimationFrame(sample);
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });

    await menu.getByRole("button", { name: "Appearance" }).click();

    await expect
      .poll(async () => Number(await page.locator("html").getAttribute("data-drawer-animations")))
      .toBeGreaterThan(0);
  });

  test("fits a 320px screen without clipping its controls", async ({ page, visit }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await visit("/");
    const { drawer } = await openDrawer(page);

    const controls = [
      ...["System", "Light", "Dark"].map((name) =>
        drawer.getByRole("button", { name, exact: true }),
      ),
      ...["Gold", "Orange", "Red", "Magenta"].map((name) => drawer.getByRole("radio", { name })),
    ];
    for (const control of controls) {
      await expect(control).toBeInViewport({ ratio: 1 });
    }
    expect(await getOverflow(page)).toBe(0);
  });

  test.describe("with reduced motion", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });

    test("opens already settled", async ({ page, visit }) => {
      await visit("/");
      const { drawer } = await openDrawer(page);

      expect(await drawer.evaluate((popup) => popup.getAnimations().length)).toBe(0);
      expect(await getScrimStrength(page)).toBeCloseTo(0.32, 2);
      expect(await getScrimBlur(page)).toBeGreaterThan(0);
      expect(await getBottom(drawer)).toBe(800);
    });
  });
});

test.describe("mobile menu logo", () => {
  test.use({ viewport: { width: 390, height: 800 } });

  test("shows the full wordmark, settled, at the top of the page", async ({ page, visit }) => {
    await visit("/");
    const menu = await openMenu(page);

    expect(await getLogoState(menu)).toEqual({ slits: [0, 0], risen: true });
  });

  test("matches a folded header logo at once", async ({ page, visit }) => {
    await visit("/");
    await scrollToEnd(page);
    const header = page.getByRole("banner");
    await expect.poll(() => getLogoState(header)).toEqual({ slits: [1, 1], risen: true });

    const menu = await openMenu(page);

    expect(await getLogoState(menu)).toEqual({ slits: [1, 1], risen: true });
  });

  test("unfolds again once the page is back at the top", async ({ page, visit }) => {
    await visit("/");
    await scrollToEnd(page);
    const header = page.getByRole("banner");
    await expect.poll(() => getLogoState(header)).toEqual({ slits: [1, 1], risen: true });
    let menu = await openMenu(page);

    await menu.getByRole("link", { name: "Home", exact: true }).click();
    await expect.poll(() => scrollY(page)).toBe(0);
    await expect.poll(() => getLogoState(header)).toEqual({ slits: [0, 0], risen: true });
    menu = await openMenu(page);

    expect(await getLogoState(menu)).toEqual({ slits: [0, 0], risen: true });
  });

  test("matches the header after arriving on a section from another page", async ({
    page,
    visit,
  }) => {
    await visit("/blog");
    let menu = await openMenu(page);
    await menu.getByRole("link", { name: "Contact", exact: true }).click();
    await expectScrolledTo(page, "#contact");
    const header = page.getByRole("banner");
    await expect.poll(() => getLogoState(header)).toEqual({ slits: [1, 1], risen: true });

    menu = await openMenu(page);

    expect(await getLogoState(menu)).toEqual({ slits: [1, 1], risen: true });
  });

  test.describe("with reduced motion", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });

    test("matches the header's full wordmark after scrolling", async ({ page, visit }) => {
      await visit("/");
      await scrollToEnd(page);
      const header = await getLogoState(page.getByRole("banner"));
      const menu = await openMenu(page);

      expect(await getLogoState(menu)).toEqual(header);
    });
  });
});
