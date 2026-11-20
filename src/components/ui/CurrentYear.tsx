"use client";

import { useCurrentYear } from "@/hooks/useCurrentYear";

/** The visitor's current year, rendered as the build year until hydration. */
export function CurrentYear() {
  return <>{useCurrentYear()}</>;
}
