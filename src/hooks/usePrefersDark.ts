import { useSyncExternalStore } from "react";

import { prefersDark, subscribePrefersDark } from "@/lib/appearance";

export function usePrefersDark(): boolean {
  return useSyncExternalStore(subscribePrefersDark, prefersDark, () => false);
}
