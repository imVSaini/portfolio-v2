"use client";

import type { CSSProperties, SVGProps } from "react";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/*
 * Line-art illustrations for the principle cards. Everything draws in currentColor so each
 * card's tone (raised, inverted, accent) colours its own art.
 *
 * Two layers of motion: `data-art-piece` groups are assembled by GSAP when the card scrolls
 * in, and every illustration also runs a CSS idle loop on its inner shapes. The loops live on
 * children of the GSAP-driven groups so the two never fight over `transform`.
 */

type ArtProps = SVGProps<SVGSVGElement>;

const LOOP = "motion-reduce:animate-none";
const centre: CSSProperties = { transformBox: "fill-box", transformOrigin: "center" };
const bottom: CSSProperties = { transformBox: "fill-box", transformOrigin: "50% 100%" };
const delay = (s: number): CSSProperties => ({ animationDelay: `${s}s` });

/** Data first — a schema grid; a wave of cells lights up while data flows along the diagonal. */
export function SchemaArt(props: ArtProps) {
  const filled = new Set([0, 5, 10, 15]);
  return (
    <svg viewBox="0 0 240 240" fill="none" {...props}>
      {Array.from({ length: 16 }, (_, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = 24 + col * 50;
        const y = 24 + row * 50;
        return (
          <g key={i} data-art-piece="">
            <rect
              x={x}
              y={y}
              width="42"
              height="42"
              rx="10"
              stroke="currentColor"
              strokeWidth="1.5"
              fill={filled.has(i) ? "currentColor" : "none"}
              opacity={filled.has(i) ? 0.9 : 0.35}
            />
            {!filled.has(i) && (
              <rect
                x={x}
                y={y}
                width="42"
                height="42"
                rx="10"
                fill="currentColor"
                className={`animate-cell opacity-0 ${LOOP}`}
                style={delay((col + row) * 0.35)}
              />
            )}
          </g>
        );
      })}
      <g data-art-piece="">
        <path
          d="M45 45 L195 195"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          opacity="0.6"
          className={`animate-dash-flow ${LOOP}`}
        />
      </g>
    </svg>
  );
}

/**
 * Make failure boring — a spinning guard ring and calm, evenly spaced ripples around a check.
 * The ripples *are* the rings: no static circles for them to cross, a constant stroke while
 * they grow, and they fade out before reaching the guard ring.
 */
export function ResilienceArt(props: ArtProps) {
  const ripples = [0, 1.2, 2.4];
  return (
    <svg viewBox="0 0 240 240" fill="none" {...props}>
      <g className={`animate-spin-slow ${LOOP}`} style={centre}>
        <circle
          cx="120"
          cy="120"
          r="104"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="2 10"
          strokeLinecap="round"
          opacity="0.5"
        />
      </g>
      {ripples.map((d) => (
        <circle
          key={d}
          cx="120"
          cy="120"
          r="36"
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          className="animate-ripple opacity-0 motion-reduce:hidden"
          style={{ ...centre, ...delay(d) }}
        />
      ))}
      {/* Still frame for reduced motion: the rings the ripples would draw. */}
      {[62, 86].map((r) => (
        <circle
          key={r}
          cx="120"
          cy="120"
          r={r}
          stroke="currentColor"
          strokeWidth="1.5"
          opacity={r === 62 ? 0.5 : 0.3}
          className="hidden motion-reduce:inline"
        />
      ))}
      <g data-art-piece="">
        <circle cx="120" cy="120" r="36" fill="currentColor" opacity="0.9" />
        <path
          d="M104 121 L116 133 L138 108"
          stroke="var(--card-bg)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

/** Small, sharp, measured — bars that breathe, a trend that redraws, a tip that pings. */
export function MeasureArt(props: ArtProps) {
  const bars = [52, 74, 66, 98, 120, 150];
  return (
    <svg viewBox="0 0 240 240" fill="none" {...props}>
      <path d="M20 210 H220" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      {bars.map((h, i) => (
        <g key={h} data-art-piece="">
          <rect
            x={28 + i * 32}
            y={206 - h}
            width="20"
            height={h}
            rx="6"
            fill="currentColor"
            opacity={i === bars.length - 1 ? 0.95 : 0.3 + i * 0.1}
            className={`animate-bar ${LOOP}`}
            style={{ ...bottom, ...delay(i * 0.18) }}
          />
        </g>
      ))}
      <g data-art-piece="">
        <path
          d="M38 140 L70 118 L102 126 L134 92 L166 70 L198 36"
          pathLength={1}
          strokeDasharray="1"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`animate-draw ${LOOP}`}
        />
      </g>
      <g data-art-piece="">
        <circle
          cx="198"
          cy="36"
          r="6"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`animate-sonar opacity-0 ${LOOP}`}
          style={centre}
        />
        <circle cx="198" cy="36" r="6" fill="currentColor" />
      </g>
    </svg>
  );
}

