import { useId, type ReactNode } from "react";

import { ArrowHead, Label } from "@/components/article/ArtParts";
import { cn } from "@/lib/cn";

/*
 * Building blocks of the in-article diagrams. `DiagramFrame` animates them through data attributes:
 * `data-d` picks how a piece enters (node, draw, fade, bar, rise), `data-d-packet` marks a dot
 * that travels along the path before it, and `data-d-sweep` a highlight that loops downwards.
 * Everything is drawn in its final state, so the diagram reads the same with motion off.
 */

const WIDTH = 720;

/** 24 by 24 line icons. */
const ICONS = {
  monitor: "M3 5h18v11H3z M8 20h8 M12 16v4",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  key: "M12 12a4 4 0 1 1-8 0a4 4 0 0 1 8 0Z M12 12h9 M18 12v3",
  server: "M4 5h16v6H4z M4 13h16v6H4z M8 8h.01 M8 16h.01",
  db: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Zm0 0v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
  bolt: "M13 2 4 14h7l-1 8 9-12h-7l1-8Z",
  refresh: "M20 12a8 8 0 1 1-2.3-5.7M20 4v4.5h-4.5",
  box: "M12 3l8 4.5v9L12 21l-8-4.5v-9z M4 7.5l8 4.5 8-4.5 M12 12v9",
  mail: "M3 6h18v12H3z M3 7l9 6 9-6",
  card: "M3 6h18v12H3z M3 10h18",
  chart: "M4 20V10 M10 20V4 M16 20v-7 M22 20H2",
  list: "M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01",
  route: "M3 6h8 M7 12h10 M13 18h8",
  layout: "M3 4h18v16H3z M3 9h18 M9 9v11",
  globe: "M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18Z M3 12h18 M12 3c3 3 3 15 0 18 M12 3c-3 3-3 15 0 18",
  layers: "M12 3l9 5-9 5-9-5z M3 13l9 5 9-5",
} as const;

type SubProps = {
  x: number;
  y: number;
  anchor?: "start" | "middle" | "end";
  children: string;
};

export function Sub({ x, y, anchor = "start", children }: SubProps) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={10.5}
      stroke="none"
      className="fill-muted font-sans"
    >
      {children}
    </text>
  );
}

export const PANEL = "fill-surface-raised stroke-line-strong";
export const PANEL_ACCENT = "fill-accent/10 stroke-accent";

export type NodeSpec = {
  id: string;
  x: number;
  y: number;
  w: number;
  h?: number;
  label: string;
  sub?: string;
  icon: keyof typeof ICONS;
  accent?: boolean;
  /** Icon above a centred label, for narrow nodes. */
  stack?: boolean;
};

const CHIP = 28;

function Node({ x, y, w, h = 56, label, sub, icon, accent = false, stack = false }: NodeSpec) {
  const chipX = stack ? x + (w - CHIP) / 2 : x + (h - CHIP) / 2;
  const chipY = stack ? y + 15 : y + (h - CHIP) / 2;
  const textX = chipX + CHIP + 10;

  return (
    <g data-d="node">
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={12}
        strokeWidth={1.5}
        className={accent ? PANEL_ACCENT : PANEL}
      />
      <rect
        x={chipX}
        y={chipY}
        width={CHIP}
        height={CHIP}
        rx={8}
        stroke="none"
        className={accent ? "fill-accent/20" : "fill-hover dark:fill-line-strong"}
      />
      <g
        transform={`translate(${chipX + 6} ${chipY + 6}) scale(${16 / 24})`}
        strokeWidth={2.4}
        className={cn(accent && "stroke-accent")}
      >
        <path d={ICONS[icon]} />
      </g>
      {stack ? (
        <Label x={x + w / 2} y={y + h - 15} anchor="middle" size={11}>
          {label}
        </Label>
      ) : (
        <>
          <Label x={textX} y={sub ? y + h / 2 - 4 : y + h / 2 + 4} size={11}>
            {label}
          </Label>
          {sub && (
            <Sub x={textX} y={y + h / 2 + 11}>
              {sub}
            </Sub>
          )}
        </>
      )}
      {accent && <circle cx={x + w - 12} cy={y + 12} r={3} stroke="none" className="fill-accent" />}
    </g>
  );
}

