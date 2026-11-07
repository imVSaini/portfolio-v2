import { create } from "zustand";

type IntroState = {
  /** True once the preloader has handed the page over, or decided not to play. */
  done: boolean;
  /** True when the preloader flew the wordmark into the header logo itself. */
  handoff: boolean;
  finish: (handoff?: boolean) => void;
};

export const useIntro = create<IntroState>()((set) => ({
  done: false,
  handoff: false,
  finish: (handoff = false) => set({ done: true, handoff }),
}));

/** Runs `play` once the intro hands over, or now on a page without a preloader. */
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
