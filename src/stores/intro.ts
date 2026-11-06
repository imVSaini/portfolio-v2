import { create } from "zustand";

type IntroState = {
  /** True once the preloader has handed the page over, or decided not to play. */
  done: boolean;
  finish: () => void;
};

export const useIntro = create<IntroState>()((set) => ({
  done: false,
  finish: () => set({ done: true }),
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