type LinkSpec = {
  from: string;
  to: string;
  /** Asynchronous hop. */
  dashed?: boolean;
  /** Leaves from the bottom edge instead of the right; inferred from the layout when omitted. */
  down?: boolean;
  fromX?: number;
  fromY?: number;
  toX?: number;
  toY?: number;
};

type WireProps = {
  d: string;
  dashed?: boolean;
  className?: string;
  children: ReactNode;
};

/** A connector, the dot that travels along it, and its arrowhead. */
export function Wire({ d, dashed = false, className, children }: WireProps) {
  return (
    <g strokeWidth={1.5} className={className}>
      <path
        d={d}
        data-d={dashed ? "fade" : "draw"}
        {...(dashed && { strokeDasharray: "5 5" })}
        className={cn(dashed && "motion-safe:animate-dash-flow")}
      />
      <circle data-d-packet="" r={3.5} opacity={0} stroke="none" className="fill-accent" />
      <g data-d="fade">{children}</g>
    </g>
  );
}

function DownHead({ x, y }: { x: number; y: number }) {
  return <path d={`M${x - 7} ${y - 9} L${x} ${y} L${x + 7} ${y - 9}`} />;
}

export function UpHead({ x, y }: { x: number; y: number }) {
  return <path d={`M${x - 7} ${y + 9} L${x} ${y} L${x + 7} ${y + 9}`} />;
}

const HEAD_LEAD = 12;

const ELBOW = 10;

function Link({ nodes, link }: { nodes: NodeSpec[]; link: LinkSpec }) {
  const from = nodes.find((node) => node.id === link.from);
  const to = nodes.find((node) => node.id === link.to);
  if (!from || !to) return null;
  const fromH = from.h ?? 56;
  const toH = to.h ?? 56;

  if (link.down ?? (to.y >= from.y + fromH && to.x < from.x + from.w)) {
    const x1 = link.fromX ?? from.x + from.w / 2;
    const y1 = from.y + fromH;
    const x2 = link.toX ?? to.x + to.w / 2;
    const y2 = to.y - 2;
    const mid = (y1 + y2) / 2;
    const turn = Math.sign(x2 - x1) * ELBOW;
    const route =
      x1 === x2
        ? `V${y2}`
        : `V${mid - ELBOW} Q${x1} ${mid} ${x1 + turn} ${mid} H${x2 - turn} Q${x2} ${mid} ${x2} ${mid + ELBOW} V${y2}`;
    return (
      <Wire d={`M${x1} ${y1} ${route}`} dashed={link.dashed ?? false}>
        <DownHead x={x2} y={y2} />
      </Wire>
    );
  }

  const x1 = from.x + from.w;
  const y1 = link.fromY ?? from.y + fromH / 2;
  const x2 = to.x - 2;
  const y2 = link.toY ?? to.y + toH / 2;
  const bend = x2 - HEAD_LEAD;
  const mid = (x1 + bend) / 2;
  return (
    <Wire
      d={`M${x1} ${y1} C${mid} ${y1} ${mid} ${y2} ${bend} ${y2} H${x2}`}
      dashed={link.dashed ?? false}
    >
      <ArrowHead x={x2} y={y2} />
    </Wire>
  );
}

export function Graph({ nodes, links }: { nodes: NodeSpec[]; links: LinkSpec[] }) {
  return (
    <>
      {nodes.map((node) => (
        <Node key={node.id} {...node} />
      ))}
      {links.map((link) => (
        <Link key={`${link.from}-${link.to}`} nodes={nodes} link={link} />
      ))}
    </>
  );
}

type DiagramCanvasProps = {
  height: number;
  /** Says what the drawing shows, for readers who cannot see it. */
  alt: string;
  className?: string;
  children: ReactNode;
};

export function DiagramCanvas({ height, alt, className, children }: DiagramCanvasProps) {
  const grid = useId();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${WIDTH} ${height}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={alt}
      className={className}
    >
      <defs>
        <pattern id={grid} width={18} height={18} patternUnits="userSpaceOnUse">
          <circle cx={1.5} cy={1.5} r={1} stroke="none" className="fill-line-strong" />
        </pattern>
      </defs>
      <rect width={WIDTH} height={height} fill={`url(#${grid})`} stroke="none" opacity={0.5} />
      {children}
    </svg>
  );
}
