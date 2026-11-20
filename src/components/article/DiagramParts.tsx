import type { ReactNode } from "react";

import { ArrowHead, barPath, Label } from "@/components/article/ArtParts";
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
  users:
    "M9 11a4 4 0 1 0 0-8a4 4 0 0 0 0 8Z M2 21c0-3.9 3.1-7 7-7s7 3.1 7 7 M16 3.5a4 4 0 0 1 0 7.5 M18 14.5c2.4.9 4 3.3 4 6.5",
  flag: "M5 21V4 M5 4h11l-2 4 2 4H5",
  branch:
    "M6 3v12 M6 21a3 3 0 1 0 0-6a3 3 0 0 0 0 6Z M18 9a3 3 0 1 0 0-6a3 3 0 0 0 0 6Z M18 9a9 9 0 0 1-9 9",
  lock: "M5 11h14v10H5z M8 11V7a4 4 0 0 1 8 0v4",
  clock: "M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18Z M12 7v5l3 3",
  doc: "M6 3h9l4 4v14H6z M14 3v5h5 M9 13h7 M9 17h7",
  spark: "M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z",
  cloud: "M7 18a5 5 0 1 1 .9-9.9A6 6 0 0 1 19 10a4 4 0 0 1 0 8z",
  check: "M5 12l5 5 9-10",
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

const DEPTH = 5;

type SurfaceProps = { x: number; y: number; w: number; h: number; accent: boolean };

function Surface({ x, y, w, h, accent }: SurfaceProps) {
  return (
    <>
      <rect
        x={x + DEPTH}
        y={y + DEPTH}
        width={w}
        height={h}
        rx={12}
        stroke="none"
        className="fill-line-strong"
      />
      {accent && (
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          rx={12}
          stroke="none"
          className="fill-surface-raised"
        />
      )}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={12}
        strokeWidth={1.5}
        className={accent ? PANEL_ACCENT : PANEL}
      />
    </>
  );
}

const CHIP = 28;

function Node({ x, y, w, h = 56, label, sub, icon, accent = false, stack = false }: NodeSpec) {
  const chipX = stack ? x + (w - CHIP) / 2 : x + (h - CHIP) / 2;
  const chipY = stack ? y + 15 : y + (h - CHIP) / 2;
  const textX = chipX + CHIP + 10;

  return (
    <g data-d="node">
      <Surface x={x} y={y} w={w} h={h} accent={accent} />
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

const START = /^M\s*(-?[\d.]+)[\s,]+(-?[\d.]+)/;

const HOP = /^M\s*(-?[\d.]+)[\s,]+(-?[\d.]+)\s*([HV])\s*(-?[\d.]+)$/;

function wireStart(d: string) {
  const hop = HOP.exec(d.trim());
  if (hop) {
    const [, x, y, axis, end] = hop;
    if (Math.abs(Number(end) - Number(axis === "H" ? x : y)) < PORT_SPAN) return null;
  }
  const match = START.exec(d);
  return match?.[1] && match[2] ? { x: Number(match[1]), y: Number(match[2]) } : null;
}

type JointProps = { x1: number; y1: number; x2: number; y2: number };

/** Stands in for an arrow where two cards sit too close for one: a plain line, edge to edge. */
export function Joint({ x1, y1, x2, y2 }: JointProps) {
  return <Wire d={`M${x1} ${y1} L${x2} ${y2}`} port={false} bare />;
}

type WireProps = {
  d: string;
  dashed?: boolean;
  /** Marks where the connector leaves; off for short hops and lines that start from text. */
  port?: boolean;
  /** No arrowhead, so the travelling dot runs the whole length. */
  bare?: boolean;
  className?: string;
  children?: ReactNode;
};

/** A connector, the dot that travels along it, and its arrowhead. */
export function Wire({
  d,
  dashed = false,
  port = true,
  bare = false,
  className,
  children,
}: WireProps) {
  const start = port ? wireStart(d) : null;

  return (
    <g strokeWidth={1.5} className={className}>
      <path
        d={d}
        data-d={dashed ? "fade" : "draw"}
        {...(dashed && { strokeDasharray: "5 5" })}
        className={cn(dashed && "motion-safe:animate-dash-flow")}
      />
      <circle
        data-d-packet={bare ? "bare" : ""}
        r={3.5}
        opacity={0}
        stroke="none"
        className="fill-accent"
      />
      <g data-d="fade">
        {start && <circle cx={start.x} cy={start.y} r={3} fill="currentColor" stroke="none" />}
        {children}
      </g>
    </g>
  );
}

export function DownHead({ x, y }: { x: number; y: number }) {
  return <path d={`M${x} ${y} L${x - 6} ${y - 10} L${x + 6} ${y - 10} Z`} fill="currentColor" />;
}

export function UpHead({ x, y }: { x: number; y: number }) {
  return <path d={`M${x} ${y} L${x - 6} ${y + 10} L${x + 6} ${y + 10} Z`} fill="currentColor" />;
}

const HEAD_LEAD = 12;

const PORT_SPAN = 36;

const JOINT_SPAN = 30;

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
    if (x1 === x2 && to.y - y1 < JOINT_SPAN) return <Joint x1={x1} y1={y1} x2={x1} y2={to.y} />;
    const mid = (y1 + y2) / 2;
    const turn = Math.sign(x2 - x1) * ELBOW;
    const route =
      x1 === x2
        ? `V${y2}`
        : `V${mid - ELBOW} Q${x1} ${mid} ${x1 + turn} ${mid} H${x2 - turn} Q${x2} ${mid} ${x2} ${mid + ELBOW} V${y2}`;
    return (
      <Wire d={`M${x1} ${y1} ${route}`} dashed={link.dashed ?? false} port={y2 - y1 >= PORT_SPAN}>
        <DownHead x={x2} y={y2} />
      </Wire>
    );
  }

  const x1 = from.x + from.w;
  const y1 = link.fromY ?? from.y + fromH / 2;
  const x2 = to.x - 2;
  const y2 = link.toY ?? to.y + toH / 2;
  if (y1 === y2 && to.x - x1 < JOINT_SPAN) return <Joint x1={x1} y1={y1} x2={to.x} y2={y1} />;
  const bend = x2 - HEAD_LEAD;
  const mid = (x1 + bend) / 2;
  return (
    <Wire
      d={`M${x1} ${y1} C${mid} ${y1} ${mid} ${y2} ${bend} ${y2} H${x2}`}
      dashed={link.dashed ?? false}
      port={x2 - x1 >= PORT_SPAN}
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

/** A drawing and the height of its 720-wide canvas. */
export type DiagramArt = { height: number; Art: () => ReactNode };

type BarProps = {
  x: number;
  w: number;
  h: number;
  /** Baseline the bar grows up from. */
  axis: number;
  r?: number;
  className?: string;
};

export function Bar({ x, w, h, axis, r = 6, className = PANEL }: BarProps) {
  return (
    <path
      data-d="rise"
      d={barPath({ x, top: axis - h, bottom: axis - 0.75, w, r })}
      strokeWidth={1.5}
      strokeLinecap="butt"
      className={className}
    />
  );
}

type PanelProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  meta?: string;
  accent?: boolean;
};

/** A card with a title row, for one stage, state or side of a comparison. */
export function Panel({ x, y, w, h, title, meta, accent = false }: PanelProps) {
  return (
    <g data-d="node">
      <Surface x={x} y={y} w={w} h={h} accent={accent} />
      <Label x={x + 16} y={y + 23.5} size={10}>
        {title}
      </Label>
      {meta && (
        <Label x={x + w - 16} y={y + 23.5} anchor="end" size={10}>
          {meta}
        </Label>
      )}
      <path d={`M${x} ${y + 40} H${x + w}`} strokeWidth={1.5} className="stroke-line-strong" />
    </g>
  );
}

type ZoneProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  meta?: string;
  className?: string;
};

