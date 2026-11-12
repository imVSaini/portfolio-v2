import type { Locator, Page } from "@playwright/test";

import { ACCENTS, DEFAULTS, STORAGE_KEYS, THEME_COLORS } from "@/lib/appearance";

import { expect, openAppearance, openSiteNav, test } from "../fixtures";

type Applied = {
  dark: boolean;
  accent: string | null;
  tone: string | null;
  chrome: string | null;
};

type Stored = { theme: string | null; accent: string | null; tone: string | null };

const ACCENT_LABELS = { gold: "Gold", orange: "Orange", red: "Red", magenta: "Magenta" } as const;
const NOTE = "Applies when the dark theme is on.";
const UNSET: Stored = { theme: null, accent: null, tone: null };

function themeButton(page: Page, name: string): Locator {
  return page
    .getByRole("group", { name: "Color theme" })
    .getByRole("button", { name, exact: true });
}

function toneButton(page: Page, name: string): Locator {
  return page
    .getByRole("group", { name: "Dark surface tone" })
    .getByRole("button", { name, exact: true });
}

function accentRadio(page: Page, name: string): Locator {
  return page.getByRole("radiogroup", { name: "Accent color" }).getByRole("radio", { name });
}

async function readApplied(page: Page): Promise<Applied> {
  return page.evaluate(() => {
    const root = document.documentElement;
    return {
      dark: root.classList.contains("dark"),
      accent: root.getAttribute("data-accent"),
      tone: root.getAttribute("data-tone"),
      chrome: document.querySelector('meta[name="theme-color"]')?.getAttribute("content") ?? null,
    };
  });
}

async function readStored(page: Page): Promise<Stored> {
  return page.evaluate(
    (keys) => ({
      theme: localStorage.getItem(keys.theme),
      accent: localStorage.getItem(keys.accent),
      tone: localStorage.getItem(keys.tone),
    }),
    STORAGE_KEYS,
  );
}

async function readColors(page: Page): Promise<{ accent: string; surface: string }> {
  return page.evaluate(() => {
    const probe = document.createElement("span");
    probe.style.color = "var(--color-accent)";
    document.body.append(probe);
    const accent = getComputedStyle(probe).color;
    probe.remove();
    return { accent, surface: getComputedStyle(document.body).backgroundColor };
  });
}

async function stopTransitions(page: Page): Promise<void> {
  await page.addStyleTag({ content: "*, *::before, *::after { transition: none !important; }" });
}

async function store(page: Page, values: Record<keyof Stored, string>): Promise<void> {
  await page.addInitScript(
    ({ keys, next }) => {
      localStorage.setItem(keys.theme, next.theme);
      localStorage.setItem(keys.accent, next.accent);
      localStorage.setItem(keys.tone, next.tone);
    },
    { keys: STORAGE_KEYS, next: values },
  );
}

