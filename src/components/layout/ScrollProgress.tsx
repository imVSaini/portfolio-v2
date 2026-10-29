"use client";

import { useScroll } from "@/stores/scroll";

export function ScrollProgress() {
  const progress = useScroll((s) => s.progress);
  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-accent"
      style={{ transform: `scaleX(${progress})` }}
    />
  );
}
