"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Observer, ScrollTrigger, SplitText, useGSAP);
}

/** Motion runs on md+ widths and only when the visitor hasn't asked for less of it. */
export const MOTION_QUERY = "(prefers-reduced-motion: no-preference)";
export const DESKTOP_MOTION_QUERY =
  "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

export { gsap, Observer, ScrollTrigger, SplitText, useGSAP };
