import { useMemo, useSyncExternalStore } from "react";

import { useScroll } from "@/stores/scroll";

/** A zero-height line across the middle of the viewport; the section crossing it is current. */
const ROOT_MARGIN = "-50% 0px -50% 0px";

type Anchor = `#${string}`;

function createSpy(anchors: readonly Anchor[]) {
  let active: Anchor | null = null;

  return {
    subscribe: (onChange: () => void) => {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const anchor: Anchor = `#${entry.target.id}`;
            const line = entry.rootBounds?.top ?? window.innerHeight / 2;
            if (entry.isIntersecting) active = anchor;
            else if (active === anchor && entry.boundingClientRect.top > line) active = null;
          }
          onChange();
        },
        { rootMargin: ROOT_MARGIN },
      );
      for (const anchor of anchors) {
        const section = document.querySelector(anchor);
        if (section) observer.observe(section);
      }
      return () => observer.disconnect();
    },
    getSnapshot: () => active,
  };
}

/**
 * The in-page anchor whose section is mid-viewport, or `null` above the first one. During a smooth
 * jump it reports the destination, so the nav doesn't flick through every section on the way.
 */
export function useActiveSection(anchors: readonly Anchor[]): Anchor | null {
  const spy = useMemo(() => createSpy(anchors), [anchors]);
  const spied = useSyncExternalStore(spy.subscribe, spy.getSnapshot, () => null);
  const heading = useScroll((s) => s.heading);
  if (heading === null) return spied;
  return anchors.find((anchor) => anchor === heading) ?? null;
}
