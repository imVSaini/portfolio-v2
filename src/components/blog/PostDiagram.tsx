"use client";

import { useRef } from "react";

import { PostDiagramArt } from "@/components/blog/PostDiagramArt";
import { SparkIcon } from "@/components/ui/SparkIcon";
import type { PostDiagramName } from "@/data/posts";
import { gsap, MOTION_QUERY, useGSAP } from "@/lib/gsap";

const TITLES: Record<PostDiagramName, string> = {
  spectrum: "Architecture spectrum",
  gates: "Request gates",
  migration: "Expand, migrate, contract",
  layers: "Dependency direction",
  hosting: "A small production setup",
  queryPlan: "Query plan",
  waterfall: "Loading waterfall",
  signals: "Three signals, one ID",
  outboxFlow: "Sync chain vs outbox",
  reversal: "Cost of reversal",
};

/** Seconds between one piece starting to enter and the next. */
const STAGGER = 0.06;

const PACKET_START = 5;

const PACKET_STOP = 12;

const PACKET_FADE = 0.2;

type PostDiagramProps = {
  name: PostDiagramName;
  caption: string;
  /** Says what the drawing shows, for readers who cannot see it. */
  alt: string;
};

/**
 * Framed article diagram. It builds itself when scrolled into view, then keeps dots moving
 * along the connectors while it is on screen.
 */
export function PostDiagram({ name, caption, alt }: PostDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);
  const replay = useRef<(() => void) | null>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERY, () => {
        const intro = gsap.timeline({
          defaults: { ease: "expo.out" },
          scrollTrigger: { trigger: root, start: "top 80%", once: true },
        });
        root.querySelectorAll<SVGElement>("[data-d]").forEach((piece, i) => {
          const at = i * STAGGER;
          switch (piece.dataset.d) {
            case "node":
              intro.from(piece, { opacity: 0, y: 14, duration: 0.7 }, at);
              break;
            case "bar":
              intro.from(piece, { scaleX: 0, transformOrigin: "0% 50%", duration: 0.8 }, at);
              break;
            case "rise":
              intro.from(piece, { scaleY: 0, transformOrigin: "50% 100%", duration: 0.8 }, at);
              break;
            case "draw":
              if (piece instanceof SVGGeometryElement) {
                const length = piece.getTotalLength();
                intro.fromTo(
                  piece,
                  { strokeDasharray: length, strokeDashoffset: length },
                  { strokeDashoffset: 0, duration: 0.6, ease: "power2.out" },
                  at,
                );
              }
              break;
            default:
              intro.from(piece, { opacity: 0, duration: 0.5 }, at);
          }
        });

        const loops = gsap.timeline({ paused: true });
        root.querySelectorAll<SVGElement>("[data-d-packet]").forEach((packet, i) => {
          const path = packet.previousElementSibling;
          if (!(path instanceof SVGGeometryElement)) return;
          const length = path.getTotalLength();
          const start = Math.min(PACKET_START, length);
          const travel = Math.max(length - PACKET_STOP - start, 0);
          const duration = gsap.utils.clamp(0.9, 2.6, length / 70);
          const progress = { value: 0 };
          const run = gsap.timeline({ repeat: -1, repeatDelay: 0.4 });
          run.to(progress, {
            value: 1,
            duration,
            ease: "none",
            onUpdate: () => {
              const point = path.getPointAtLength(start + progress.value * travel);
              packet.setAttribute("cx", `${point.x}`);
              packet.setAttribute("cy", `${point.y}`);
            },
          });
          run.to(packet, { opacity: 1, duration: PACKET_FADE, ease: "none" }, 0);
          run.to(
            packet,
            { opacity: 0, duration: PACKET_FADE, ease: "none" },
            duration - PACKET_FADE,
          );
          loops.add(run, i * 0.2);
        });
        root.querySelectorAll<SVGElement>("[data-d-sweep]").forEach((sweep) => {
          loops.fromTo(
            sweep,
            { opacity: 1, y: 0 },
            {
              y: Number(sweep.dataset.dSweep),
              duration: 2.2,
              ease: "none",
              repeat: -1,
              repeatDelay: 0.5,
              immediateRender: false,
            },
            0,
          );
        });

        // The loops wait for the build to finish, and rest while the diagram is off screen.
        let built = false;
        let visible = false;
        const observer = new IntersectionObserver(([entry]) => {
          visible = entry?.isIntersecting ?? false;
          if (visible && built) loops.play();
          else loops.pause();
        });
        observer.observe(root);
        intro.eventCallback("onComplete", () => {
          built = true;
          if (visible) loops.play();
        });
        replay.current = () => {
          built = false;
          loops.pause();
          intro.restart();
        };

        return () => {
          replay.current = null;
          observer.disconnect();
          loops.kill();
        };
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <figure className="my-2 flex flex-col gap-3">
      <div
        ref={ref}
        className="overflow-hidden rounded-2xl border border-line bg-surface corner-squircle"
      >
        <div className="flex items-center gap-3 border-b border-line py-1.5 pr-2 pl-5 font-display text-p4 font-medium tracking-wide text-muted uppercase">
          <SparkIcon aria-hidden="true" className="size-3 shrink-0 text-accent" />
          {TITLES[name]}
          <button
            type="button"
            onClick={() => replay.current?.()}
            className="ml-auto cursor-pointer rounded-md px-3 py-1.5 tracking-wide uppercase transition-colors duration-300 motion-reduce:hidden intent:bg-hover intent:text-faded-black dark:intent:text-manila-light"
          >
            Replay
          </button>
        </div>
        <div
          tabIndex={0}
          role="group"
          aria-label={`Diagram: ${caption}`}
          className="overflow-x-auto p-4 sm:p-6"
        >
          <PostDiagramArt name={name} alt={alt} className="w-full min-w-136" />
        </div>
      </div>
      <figcaption className="text-p4 text-muted">{caption}</figcaption>
    </figure>
  );
}
