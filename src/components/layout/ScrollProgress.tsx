"use client";

import { useAppStore } from "@/stores";

export function ScrollProgress() {
  const progress = useAppStore((s) => s.progress);
  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 top-0 h-0.5 origin-left bg-accent"
      style={{ transform: `scaleX(${progress})` }}
    />
  );
}
