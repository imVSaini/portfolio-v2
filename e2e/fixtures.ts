import { expect, test as base, type Locator, type Page } from "@playwright/test";

import { INTRO_KEY } from "@/lib/appearance";

const MD = 768;
const LG = 1024;
const MUTED_OPACITY_FLOOR = 0.5;

type Layout = "phone" | "tablet" | "desktop";

type Options = {
  intro: "skip" | "play";
};

type Fixtures = {
  layout: Layout;
  visit: (path: string) => Promise<void>;
  clipboard: { read: () => Promise<string> };
};

export const test = base.extend<Options & Fixtures>({
  intro: ["skip", { option: true }],

  page: async ({ page, intro }, provide) => {
    if (intro === "skip") {
      await page.addInitScript((key) => {
        try {
          sessionStorage.setItem(key, "1");
        } catch {
          return;
        }
      }, INTRO_KEY);
    }
    await provide(page);
  },

  layout: async ({ viewport }, provide) => {
    const width = viewport?.width ?? LG;
    await provide(width >= LG ? "desktop" : width >= MD ? "tablet" : "phone");
  },

  visit: async ({ page }, provide) => {
    await provide(async (path) => {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("data-motion-ready", "");
    });
  },

  clipboard: async ({ page, context, browserName }, provide) => {
    if (browserName === "chromium") {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    } else {
      await page.addInitScript(() => {
        let text = "";
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: {
            writeText: (next: string) => {
              text = next;
              return Promise.resolve();
            },
            readText: () => Promise.resolve(text),
          },
        });
      });
    }
    await provide({ read: () => page.evaluate(() => navigator.clipboard.readText()) });
  },
});

export { expect };

export async function openMenu(page: Page): Promise<Locator> {
  await page.getByRole("button", { name: "Open menu" }).click();
  const menu = page.getByRole("dialog", { name: "Menu" });
  await expect(menu).toBeVisible();
  return menu;
}

export async function openSiteNav(page: Page, layout: Layout): Promise<Locator> {
  if (layout === "desktop") return page.getByRole("navigation", { name: "Primary" });
  const menu = await openMenu(page);
  return menu.getByRole("navigation", { name: "Mobile" });
}

export async function openAppearance(page: Page, layout: Layout): Promise<Locator> {
  if (layout === "phone") return openMenu(page);
  await page.getByRole("button", { name: "Appearance" }).click();
  const group = page.getByRole("group", { name: "Color theme" });
  await expect(group).toBeVisible();
  return page.getByRole("dialog").filter({ has: group });
}

export async function expectScrolledTo(page: Page, selector: string): Promise<void> {
  const target = page.locator(selector);
  await expect
    .poll(async () => {
      const box = await target.boundingBox();
      const height = page.viewportSize()?.height ?? 0;
      return box !== null && box.y > -4 && box.y < height * 0.6;
    })
    .toBe(true);
}

export async function clickWhenSettled(link: Locator): Promise<void> {
  await link.evaluate(async (element) => {
    element.scrollIntoView({ block: "center" });
    let top = element.getBoundingClientRect().top;
    let offset = window.scrollY;
    let still = 0;
    while (still < 12) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const nextTop = element.getBoundingClientRect().top;
      still = nextTop === top && window.scrollY === offset ? still + 1 : 0;
      top = nextTop;
      offset = window.scrollY;
    }
  });
  await link.click();
}

export async function scrollY(page: Page): Promise<number> {
  return page.evaluate(() => Math.round(window.scrollY));
}

export async function scrollToEnd(page: Page): Promise<void> {
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
}

export async function scrollThrough(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const step = Math.max(200, Math.round(window.innerHeight * 0.8));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
}

export async function getOverflow(page: Page): Promise<number> {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}

export async function findConcealed(page: Page, selector: string): Promise<string[]> {
  return page.locator(selector).evaluateAll(
    (elements, floor) =>
      elements.flatMap((element) => {
        if (element.closest("[aria-hidden='true'], .sr-only")) return [];
        if (element.getClientRects().length === 0) return [];
        let opacity = 1;
        for (let node: Element | null = element; node; node = node.parentElement) {
          opacity *= Number(getComputedStyle(node).opacity);
        }
        const hidden = getComputedStyle(element).visibility !== "visible" || opacity < floor;
        return hidden
          ? [`${element.tagName.toLowerCase()}: ${element.textContent.slice(0, 40)}`]
          : [];
      }),
    MUTED_OPACITY_FLOOR,
  );
}
