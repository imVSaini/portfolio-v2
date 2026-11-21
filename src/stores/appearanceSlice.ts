import type { PersistStorage } from "zustand/middleware";

import {
  ACCENTS,
  DEFAULTS,
  STORAGE_KEYS,
  THEMES,
  TONES,
  type Accent,
  type Theme,
  type Tone,
} from "@/lib/appearance";

import type { AppSlice } from "./index";

export type AppearanceValues = { theme: Theme; accent: Accent; tone: Tone };

export type AppearanceSlice = AppearanceValues & {
  setTheme: (theme: Theme) => void;
  setAccent: (accent: Accent) => void;
  setTone: (tone: Tone) => void;
};

function read<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return allowed.includes(value as T) ? (value as T) : fallback;
  } catch {
    return fallback;
  }
}

function sameAppearance(a: AppearanceValues, b: AppearanceValues) {
  return a.theme === b.theme && a.accent === b.accent && a.tone === b.tone;
}

let stored: AppearanceValues | undefined;

/**
 * Each preference lives under its own plain-string key (not one JSON blob) so the
 * pre-paint script in <head> can read them without parsing.
 */
export const splitStorage: PersistStorage<AppearanceValues> = {
  getItem: () => {
    stored = {
      theme: read(STORAGE_KEYS.theme, THEMES, DEFAULTS.theme),
      accent: read(STORAGE_KEYS.accent, ACCENTS, DEFAULTS.accent),
      tone: read(STORAGE_KEYS.tone, TONES, DEFAULTS.tone),
    };
    return { state: stored, version: 0 };
  },
  setItem: (_name, { state }) => {
    if (stored && sameAppearance(stored, state)) return;
    stored = { theme: state.theme, accent: state.accent, tone: state.tone };
    try {
      localStorage.setItem(STORAGE_KEYS.theme, state.theme);
      localStorage.setItem(STORAGE_KEYS.accent, state.accent);
      localStorage.setItem(STORAGE_KEYS.tone, state.tone);
    } catch {
      // Storage can be blocked (private mode); the in-memory choice still applies.
    }
  },
  removeItem: () => {
    stored = undefined;
    for (const key of Object.values(STORAGE_KEYS)) localStorage.removeItem(key);
  },
};

/**
 * The visitor's theme, accent and tone. The store persists them through `splitStorage` and
 * applies them to the document whenever one changes.
 *
 * @returns The appearance slice of `useAppStore`.
 *
 * @example
 * ```ts
 * const setTheme = useAppStore((state) => state.setTheme);
 * setTheme("dark");
 * ```
 */
export const createAppearanceSlice: AppSlice<AppearanceSlice> = (set) => ({
  ...DEFAULTS,
  setTheme: (theme) => set({ theme }),
  setAccent: (accent) => set({ accent }),
  setTone: (tone) => set({ tone }),
});