test.describe("appearance", () => {
  test("starts on the system theme, gold accent and nothing stored", async ({
    page,
    visit,
    layout,
  }) => {
    await visit("/");

    expect(await readApplied(page)).toEqual({
      dark: false,
      accent: DEFAULTS.accent,
      tone: DEFAULTS.tone,
      chrome: THEME_COLORS.light,
    });
    expect(await readStored(page)).toEqual(UNSET);

    await openAppearance(page, layout);
    await expect(themeButton(page, "System")).toHaveAttribute("aria-pressed", "true");
    await expect(themeButton(page, "Light")).toHaveAttribute("aria-pressed", "false");
    await expect(themeButton(page, "Dark")).toHaveAttribute("aria-pressed", "false");
    await expect(accentRadio(page, "Gold")).toBeChecked();
    await expect(
      page.getByRole("radiogroup", { name: "Accent color" }).getByRole("radio"),
    ).toHaveCount(ACCENTS.length);
  });

  test("switches between light, dark and the two dark tones", async ({ page, visit, layout }) => {
    await visit("/");
    await stopTransitions(page);
    await openAppearance(page, layout);
    const light = await readColors(page);

    await themeButton(page, "Dark").click();
    await expect(page.locator("html")).toHaveClass(/(^|\s)dark(\s|$)/);
    await expect(themeButton(page, "Dark")).toHaveAttribute("aria-pressed", "true");
    await expect(themeButton(page, "System")).toHaveAttribute("aria-pressed", "false");
    expect(await readApplied(page)).toMatchObject({ dark: true, tone: "deep" });
    expect((await readApplied(page)).chrome).toBe(THEME_COLORS.deep);
    expect(await readStored(page)).toEqual({ theme: "dark", accent: "gold", tone: "deep" });
    const deep = await readColors(page);

    await toneButton(page, "Soft").click();
    await expect(page.locator("html")).toHaveAttribute("data-tone", "soft");
    await expect(toneButton(page, "Soft")).toHaveAttribute("aria-pressed", "true");
    expect((await readApplied(page)).chrome).toBe(THEME_COLORS.soft);
    expect(await readStored(page)).toEqual({ theme: "dark", accent: "gold", tone: "soft" });
    const soft = await readColors(page);

    await themeButton(page, "Light").click();
    await expect(page.locator("html")).not.toHaveClass(/(^|\s)dark(\s|$)/);
    expect(await readApplied(page)).toMatchObject({ dark: false, tone: "soft" });
    expect((await readApplied(page)).chrome).toBe(THEME_COLORS.light);
    expect(await readStored(page)).toEqual({ theme: "light", accent: "gold", tone: "soft" });

    expect(new Set([light.surface, deep.surface, soft.surface]).size).toBe(3);
    expect((await readColors(page)).surface).toBe(light.surface);
  });

  test("the dark tone is only adjustable while the page is dark", async ({
    page,
    visit,
    layout,
  }) => {
    await visit("/");
    await openAppearance(page, layout);

    for (const name of ["Soft", "Deep"]) await expect(toneButton(page, name)).toBeDisabled();
    await expect(page.getByText(NOTE)).toBeVisible();

    await themeButton(page, "Dark").click();
    for (const name of ["Soft", "Deep"]) await expect(toneButton(page, name)).toBeEnabled();
    await expect(toneButton(page, "Deep")).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText(NOTE)).toBeHidden();

    await themeButton(page, "Light").click();
    for (const name of ["Soft", "Deep"]) await expect(toneButton(page, name)).toBeDisabled();
    await expect(page.getByText(NOTE)).toBeVisible();
  });

  for (const theme of ["light", "dark"] as const) {
    test(`every accent repaints the ${theme} page with its own colour`, async ({
      page,
      visit,
      layout,
    }) => {
      await visit("/");
      await stopTransitions(page);
      await openAppearance(page, layout);
      await themeButton(page, theme === "dark" ? "Dark" : "Light").click();
      const seen = new Set<string>();

      for (const accent of [...ACCENTS].reverse()) {
        await accentRadio(page, ACCENT_LABELS[accent]).click();

        await expect(page.locator("html")).toHaveAttribute("data-accent", accent);
        await expect(accentRadio(page, ACCENT_LABELS[accent])).toBeChecked();
        await expect(
          page.getByRole("radiogroup", { name: "Accent color" }).getByRole("radio", {
            checked: true,
          }),
        ).toHaveCount(1);
        expect((await readStored(page)).accent).toBe(accent);
        seen.add((await readColors(page)).accent);
      }

      expect(seen.size).toBe(ACCENTS.length);
    });
  }

  test("works from the keyboard", async ({ page, visit, layout }) => {
    await visit("/");
    await openAppearance(page, layout);

    await themeButton(page, "Dark").focus();
    await page.keyboard.press("Space");
    await expect(page.locator("html")).toHaveClass(/(^|\s)dark(\s|$)/);

    await toneButton(page, "Soft").focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("html")).toHaveAttribute("data-tone", "soft");

    await accentRadio(page, "Red").focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("html")).toHaveAttribute("data-accent", "red");
  });

  test("survives a reload, a client navigation and a second tab", async ({
    page,
    context,
    visit,
    layout,
  }) => {
    const chosen = { dark: true, accent: "magenta", tone: "soft", chrome: THEME_COLORS.soft };
    await visit("/");
    await openAppearance(page, layout);
    await themeButton(page, "Dark").click();
    await toneButton(page, "Soft").click();
    await accentRadio(page, "Magenta").click();
    await expect(page.locator("html")).toHaveAttribute("data-accent", "magenta");

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-motion-ready", "");
    expect(await readApplied(page)).toEqual(chosen);
    await openAppearance(page, layout);
    await expect(themeButton(page, "Dark")).toHaveAttribute("aria-pressed", "true");
    await expect(toneButton(page, "Soft")).toHaveAttribute("aria-pressed", "true");
    await expect(accentRadio(page, "Magenta")).toBeChecked();
    await page.keyboard.press("Escape");

    const navigation = await openSiteNav(page, layout);
    await navigation.getByRole("link", { name: "Blog", exact: true }).click();
    await expect(page).toHaveURL(/\/blog$/);
    expect(await readApplied(page)).toEqual(chosen);

    const second = await context.newPage();
    await second.goto("/privacy");
    expect(await readApplied(second)).toEqual(chosen);
    await second.close();
  });

  test("is applied before the page's scripts load", async ({ page }) => {
    await store(page, { theme: "dark", accent: "red", tone: "soft" });
    await page.route("**/_next/static/**/*.js", (route) => route.abort());

    await page.goto("/privacy", { waitUntil: "domcontentloaded" });

    expect(await readApplied(page)).toEqual({
      dark: true,
      accent: "red",
      tone: "soft",
      chrome: THEME_COLORS.soft,
    });
    await expect(page.locator("html")).not.toHaveAttribute("data-motion-ready");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("falls back to the defaults when stored values are not recognised", async ({
    page,
    visit,
    layout,
  }) => {
    await store(page, { theme: "neon", accent: "purple", tone: "medium" });
    await visit("/");

    expect(await readApplied(page)).toEqual({
      dark: false,
      accent: DEFAULTS.accent,
      tone: DEFAULTS.tone,
      chrome: THEME_COLORS.light,
    });
    await openAppearance(page, layout);
    await expect(themeButton(page, "System")).toHaveAttribute("aria-pressed", "true");
    await expect(accentRadio(page, "Gold")).toBeChecked();
  });

  test("follows the operating system while set to system", async ({ page, visit }) => {
    await visit("/");
    expect((await readApplied(page)).dark).toBe(false);

    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("html")).toHaveClass(/(^|\s)dark(\s|$)/);
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
      "content",
      THEME_COLORS.deep,
    );

    await page.emulateMedia({ colorScheme: "light" });
    await expect(page.locator("html")).not.toHaveClass(/(^|\s)dark(\s|$)/);
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
      "content",
      THEME_COLORS.light,
    );
  });

  test("an explicit choice outranks the operating system", async ({ page, visit, layout }) => {
    await visit("/");
    await openAppearance(page, layout);
    await themeButton(page, "Light").click();

    await page.emulateMedia({ colorScheme: "dark" });
    await expect(page.locator("html")).not.toHaveClass(/(^|\s)dark(\s|$)/);
    await expect(page.getByText(NOTE)).toBeVisible();

    await themeButton(page, "System").click();
    await expect(page.locator("html")).toHaveClass(/(^|\s)dark(\s|$)/);
    await expect(toneButton(page, "Deep")).toBeEnabled();
  });

  test.describe("for a visitor whose system is dark", () => {
    test.use({ colorScheme: "dark" });

    test("the first visit is dark without storing a choice", async ({ page, visit, layout }) => {
      await visit("/");

      expect(await readApplied(page)).toEqual({
        dark: true,
        accent: DEFAULTS.accent,
        tone: DEFAULTS.tone,
        chrome: THEME_COLORS.deep,
      });
      expect(await readStored(page)).toEqual(UNSET);
      await openAppearance(page, layout);
      await expect(themeButton(page, "System")).toHaveAttribute("aria-pressed", "true");
      await expect(toneButton(page, "Deep")).toBeEnabled();
      await expect(page.getByText(NOTE)).toBeHidden();
    });

    test("choosing light overrides it", async ({ page, visit, layout }) => {
      await visit("/");
      await openAppearance(page, layout);

      await themeButton(page, "Light").click();

      await expect(page.locator("html")).not.toHaveClass(/(^|\s)dark(\s|$)/);
      expect((await readApplied(page)).chrome).toBe(THEME_COLORS.light);
    });
  });
});

