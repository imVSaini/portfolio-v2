import { create } from "zustand";

export type ScrollTarget = number | string | HTMLElement;

type ScrollState = {
  /** 1 = down, -1 = up. */
  direction: 1 | -1;
  /** True once the page has left the very top. */
  scrolled: boolean;
  /** 0–1 through the whole document. */
  progress: number;
  scrollTo: (target: ScrollTarget, options?: { offset?: number; immediate?: boolean }) => void;
  report: (values: { scroll: number; direction: number; progress: number }) => void;
};

function nativeScrollTo(target: ScrollTarget, options?: { offset?: number }) {
  const offset = options?.offset ?? 0;
  const top =
    typeof target === "number"
      ? target
      : (typeof target === "string"
          ? document.querySelector(target)
          : target
        )?.getBoundingClientRect().top;
  if (top === undefined) return;
  const absolute = typeof target === "number" ? top : top + window.scrollY;
  window.scrollTo({ top: absolute + offset });
}

/**
 * Shared scroll state and the one place to scroll the page from.
 *
 * `scrollTo` jumps natively until the smooth scroller boots and replaces it, so always call it
 * rather than `window.scrollTo`.
 *
 * @example
 * ```ts
 * useScroll.getState().scrollTo("#work", { offset: -80 });
 * ```
 */
export const useScroll = create<ScrollState>()((set, get) => ({
  direction: 1,
  scrolled: false,
  progress: 0,
  // Replaced by the smooth scroller once it boots; native jump until then (and under reduced motion).
  scrollTo: nativeScrollTo,
  report: ({ scroll, direction, progress }) => {
    const state = get();
    const nextDirection = direction === -1 ? -1 : direction === 1 ? 1 : state.direction;
    const scrolled = scroll > 8;
    if (
      nextDirection !== state.direction ||
      scrolled !== state.scrolled ||
      Math.abs(progress - state.progress) > 0.001
    ) {
      set({ direction: nextDirection, scrolled, progress });
    }
  },
}));