/** A dashed boundary around nodes that share a host, a team or a fate. */
export function Zone({ x, y, w, h, label, meta, className }: ZoneProps) {
  return (
    <g data-d="fade" className={className}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={14}
        strokeWidth={1.5}
        strokeDasharray="5 5"
        className={cn(!className && "stroke-line-strong")}
      />
      <Label x={x + 14} y={y + 20} size={10}>
        {label}
      </Label>
      {meta && (
        <Label x={x + w - 14} y={y + 20} anchor="end" size={10}>
          {meta}
        </Label>
      )}
    </g>
  );
}

type NoteProps = {
  x: number;
  y: number;
  anchor?: "start" | "middle" | "end";
  children: string;
};

/** A short label that fades in with the drawing. */
export function Note({ x, y, anchor = "start", children }: NoteProps) {
  return (
    <g data-d="fade">
      <Label x={x} y={y} anchor={anchor} size={10}>
        {children}
      </Label>
    </g>
  );
}

/** A sentence of explanation, set smaller and muted. */
export function Remark({ x, y, anchor = "start", children }: NoteProps) {
  return (
    <g data-d="fade">
      <Sub x={x} y={y} anchor={anchor}>
        {children}
      </Sub>
    </g>
  );
}

type ChipProps = {
  x: number;
  y: number;
  w: number;
  label: string;
  tone?: "plain" | "accent" | "red" | "ghost";
};

const CHIP_TONES = {
  plain: PANEL,
  accent: "fill-accent stroke-accent",
  red: "fill-red/15 stroke-red",
  ghost: "fill-none stroke-line-strong",
} as const;

/** A pill with a short uppercase label, for a status, a value or a step. */
export function Chip({ x, y, w, label, tone = "plain" }: ChipProps) {
  return (
    <g data-d="node" className={cn(tone === "accent" && "text-faded-black")}>
      <rect
        x={x}
        y={y}
        width={w}
        height={24}
        rx={12}
        strokeWidth={1.5}
        {...(tone === "ghost" && { strokeDasharray: "5 5" })}
        className={CHIP_TONES[tone]}
      />
      <Label x={x + w / 2} y={y + 16} anchor="middle" size={9}>
        {label}
      </Label>
    </g>
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
      {children}
    </svg>
  );
}
