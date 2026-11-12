import { useId, type ReactNode } from "react";

import { ArrowHead, barPath, Label } from "@/components/blog/PostArtParts";
import type { PostDiagramName } from "@/data/posts";
import { cn } from "@/lib/cn";

/*
 * Drawings for the in-article diagrams. `PostDiagram` animates them through data attributes:
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

function Sub({ x, y, anchor = "start", children }: SubProps) {
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

const PANEL = "fill-surface-raised stroke-line-strong";
const PANEL_ACCENT = "fill-accent/10 stroke-accent";

type NodeSpec = {
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
function Wire({ d, dashed = false, className, children }: WireProps) {
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

function UpHead({ x, y }: { x: number; y: number }) {
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

function Graph({ nodes, links }: { nodes: NodeSpec[]; links: LinkSpec[] }) {
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

const SPECTRUM_NODES: NodeSpec[] = [
  {
    id: "monolith",
    x: 16,
    y: 16,
    w: 214,
    label: "Modular monolith",
    sub: "One deploy, one transaction",
    icon: "box",
    accent: true,
  },
  {
    id: "workers",
    x: 266,
    y: 16,
    w: 224,
    label: "Monolith + workers",
    sub: "Slow work leaves the request",
    icon: "refresh",
  },
  {
    id: "services",
    x: 526,
    y: 16,
    w: 178,
    label: "Services",
    sub: "Independent deploys",
    icon: "server",
  },
];

const SPECTRUM_COST = [
  { x: 123, h: 14 },
  { x: 378, h: 28 },
  { x: 615, h: 50 },
];

type BarProps = {
  x: number;
  w: number;
  h: number;
  axis: number;
  r: number;
  className: string;
};

function Bar({ x, w, h, axis, r, className }: BarProps) {
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

function Spectrum() {
  return (
    <>
      <Graph
        nodes={SPECTRUM_NODES}
        links={[
          { from: "monolith", to: "workers" },
          { from: "workers", to: "services" },
        ]}
      />
      <Wire d="M16 108 H704">
        <ArrowHead x={704} y={108} />
      </Wire>
      <g data-d="fade">
        <Label x={16} y={132} size={10}>
          Few teams · one load profile
        </Label>
        <Label x={704} y={132} anchor="end" size={10}>
          Many teams · different profiles
        </Label>
        <Label x={16} y={179} size={10}>
          Operational cost
        </Label>
      </g>
      {SPECTRUM_COST.map(({ x, h }, i) => (
        <Bar
          key={x}
          x={x - 30}
          w={60}
          h={h}
          axis={222}
          r={5}
          className={i === 2 ? "fill-accent stroke-accent" : "fill-accent/25 stroke-accent"}
        />
      ))}
      <path d="M16 222 H704" strokeWidth={1.5} className="stroke-line-strong" />
    </>
  );
}

const GATES: Pick<NodeSpec, "id" | "label" | "icon" | "accent">[] = [
  { id: "client", label: "Client", icon: "monitor" },
  { id: "limit", label: "Rate limit", icon: "shield" },
  { id: "auth", label: "Auth", icon: "key" },
  { id: "idempotency", label: "Idempotency", icon: "refresh", accent: true },
  { id: "handler", label: "Handler", icon: "server" },
];

const GATE_NODES: NodeSpec[] = GATES.map((node, i) => ({
  ...node,
  x: 16 + i * 143,
  y: 16,
  w: 116,
  h: 84,
  stack: true,
}));

function Gates() {
  return (
    <>
      <Graph
        nodes={GATE_NODES}
        links={[
          { from: "client", to: "limit" },
          { from: "limit", to: "auth" },
          { from: "auth", to: "idempotency" },
          { from: "idempotency", to: "handler" },
        ]}
      />
      <Wire d="M503 100 C503 172 74 172 74 114 V102" dashed>
        <UpHead x={74} y={102} />
      </Wire>
      <g data-d="fade">
        <Label x={288.5} y={131} anchor="middle" size={10}>
          A retry returns the stored response
        </Label>
      </g>
    </>
  );
}

const RELEASES = [
  { x: 16, phase: "Expand", note: "Add the column", reads: "Code reads name", old: true },
  {
    x: 255,
    phase: "Migrate",
    note: "Backfill, switch the code",
    reads: "Code reads full_name",
    old: true,
  },
  {
    x: 494,
    phase: "Contract",
    note: "Drop the old column",
    reads: "Code reads full_name",
    old: false,
  },
];

function Migration() {
  return (
    <>
      {RELEASES.map(({ x, phase, note, reads, old }, i) => (
        <g key={phase}>
          <g data-d="node">
            <rect
              x={x}
              y={16}
              width={210}
              height={162}
              rx={12}
              strokeWidth={1.5}
              className={PANEL}
            />
            <Label x={x + 16} y={39.5} size={10}>
              {`Release ${i + 1}`}
            </Label>
            <Label x={x + 194} y={39.5} anchor="end" size={10}>
              {phase}
            </Label>
            <path d={`M${x} 56 H${x + 210}`} strokeWidth={1.5} className="stroke-line-strong" />
            <g opacity={old ? 1 : 0.4}>
              <rect
                x={x + 16}
                y={72}
                width={178}
                height={30}
                rx={8}
                strokeWidth={1.5}
                {...(!old && { strokeDasharray: "5 5" })}
              />
              <Label x={x + 30} y={90.5} size={10}>
                Name
              </Label>
              {!old && <path d={`M${x + 26} 87 H${x + 66}`} strokeWidth={1.5} />}
            </g>
            <Sub x={x + 16} y={162}>
              {reads}
            </Sub>
          </g>
          <g data-d="bar">
            <rect
              x={x + 16}
              y={110}
              width={178}
              height={30}
              rx={8}
              strokeWidth={1.5}
              className={PANEL_ACCENT}
            />
            <Label x={x + 30} y={128.5} size={10}>
              Full_name
            </Label>
          </g>
          <g data-d="fade">
            <Label x={x + 105} y={201} anchor="middle" size={10}>
              {note}
            </Label>
          </g>
          {i > 0 && (
            <Wire d={`M${x - 29} 97 H${x - 2}`}>
              <ArrowHead x={x - 2} y={97} />
            </Wire>
          )}
        </g>
      ))}
      <path
        data-d="fade"
        d="M16 219 H704"
        strokeWidth={1.5}
        strokeDasharray="5 5"
        className="stroke-accent motion-safe:animate-dash-flow"
      />
      <g data-d="fade">
        <Label x={360} y={242} anchor="middle" size={10}>
          Either version of the code works at every step
        </Label>
      </g>
    </>
  );
}

const LAYER_NODES: NodeSpec[] = [
  { id: "app", x: 256, y: 16, w: 208, label: "App and routes", icon: "layout" },
  {
    id: "deals",
    x: 16,
    y: 120,
    w: 208,
    label: "Deals",
    sub: "UI · hooks · data",
    icon: "box",
    accent: true,
  },
  {
    id: "billing",
    x: 256,
    y: 120,
    w: 208,
    label: "Billing",
    sub: "UI · hooks · data",
    icon: "card",
    accent: true,
  },
  {
    id: "reports",
    x: 496,
    y: 120,
    w: 208,
    label: "Reports",
    sub: "UI · hooks · data",
    icon: "chart",
    accent: true,
  },
  {
    id: "shared",
    x: 16,
    y: 224,
    w: 688,
    label: "Shared UI and utilities",
    icon: "layers",
  },
];

function Layers() {
  return (
    <>
      <Graph
        nodes={LAYER_NODES}
        links={[
          { from: "app", to: "deals" },
          { from: "app", to: "billing" },
          { from: "app", to: "reports", down: true },
          { from: "deals", to: "shared", toX: 120 },
          { from: "billing", to: "shared" },
          { from: "reports", to: "shared", toX: 600 },
        ]}
      />
      <path
        data-d="fade"
        d="M234 142 l12 12 M246 142 l-12 12 M474 142 l12 12 M486 142 l-12 12"
        className="stroke-red"
      />
      <g data-d="fade">
        <Label x={360} y={303} anchor="middle" size={10}>
          Imports point down, never sideways
        </Label>
      </g>
    </>
  );
}

const HOSTING_NODES: NodeSpec[] = [
  { id: "nginx", x: 16, y: 104, w: 160, label: "Nginx", sub: "TLS and routing", icon: "shield" },
  {
    id: "api",
    x: 250,
    y: 58,
    w: 200,
    label: "API",
    sub: "Stateless container",
    icon: "server",
    accent: true,
  },
  {
    id: "worker",
    x: 250,
    y: 150,
    w: 200,
    label: "Worker",
    sub: "Background jobs",
    icon: "refresh",
    accent: true,
  },
  { id: "postgres", x: 524, y: 58, w: 180, label: "Postgres", sub: "Managed", icon: "db" },
  { id: "redis", x: 524, y: 150, w: 180, label: "Redis", sub: "Managed", icon: "bolt" },
];

function Hosting() {
  return (
    <>
      <g data-d="fade">
        <rect
          x={226}
          y={16}
          width={248}
          height={214}
          rx={16}
          strokeWidth={1.5}
          strokeDasharray="5 5"
          className="stroke-line-strong"
        />
        <Label x={350} y={40.5} anchor="middle" size={10}>
          One host
        </Label>
      </g>
      <Graph
        nodes={HOSTING_NODES}
        links={[
          { from: "nginx", to: "api" },
          { from: "api", to: "postgres" },
          { from: "api", to: "redis", dashed: true, fromY: 98, toY: 166 },
          { from: "worker", to: "redis", fromY: 190, toY: 190 },
        ]}
      />
    </>
  );
}

const PLAN_ROWS = [0, 1, 2, 3, 4, 5];

const PLANS = [
  { x: 16, when: "Before", how: "Seq scan + sort", note: "Reads every row, then sorts" },
  { x: 370, when: "After", how: "Composite index", note: "Reads only the 20 rows it returns" },
];

function QueryPlan() {
  return (
    <>
      {PLANS.map(({ x, when, how, note }, plan) => (
        <g key={when}>
          <g data-d="node">
            <rect
              x={x}
              y={16}
              width={334}
              height={242}
              rx={12}
              strokeWidth={1.5}
              className={PANEL}
            />
            <Label x={x + 16} y={39.5} size={10}>
              {when}
            </Label>
            <Label x={x + 318} y={39.5} anchor="end" size={10}>
              {how}
            </Label>
            <path d={`M${x} 56 H${x + 334}`} strokeWidth={1.5} className="stroke-line-strong" />
            <Sub x={x + 16} y={242}>
              {note}
            </Sub>
          </g>
          {PLAN_ROWS.map((row) => {
            const hit = plan === 0 || row < 2;
            const y = 72 + row * 26;
            return hit ? (
              <rect
                key={row}
                data-d="bar"
                x={x + 16}
                y={y}
                width={302}
                height={18}
                rx={5}
                stroke="none"
                {...(plan === 0
                  ? { fill: "currentColor", fillOpacity: 0.18 }
                  : { className: "fill-accent" })}
              />
            ) : (
              <rect
                key={row}
                data-d="fade"
                x={x + 16.75}
                y={y + 0.75}
                width={300.5}
                height={16.5}
                rx={4.25}
                strokeWidth={1.5}
                strokeDasharray="5 5"
                opacity={0.35}
              />
            );
          })}
        </g>
      ))}
      <rect
        data-d-sweep="130"
        x={32.75}
        y={72.75}
        width={300.5}
        height={16.5}
        rx={4.25}
        opacity={0}
        strokeWidth={1.5}
        className="fill-accent/40 stroke-accent"
      />
    </>
  );
}

const REQUESTS = [
  { name: "HTML", x: 150, w: 80 },
  { name: "CSS and fonts", x: 230, w: 90 },
  { name: "Hero image", x: 244, w: 196 },
  { name: "JavaScript", x: 320, w: 260 },
];

function Waterfall() {
  return (
    <>
      {REQUESTS.map(({ name, x, w }, i) => {
        const y = 24 + i * 40;
        return (
          <g key={name}>
            <rect
              x={150}
              y={y}
              width={554}
              height={26}
              rx={7}
              fill="currentColor"
              fillOpacity={0.05}
              stroke="none"
            />
            <g data-d="fade">
              <Label x={16} y={y + 16.5} size={10}>
                {name}
              </Label>
            </g>
            <rect
              data-d="bar"
              x={x + 0.75}
              y={y + 0.75}
              width={w - 1.5}
              height={24.5}
              rx={6.25}
              strokeWidth={1.5}
              className={name === "Hero image" ? "fill-accent stroke-accent" : PANEL}
            />
          </g>
        );
      })}
      <g data-d="fade">
        <Sub x={452} y={120.5}>
          fetchPriority high
        </Sub>
      </g>
      <path
        data-d="fade"
        d="M440 16 V190"
        strokeWidth={1.5}
        strokeDasharray="5 5"
        className="stroke-accent motion-safe:animate-dash-flow"
      />
      <Wire d="M150 190 H704">
        <ArrowHead x={704} y={190} />
      </Wire>
      <g data-d="fade" className="text-faded-black">
        <rect
          x={414}
          y={198}
          width={52}
          height={22}
          rx={11}
          stroke="none"
          className="fill-accent"
        />
        <Label x={440} y={212.5} anchor="middle" size={10}>
          LCP
        </Label>
      </g>
      <g data-d="fade">
        <Label x={704} y={212.5} anchor="end" size={10}>
          Time
        </Label>
        <Sub x={150} y={242}>
          The line moves only when the hero image starts or finishes sooner.
        </Sub>
      </g>
    </>
  );
}

const SIGNAL_NODES: NodeSpec[] = [
  {
    id: "request",
    x: 16,
    y: 96,
    w: 266,
    label: "Request ID",
    sub: "7f3a9c2e-4b1d-4e8a-9f6b-2c5d8e1a0b37",
    icon: "monitor",
    accent: true,
  },
  {
    id: "metrics",
    x: 354,
    y: 16,
    w: 350,
    label: "Metrics",
    sub: "Is something wrong, and since when?",
    icon: "chart",
  },
  {
    id: "traces",
    x: 354,
    y: 96,
    w: 350,
    label: "Traces",
    sub: "Where did the time go?",
    icon: "route",
  },
  {
    id: "logs",
    x: 354,
    y: 176,
    w: 350,
    label: "Logs",
    sub: "What exactly happened?",
    icon: "list",
  },
];

function Signals() {
  return (
    <Graph
      nodes={SIGNAL_NODES}
      links={[
        { from: "request", to: "metrics", dashed: true, fromY: 112 },
        { from: "request", to: "traces", dashed: true },
        { from: "request", to: "logs", dashed: true, fromY: 136 },
      ]}
    />
  );
}

const SYNC_NODES: NodeSpec[] = [
  { id: "request", x: 16, y: 36, w: 148, label: "Request", icon: "monitor" },
  { id: "billing", x: 196, y: 36, w: 148, label: "Billing", icon: "card" },
  { id: "email", x: 376, y: 36, w: 148, label: "Email", icon: "mail" },
  { id: "vendor", x: 556, y: 36, w: 148, label: "Vendor", icon: "globe" },
];

const OUTBOX_NODES: NodeSpec[] = [
  { id: "request", x: 16, y: 168, w: 130, label: "Request", icon: "monitor" },
  {
    id: "commit",
    x: 174,
    y: 168,
    w: 220,
    label: "Deal + outbox row",
    sub: "One transaction",
    icon: "db",
    accent: true,
  },
  { id: "worker", x: 422, y: 168, w: 128, label: "Worker", sub: "Retries", icon: "refresh" },
  { id: "vendor", x: 578, y: 168, w: 126, label: "Vendor", icon: "globe" },
];

function OutboxFlow() {
  return (
    <>
      <g data-d="fade">
        <Label x={16} y={23} size={10}>
          Synchronous
        </Label>
      </g>
      <Graph
        nodes={SYNC_NODES}
        links={[
          { from: "request", to: "billing" },
          { from: "billing", to: "email" },
          { from: "email", to: "vendor" },
        ]}
      />
      <g data-d="fade">
        <Sub x={16} y={114}>
          The user waits for all three, and fails if any one of them does.
        </Sub>
        <Label x={16} y={155} size={10}>
          With an outbox
        </Label>
      </g>
      <Graph
        nodes={OUTBOX_NODES}
        links={[
          { from: "request", to: "commit" },
          { from: "commit", to: "worker", dashed: true },
          { from: "worker", to: "vendor", dashed: true },
        ]}
      />
      <g data-d="fade">
        <Sub x={16} y={246}>
          The request returns after one commit. Delivery happens afterwards and can be retried.
        </Sub>
      </g>
    </>
  );
}

const DECISIONS = [
  { x: 40, name: "Handler", note: "Rewrite in an afternoon", h: 40 },
  { x: 210, name: "Module", note: "Move behind an interface", h: 76 },
  { x: 380, name: "Public API", note: "Deprecate, then remove", h: 112 },
  { x: 550, name: "Schema", note: "Every query depends on it", h: 148 },
];

function Reversal() {
  return (
    <>
      <g data-d="fade">
        <Label x={16} y={23} size={10}>
          Cost of undoing a decision
        </Label>
        <path d="M16 37.5 H41" strokeWidth={1.5} strokeDasharray="5 5" className="stroke-accent" />
        <Label x={49} y={41} size={10}>
          Review effort follows
        </Label>
      </g>
      {DECISIONS.map(({ x, name, note, h }) => (
        <g key={name}>
          <Bar
            x={x}
            w={130}
            h={h}
            axis={208}
            r={8}
            className={name === "Schema" ? "fill-accent stroke-accent" : PANEL}
          />
          <g data-d="fade">
            <Label x={x + 65} y={230} anchor="middle" size={10}>
              {name}
            </Label>
            <Sub x={x + 65} y={245} anchor="middle">
              {note}
            </Sub>
          </g>
        </g>
      ))}
      <path d="M16 208 H704" strokeWidth={1.5} className="stroke-line-strong" />
      <path
        data-d="fade"
        d="M40 153.8 L680 18.2"
        strokeWidth={1.5}
        strokeDasharray="5 5"
        className="stroke-accent motion-safe:animate-dash-flow"
      />
    </>
  );
}

const diagrams: Record<PostDiagramName, { height: number; Art: () => ReactNode }> = {
  spectrum: { height: 238, Art: Spectrum },
  gates: { height: 172, Art: Gates },
  migration: { height: 258, Art: Migration },
  layers: { height: 319, Art: Layers },
  hosting: { height: 246, Art: Hosting },
  queryPlan: { height: 274, Art: QueryPlan },
  waterfall: { height: 258, Art: Waterfall },
  signals: { height: 248, Art: Signals },
  outboxFlow: { height: 262, Art: OutboxFlow },
  reversal: { height: 261, Art: Reversal },
};

type PostDiagramArtProps = {
  name: PostDiagramName;
  /** Says what the drawing shows, for readers who cannot see it. */
  alt: string;
  className?: string;
};

export function PostDiagramArt({ name, alt, className }: PostDiagramArtProps) {
  const grid = useId();
  const { height, Art } = diagrams[name];

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
      <Art />
    </svg>
  );
}
