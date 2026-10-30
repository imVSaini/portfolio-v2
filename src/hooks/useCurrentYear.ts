import { useSyncExternalStore } from "react";

const noop = () => () => {};
const BUILD_YEAR = Number(process.env.BUILD_YEAR);

/** The visitor's current year; the build year during SSR and hydration, so the two never clash. */
export function useCurrentYear(): number {
  return useSyncExternalStore(
    noop,
    () => new Date().getFullYear(),
    () => BUILD_YEAR,
  );
}
