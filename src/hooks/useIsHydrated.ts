import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** `false` during SSR and the hydration pass, `true` afterwards. */
export function useIsHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
