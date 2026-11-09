import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * Reports whether the component is past hydration, for rendering that needs browser-only values.
 *
 * @returns `false` during SSR and the hydration pass, `true` afterwards.
 */
export function useIsHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
