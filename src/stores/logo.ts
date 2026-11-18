import { create } from "zustand";

type LogoState = {
  /** True while the header logo is folded to its monogram by scrolling. */
  folded: boolean;
  setFolded: (folded: boolean) => void;
};

/**
 * The header logo's scroll fold, so copies of the logo (such as the mobile menu's) can match it.
 *
 * @example
 * ```ts
 * const startFolded = useLogo.getState().folded;
 * ```
 */
export const useLogo = create<LogoState>()((set) => ({
  folded: false,
  setFolded: (folded) => set({ folded }),
}));
