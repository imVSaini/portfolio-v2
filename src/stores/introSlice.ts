import { create } from "zustand";

type IntroState = {
  /** True once the preloader has handed the page over, or decided not to play. */
  done: boolean;
  /** True when the preloader flew the wordmark into the header logo itself. */
  handoff: boolean;
  finish: (handoff?: boolean) => void;
};

/**
 * Tracks the preloader intro, so page motion can wait until it has finished.
 *
 * @example
 * ```ts
 * const done = useIntro((state) => state.done);
 * ```
 */
export const useIntro = create<IntroState>()((set) => ({
  done: false,
  handoff: false,
  finish: (handoff = false) => set({ done: true, handoff }),
}));

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
  if (useIntro.getState().done || !document.querySelector("[data-preloader]")) {
    play();
    return () => {};
  }
  const unsubscribe = useIntro.subscribe(({ done }) => {
    if (!done) return;
    unsubscribe();
    play();
  });
  return unsubscribe;
}
