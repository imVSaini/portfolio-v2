import { create } from "zustand";
import { persist, type PersistStorage } from "zustand/middleware";

import {
  ACCENTS,
  applyAppearance,
  DEFAULTS,
  STORAGE_KEYS,
  THEMES,
  TONES,
  type Accent,
  type Theme,
  type Tone,
} from "@/lib/appearance";

type AppearanceValues = { theme: Theme; accent: Accent; tone: Tone };

type AppearanceState = AppearanceValues & {
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

/**
 * Each preference lives under its own plain-string key (not one JSON blob) so the
 * pre-paint script in <head> can read them without parsing.
 */
const splitStorage: PersistStorage<AppearanceValues> = {
  getItem: () => ({
    state: {
      theme: read(STORAGE_KEYS.theme, THEMES, DEFAULTS.theme),
      accent: read(STORAGE_KEYS.accent, ACCENTS, DEFAULTS.accent),
      tone: read(STORAGE_KEYS.tone, TONES, DEFAULTS.tone),
    },
    version: 0,
  }),
  setItem: (_name, { state }) => {
    try {
      localStorage.setItem(STORAGE_KEYS.theme, state.theme);
      localStorage.setItem(STORAGE_KEYS.accent, state.accent);
      localStorage.setItem(STORAGE_KEYS.tone, state.tone);
    } catch {
      // Storage can be blocked (private mode); the in-memory choice still applies.
    }
  },
  removeItem: () => {
    for (const key of Object.values(STORAGE_KEYS)) localStorage.removeItem(key);
  },
};

export const useAppearance = create<AppearanceState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setTheme: (theme) => set({ theme }),
      setAccent: (accent) => set({ accent }),
      setTone: (tone) => set({ tone }),
    }),
    {
      name: "appearance",
      storage: splitStorage,
      partialize: ({ theme, accent, tone }) => ({ theme, accent, tone }),
    },
  ),
);

if (typeof window !== "undefined") {
  useAppearance.subscribe(applyAppearance);
}
