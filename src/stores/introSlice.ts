import type { AppSlice } from "./index";

export type IntroSlice = {
  /** True once the preloader has handed the page over, or decided not to play. */
  done: boolean;
  /** True when the preloader flew the wordmark into the header logo itself. */
  handoff: boolean;
  finish: (handoff?: boolean) => void;
};

/**
 * Tracks the preloader intro, so page motion can wait until it has finished
 * (see `whenIntroDone`).
 *
 * @returns The intro slice of `useAppStore`.
 *
 * @example
 * ```ts
 * useAppStore.getState().finish(handoff);
 * ```
 */
export const createIntroSlice: AppSlice<IntroSlice> = (set) => ({
  done: false,
  handoff: false,
  finish: (handoff = false) => set({ done: true, handoff }),
});