/** Orbits turn about the art's true centre, not their own (dot-skewed) bounding box. */
const orbitCentre: CSSProperties = { transformBox: "view-box", transformOrigin: "120px 120px" };

/**
 * AI as leverage — a twinkling spark held in three orbits, 60° apart like an atom. The orbits
 * turn together as one rigid body (so no two paths ever stack) while each dot travels its own
 * orbit at its own pace. Orbits are drawn untilted (rx 104, ry 50) inside a rotated group, so
 * one path string serves every dot. Clearance: the spark reaches r=34; the nearest an orbit
 * comes is r=50, so even the largest dot (r=6) passes ≥10 units clear of it.
 */
const ORBIT_RX = 104;
const ORBIT_RY = 50;
const orbitPath = `M${120 + ORBIT_RX} 120 A${ORBIT_RX} ${ORBIT_RY} 0 1 1 ${120 - ORBIT_RX} 120 A${ORBIT_RX} ${ORBIT_RY} 0 1 1 ${120 + ORBIT_RX} 120`;

const orbits = [
  { tilt: -24, dotR: 6, opacity: 0.45, dur: 7, phase: 0.1, reverse: false },
  { tilt: 36, dotR: 4, opacity: 0.3, dur: 10, phase: 0.55, reverse: true },
  { tilt: 96, dotR: 3.5, opacity: 0.22, dur: 13, phase: 0.8, reverse: false },
] as const;

/** Resting spot on the untilted orbit for a fraction (0–1) of the way around. */
function orbitPoint(phase: number) {
  const t = phase * 2 * Math.PI;
  return { cx: 120 + ORBIT_RX * Math.cos(t), cy: 120 + ORBIT_RY * Math.sin(t) };
}

export function OrbitArt(props: ArtProps) {
  const reduced = usePrefersReducedMotion();
  return (
    <svg viewBox="0 0 240 240" fill="none" {...props}>
      <g className={`animate-spin-slow ${LOOP}`} style={orbitCentre}>
        {orbits.map(({ tilt, dotR, opacity, dur, phase, reverse }) => (
          <g key={tilt} transform={`rotate(${tilt} 120 120)`}>
            <path d={orbitPath} stroke="currentColor" strokeWidth="1.5" opacity={opacity} />
            {reduced ? (
              <circle
                {...orbitPoint(phase)}
                r={dotR}
                fill="currentColor"
                opacity={opacity + 0.45}
              />
            ) : (
              <circle r={dotR} fill="currentColor" opacity={opacity + 0.45}>
                <animateMotion
                  dur={`${dur}s`}
                  begin={`${-phase * dur}s`}
                  repeatCount="indefinite"
                  path={orbitPath}
                  {...(reverse && { keyPoints: "1;0", keyTimes: "0;1", calcMode: "linear" })}
                />
              </circle>
            )}
          </g>
        ))}
      </g>
      <g data-art-piece="">
        <path
          d="M120 86 L128 112 L154 120 L128 128 L120 154 L112 128 L86 120 L112 112 Z"
          fill="currentColor"
          className={`animate-twinkle ${LOOP}`}
          style={centre}
        />
      </g>
    </svg>
  );
}
