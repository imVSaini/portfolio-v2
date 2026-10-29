"use client";

import { useRef, type ElementType, type ReactNode } from "react";

import { gsap, MOTION_QUERY, SplitText, useGSAP } from "@/lib/gsap";

type RevealTextProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** `load` plays immediately (hero); `scroll` waits for the element to enter. */
  on?: "load" | "scroll";
  delay?: number;
  id?: string;
};

/** Masked line-by-line rise, re-split automatically when lines reflow. */
export function RevealText({
  as: Tag = "div",
  children,
  className,
  on = "scroll",
  delay = 0,
  id,
}: RevealTextProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERY, () => {
        const split = SplitText.create(el, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit: (self) => {
            gsap.set(el, { visibility: "visible" });
            return gsap.from(self.lines, {
              yPercent: 110,
              rotate: 2,
              duration: 1.15,
              ease: "expo.out",
              stagger: 0.09,
              delay,
              ...(on === "scroll" && {
                scrollTrigger: { trigger: el, start: "top 88%", once: true },
              }),
            });
          },
        });
        return () => split.revert();
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} id={id} className={className} data-reveal="">
      {children}
    </Tag>
  );
}