test.describe("appearance popover", () => {
  test("lives in the header from tablet width up", async ({ page, visit, layout }) => {
    await visit("/");
    const trigger = page.getByRole("button", { name: "Appearance" });

    if (layout === "phone") {
      await expect(trigger).toBeHidden();
      return;
    }
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("group", { name: "Color theme" })).toBeInViewport();
  });

  test("Escape closes it and hands focus back", async ({ page, visit, layout }) => {
    test.skip(layout === "phone", "phones reach the controls through the menu");
    await visit("/");
    const popover = await openAppearance(page, layout);

    await page.keyboard.press("Escape");

    await expect(popover).toBeHidden();
    await expect(page.getByRole("button", { name: "Appearance" })).toBeFocused();
  });

  test("a click outside closes it", async ({ page, visit, layout }) => {
    test.skip(layout === "phone", "phones reach the controls through the menu");
    await visit("/");
    const popover = await openAppearance(page, layout);

    await page.mouse.click(24, (page.viewportSize()?.height ?? 600) - 24);

    await expect(popover).toBeHidden();
  });

  test("stays open while choices are made", async ({ page, visit, layout }) => {
    test.skip(layout === "phone", "phones reach the controls through the menu");
    await visit("/");
    const popover = await openAppearance(page, layout);

    await themeButton(page, "Dark").click();
    await accentRadio(page, "Orange").click();

    await expect(popover).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-accent", "orange");
  });

  test("announces itself with a name", async ({ page, visit, layout }) => {
    test.skip(layout === "phone", "phones reach the controls through the menu");
    test.fail(true, "AppearanceMenu's popup is a dialog without a Popover.Title or aria-label");
    await visit("/");
    const popover = await openAppearance(page, layout);

    await expect(popover).toHaveAccessibleName(/\S/, { timeout: 2_000 });
  });
});
