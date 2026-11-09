import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/**
 * Subscribes to `prefers-reduced-motion` and re-renders when it changes.
 *
 * Use it for motion that GSAP and CSS can't switch off, such as SVG `<animateMotion>`.
 *
 * @returns `true` when the visitor asked for reduced motion; always `false` on the server.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
