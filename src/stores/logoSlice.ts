import type { AppSlice } from "./index";

export type LogoSlice = {
  /** True while the header logo is folded to its monogram by scrolling. */
  folded: boolean;
  setFolded: (folded: boolean) => void;
};

/**
 * The header logo's scroll fold, so copies of the logo (such as the mobile menu's) can match it.
 *
 * @returns The logo slice of `useAppStore`.
 *
 * @example
 * ```ts
 * const startFolded = useAppStore.getState().folded;
 * ```
 */
export const createLogoSlice: AppSlice<LogoSlice> = (set) => ({
  folded: false,
  setFolded: (folded) => set({ folded }),
});
