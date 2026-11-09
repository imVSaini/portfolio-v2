import { useSyncExternalStore } from "react";

const noop = () => () => {};
const BUILD_YEAR = Number(process.env.BUILD_YEAR);

/**
 * Returns the visitor's current year.
 *
 * During SSR and hydration it returns the build year instead, so server and client markup never
 * clash.
 *
 * @returns A four-digit year.
 */
export function useCurrentYear(): number {
  return useSyncExternalStore(
    noop,
    () => new Date().getFullYear(),
    () => BUILD_YEAR,
  );
}
