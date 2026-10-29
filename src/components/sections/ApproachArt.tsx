import type { CSSProperties, SVGProps } from "react";

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

/** AI as leverage — a twinkling spark held in two counter-rotating orbits. */
export function OrbitArt(props: ArtProps) {
  return (
    <svg viewBox="0 0 240 240" fill="none" {...props}>
      <g className={`animate-spin-slow ${LOOP}`} style={centre}>
        <ellipse
          cx="120"
          cy="120"
          rx="104"
          ry="44"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.45"
          transform="rotate(-24 120 120)"
        />
        <circle cx="214" cy="80" r="6" fill="currentColor" />
      </g>
      <g
        className={`animate-spin-slow ${LOOP}`}
        style={{ ...centre, animationDirection: "reverse", animationDuration: "30s" }}
      >
        <ellipse
          cx="120"
          cy="120"
          rx="104"
          ry="44"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.3"
          transform="rotate(36 120 120)"
        />
        <circle cx="40" cy="70" r="4" fill="currentColor" opacity="0.7" />
      </g>
      <g data-art-piece="">
        <path
          d="M120 62 L133 107 L178 120 L133 133 L120 178 L107 133 L62 120 L107 107 Z"
          fill="currentColor"
          className={`animate-twinkle ${LOOP}`}
          style={centre}
        />
      </g>
    </svg>
  );
}
