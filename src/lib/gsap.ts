"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { Observer } from "gsap/Observer";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(MorphSVGPlugin, Observer, ScrollTrigger, SplitText, useGSAP);
}

/** Motion runs only when the visitor hasn't asked for less of it. */
export const MOTION_QUERY = "(prefers-reduced-motion: no-preference)";
/** `MOTION_QUERY` limited to md+ widths with enough height for pinned and parallax effects. */
export const DESKTOP_MOTION_QUERY =
  "(min-width: 768px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)";

export { gsap, MorphSVGPlugin, Observer, ScrollTrigger, SplitText, useGSAP };
