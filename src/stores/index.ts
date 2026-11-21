import { create, type StateCreator } from "zustand";
import { persist } from "zustand/middleware";

import { applyAppearance } from "@/lib/appearance";

import { createAppearanceSlice, splitStorage, type AppearanceSlice } from "./appearanceSlice";
import { createIntroSlice, type IntroSlice } from "./introSlice";
import { createLogoSlice, type LogoSlice } from "./logoSlice";
import { createScrollSlice, type ScrollSlice } from "./scrollSlice";

export type AppStore = AppearanceSlice & IntroSlice & LogoSlice & ScrollSlice;

/** A slice creator typed against the whole store and its middleware. */
export type AppSlice<Slice> = StateCreator<AppStore, [["zustand/persist", unknown]], [], Slice>;

const IS_BROWSER = typeof window !== "undefined";

/**
 * The site's one client store, combined from the appearance, intro, logo and scroll slices.
 * Only the appearance values are persisted.
 *
 * @example
 * ```ts
 * const scrolled = useAppStore((state) => state.scrolled);
 * useAppStore.getState().scrollTo("#work");
 * ```
 */
export const useAppStore = create<AppStore>()(
  persist(
    (...a) => ({
      ...createAppearanceSlice(...a),
      ...createIntroSlice(...a),
      ...createLogoSlice(...a),
      ...createScrollSlice(...a),
    }),
    {
      name: "appearance",
      storage: IS_BROWSER ? splitStorage : undefined,
      partialize: ({ theme, accent, tone }) => ({ theme, accent, tone }),
    },
  ),
);

if (IS_BROWSER) {
  useAppStore.subscribe((state, prev) => {
    if (state.theme !== prev.theme || state.accent !== prev.accent || state.tone !== prev.tone) {
      applyAppearance(state);
    }
  });
}

/**
 * Runs a callback once the intro hands over, or straight away on a page without a preloader.
 *
 * @param play - Starts the animation that has to wait for the intro.
 * @returns A function that cancels the wait if `play` has not run yet.
 *
 * @example
 * ```ts
 * const stopWaiting = whenIntroDone(() => intro.play());
 * return () => stopWaiting();
 * ```
 */
export function whenIntroDone(play: () => void): () => void {
  if (useAppStore.getState().done || !document.querySelector("[data-preloader]")) {
    play();
    return () => {};
  }
  const unsubscribe = useAppStore.subscribe(({ done }) => {
    if (!done) return;
    unsubscribe();
    play();
  });
  return unsubscribe;
}
