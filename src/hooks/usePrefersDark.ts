import { useSyncExternalStore } from "react";

import { prefersDark, subscribePrefersDark } from "@/lib/appearance";

/**
 * Subscribes to the operating system's colour scheme and re-renders when it changes.
 *
 * @returns `true` when the OS prefers dark; always `false` on the server.
 */
export function usePrefersDark(): boolean {
  return useSyncExternalStore(subscribePrefersDark, prefersDark, () => false);
}
