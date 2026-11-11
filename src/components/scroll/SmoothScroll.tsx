"use client";

import LocomotiveScroll from "locomotive-scroll";
import { useEffect } from "react";

import { gsap, MOTION_QUERY, ScrollTrigger } from "@/lib/gsap";
import { whenIntroDone } from "@/stores/intro";
import { useScroll } from "@/stores/scroll";

const HEADER_OFFSET = -72;

/**
 * Locomotive Scroll v5 (Lenis under the hood) driven by GSAP's ticker, so smooth
 * scrolling, `data-scroll-speed` parallax and every ScrollTrigger share one frame loop.
 */
export function SmoothScroll() {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-motion-ready", "");

    const onNativeScroll = () => {
      const limit = root.scrollHeight - window.innerHeight;
      useScroll.getState().report({
        scroll: window.scrollY,
        direction: 0,
        progress: limit > 0 ? window.scrollY / limit : 0,
      });
    };

    if (!window.matchMedia(MOTION_QUERY).matches) {
      window.addEventListener("scroll", onNativeScroll, { passive: true });
      return () => window.removeEventListener("scroll", onNativeScroll);
    }

    const locomotive = new LocomotiveScroll({
      lenisOptions: { lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.95, anchors: false },
      scrollCallback: ({ scroll, direction, progress }) => {
        ScrollTrigger.update();
        useScroll.getState().report({ scroll, direction, progress });
      },
      initCustomTicker: (render) => gsap.ticker.add(render),
      destroyCustomTicker: (render) => gsap.ticker.remove(render),
    });
    gsap.ticker.lagSmoothing(0);
    locomotive.stop();
    const stopWaiting = whenIntroDone(() => locomotive.start());

    useScroll.setState({
      scrollTo: (target, options) =>
        locomotive.scrollTo(target, {
          offset: options?.offset ?? (typeof target === "number" ? 0 : HEADER_OFFSET),
          duration: 1.4,
          immediate: options?.immediate ?? false,
          easing: (t) => 1 - Math.pow(1 - t, 4),
        }),
    });

    // Webfonts change line boxes; re-measure every trigger once they land.
    let active = true;
    void document.fonts.ready.then(() => {
      if (!active) return;
      ScrollTrigger.refresh();
      const target =
        location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target)
        locomotive.scrollTo(target, { offset: HEADER_OFFSET, immediate: true, force: true });
    });

    return () => {
      active = false;
      stopWaiting();
      locomotive.destroy();
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, []);

  return null;
}
