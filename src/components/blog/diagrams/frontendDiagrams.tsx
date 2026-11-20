import { Label } from "@/components/article/ArtParts";
import {
  Chip,
  DownHead,
  Graph,
  Joint,
  Note,
  PANEL,
  PANEL_ACCENT,
  Panel,
  Remark,
  Sub,
  UpHead,
  Wire,
  Zone,
  type DiagramArt,
  type NodeSpec,
} from "@/components/article/DiagramParts";
import type { PostDiagramName } from "@/data/posts";
import { cn } from "@/lib/cn";

const TREE_NODES: NodeSpec[] = [
  { id: "page", x: 260, y: 16, w: 200, label: "Page", sub: "Server · static", icon: "layout" },
  { id: "header", x: 16, y: 116, w: 200, label: "Header", sub: "Server · static", icon: "layout" },
  {
    id: "products",
    x: 260,
    y: 116,
    w: 200,
    label: "Products",
    sub: "Server · use cache",
    icon: "box",
  },
  {
    id: "reviews",
    x: 504,
    y: 116,
    w: 200,
    label: "Reviews",
    sub: "Server · streamed",
    icon: "list",
  },
  {
    id: "search",
    x: 16,
    y: 216,
    w: 200,
    label: "Search box",
    sub: "Client · input state",
    icon: "monitor",
    accent: true,
  },
  {
    id: "cart",
    x: 260,
    y: 216,
    w: 200,
    label: "Add to cart",
    sub: "Client · click handler",
    icon: "card",
    accent: true,
  },
  {
    id: "form",
    x: 504,
    y: 216,
    w: 200,
    label: "Review form",
    sub: "Client · form state",
    icon: "doc",
    accent: true,
  },
];

function ServerTree() {
  return (
    <>
      <Graph
        nodes={TREE_NODES}
        links={[
          { from: "page", to: "header", fromX: 320 },
          { from: "page", to: "products" },
          { from: "page", to: "reviews", down: true, fromX: 400 },
          { from: "header", to: "search" },
          { from: "products", to: "cart" },
          { from: "reviews", to: "form" },
        ]}
      />
      <g data-d="fade">
        <rect
          x={16}
          y={292}
          width={14}
          height={14}
          rx={4}
          strokeWidth={1.5}
          className={PANEL_ACCENT}
        />
        <Sub x={38} y={303}>
          Client component: ships JavaScript and hydrates
        </Sub>
        <rect x={372} y={292} width={14} height={14} rx={4} strokeWidth={1.5} className={PANEL} />
        <Sub x={394} y={303}>
          Server component: HTML only, no JavaScript
        </Sub>
      </g>
    </>
  );
}

/** Pixels per millisecond on the streaming timeline. */
const MS = 1.3;

const TIMELINE_START = 170;

function at(ms: number) {
  return TIMELINE_START + ms * MS;
}

const STREAMS = [
  {
    name: "Static shell",
    from: 0,
    to: 60,
    tone: "accent",
    note: "Layout, header, cached products",
    inside: false,
  },
  {
    name: "Fallbacks",
    from: 60,
    to: 380,
    tone: "wait",
    note: "Skeletons hold the space until each hole fills",
    inside: true,
  },
  {
    name: "Personal price",
    from: 120,
    to: 210,
    tone: "plain",
    note: "Reads cookies",
    inside: false,
  },
  { name: "Reviews", from: 120, to: 380, tone: "plain", note: "Slow query, last in", inside: true },
  {
    name: "Hydration",
    from: 90,
    to: 240,
    tone: "plain",
    note: "Client leaves only",
    inside: false,
  },
] as const;

const STREAM_TONES = {
  accent: "fill-accent stroke-accent",
  plain: PANEL,
  wait: "stroke-line-strong",
} as const;

const TICKS = [0, 100, 200, 300, 400];

function StreamingShell() {
  return (
    <>
      {STREAMS.map(({ name, from, to, tone, note, inside }, i) => {
        const y = 24 + i * 38;
        const x1 = at(from);
        const x2 = at(to);
        return (
          <g key={name}>
            <Note x={16} y={y + 16}>
              {name}
            </Note>
            <rect
              x={TIMELINE_START}
              y={y}
              width={at(400) - TIMELINE_START}
              height={24}
              rx={7}
              fill="currentColor"
              fillOpacity={0.05}
              stroke="none"
            />
            <rect
              data-d="bar"
              x={x1}
              y={y}
              width={x2 - x1}
              height={24}
              rx={7}
              strokeWidth={1.5}
              {...(tone === "wait" && { strokeDasharray: "5 5" })}
              className={STREAM_TONES[tone]}
            />
            <Remark x={inside ? x1 + 10 : x2 + 8} y={y + 16}>
              {note}
            </Remark>
          </g>
        );
      })}
      <path
        d={`M${TIMELINE_START} 218 H${at(400)}`}
        strokeWidth={1.5}
        className="stroke-line-strong"
      />
      {TICKS.map((tick) => (
        <Remark key={tick} x={at(tick)} y={236} anchor="middle">
          {`${tick} ms`}
        </Remark>
      ))}
      <path
        data-d="fade"
        d={`M${at(60)} 16 V218`}
        strokeWidth={1.5}
        strokeDasharray="5 5"
        className="stroke-accent motion-safe:animate-dash-flow"
      />
      <Chip x={at(60) - 52} y={248} w={104} label="Shell painted" tone="accent" />
      <Remark x={at(400)} y={264} anchor="end">
        Illustrative timings
      </Remark>
    </>
  );
}

const SEGMENTS = [
  { x1: 60, x2: 250, label: "Someone else’s long task", tone: PANEL },
  { x1: 250, x2: 420, label: "Your event handlers", tone: "fill-accent stroke-accent" },
  { x1: 420, x2: 510, label: "Style, layout, paint", tone: PANEL },
];

const PHASE_BRACKETS = [
  { x1: 110, x2: 250, label: "Input delay" },
  { x1: 250, x2: 420, label: "Processing" },
  { x1: 420, x2: 510, label: "Presentation" },
];

function InpAnatomy() {
  return (
    <>
      <Note x={16} y={84}>
        Main thread
      </Note>
      <rect
        x={40}
        y={92}
        width={640}
        height={40}
        rx={10}
        fill="currentColor"
        fillOpacity={0.05}
        stroke="none"
      />
      {SEGMENTS.map(({ x1, x2, label, tone }) => (
        <g key={label} data-d="bar" className={cn(tone !== PANEL && "text-faded-black")}>
          <rect
            x={x1}
            y={92}
            width={x2 - x1}
            height={40}
            rx={8}
            strokeWidth={1.5}
            className={tone}
          />
          <Sub x={x1 + 10} y={116}>
            {label}
          </Sub>
        </g>
      ))}
      <Chip x={80} y={22} w={60} label="Click" tone="accent" />
      <Wire d="M110 46 V88">
        <DownHead x={110} y={90} />
      </Wire>
      <Chip x={462} y={22} w={96} label="Next paint" />
      <Wire d="M510 46 V88">
        <DownHead x={510} y={90} />
      </Wire>
      {PHASE_BRACKETS.map(({ x1, x2, label }) => (
        <g key={label} data-d="fade">
          <path d={`M${x1 + 2} 146 v8 H${x2 - 2} v-8`} strokeWidth={1.5} />
          <Label x={(x1 + x2) / 2} y={176} anchor="middle" size={9}>
            {label}
          </Label>
        </g>
      ))}
      <path data-d="draw" d="M112 196 v8 H508 v-8" strokeWidth={2} className="stroke-accent" />
      <Note x={310} y={232} anchor="middle">
        INP: click to next paint, for the slowest interactions
      </Note>
      <Remark x={310} y={254} anchor="middle">
        Good means 200 ms or less for at least 75% of visits.
      </Remark>
    </>
  );
}

const CHUNK = 44;

const CHUNK_GAP = 8;

const LATER_CHUNKS = Array.from({ length: 7 }, (_, j) => 326 + j * (CHUNK + CHUNK_GAP));

function YieldChunks() {
  return (
    <>
      <Note x={16} y={62}>
        One long task
      </Note>
      <rect
        data-d="bar"
        x={170}
        y={40}
        width={430}
        height={34}
        rx={8}
        strokeWidth={1.5}
        className={PANEL}
      />
      <Remark x={182} y={61}>
        Renders 2,000 rows in one go
      </Remark>
      <rect
        data-d="bar"
        x={600}
        y={40}
        width={50}
        height={34}
        rx={8}
        strokeWidth={1.5}
        className="fill-accent stroke-accent"
      />
      <Chip x={232} y={8} w={56} label="Click" tone="accent" />
      <path data-d="fade" d="M260 32 V40" strokeWidth={1.5} />
      <rect
        data-d="bar"
        x={260}
        y={82}
        width={340}
        height={18}
        rx={5}
        strokeWidth={1.5}
        strokeDasharray="5 5"
        className="fill-red/15 stroke-red"
      />
      <Remark x={270} y={95}>
        The click waits for the whole task
      </Remark>

      <Note x={16} y={172}>
        Yielding chunks
      </Note>
      {[170, 222].map((x) => (
        <rect
          key={x}
          data-d="bar"
          x={x}
          y={150}
          width={CHUNK}
          height={34}
          rx={8}
          strokeWidth={1.5}
          className={PANEL}
        />
      ))}
      <rect
        data-d="bar"
        x={274}
        y={150}
        width={CHUNK}
        height={34}
        rx={8}
        strokeWidth={1.5}
        className="fill-accent stroke-accent"
      />
      {LATER_CHUNKS.map((x) => (
        <rect
          key={x}
          data-d="bar"
          x={x}
          y={150}
          width={CHUNK}
          height={34}
          rx={8}
          strokeWidth={1.5}
          className={PANEL}
        />
      ))}
      <Chip x={232} y={118} w={56} label="Click" tone="accent" />
      <path data-d="fade" d="M260 142 V150" strokeWidth={1.5} />
      <Remark x={274} y={202}>
        Handled after one chunk
      </Remark>
      <Note x={16} y={232}>
        Same work, same total time. The click no longer waits for all of it.
      </Note>
      <Remark x={16} y={252}>
        Between chunks, await scheduler.yield() lets the browser run pending input first.
      </Remark>
    </>
  );
}

const SHELL_NODE: NodeSpec[] = [
  {
    id: "shell",
    x: 260,
    y: 28,
    w: 200,
    label: "App shell",
    sub: "Composes features",
    icon: "layout",
  },
];

const FEATURE_NODES: NodeSpec[] = [
  { id: "deals", x: 32, y: 166, w: 200, label: "Deals", sub: "Owner: Growth", icon: "box" },
  { id: "billing", x: 260, y: 166, w: 200, label: "Billing", sub: "Owner: Payments", icon: "card" },
  {
    id: "reports",
    x: 488,
    y: 166,
    w: 200,
    label: "Reports",
    sub: "Owner: Insights",
    icon: "chart",
  },
];

const UI_NODES: NodeSpec[] = [
  {
    id: "tokens",
    x: 32,
    y: 322,
    w: 200,
    label: "Tokens",
    sub: "Colour, space, type",
    icon: "layers",
  },
  {
    id: "primitives",
    x: 260,
    y: 322,
    w: 200,
    label: "Primitives",
    sub: "Button, Dialog",
    icon: "box",
    accent: true,
  },
  {
    id: "patterns",
    x: 488,
    y: 322,
    w: 200,
    label: "Patterns",
    sub: "Forms, tables",
    icon: "layout",
  },
];

function ModuleBoundaries() {
  return (
    <>
      <Zone x={16} y={16} w={688} h={84} label="apps/web" meta="Routes, layout" />
      <Zone x={16} y={128} w={688} h={140} label="packages/features" />
      <Zone x={16} y={292} w={688} h={100} label="packages/ui · design system" />
      <Graph
        nodes={[...SHELL_NODE, ...FEATURE_NODES, ...UI_NODES]}
        links={[
          { from: "shell", to: "deals", fromX: 320 },
          { from: "shell", to: "billing" },
          { from: "shell", to: "reports", down: true, fromX: 400 },
          { from: "deals", to: "primitives", down: true, toX: 320 },
          { from: "billing", to: "primitives", fromX: 380, toX: 380 },
          { from: "reports", to: "patterns" },
          { from: "tokens", to: "primitives" },
          { from: "primitives", to: "patterns" },
        ]}
      />
      {FEATURE_NODES.map(({ id, x }) => (
        <Chip key={id} x={x + 112} y={154} w={76} label="index.ts" tone="accent" />
      ))}
      <Wire d="M160 222 C160 252 300 252 300 226" dashed className="stroke-red text-red">
        <UpHead x={300} y={224} />
      </Wire>
      <path
        data-d="fade"
        d="M224 238 l10 10 M234 238 l-10 10"
        strokeWidth={2}
        className="stroke-red"
      />
      <Remark x={396} y={254}>
        Deep imports into another feature fail lint
      </Remark>
    </>
  );
}

const TOKEN_COLUMNS = [
  {
    x: 16,
    title: "Primitive",
    meta: "Raw values",
    rows: ["orange.500", "sand.50", "ink.900"],
  },
  {
    x: 255,
    title: "Semantic",
    meta: "Meaning",
    rows: ["accent", "surface", "text"],
  },
  {
    x: 494,
    title: "Component",
    meta: "One use",
    rows: ["button.bg", "card.bg", "body.text"],
  },
];

const SWATCHES = ["fill-orange", "fill-manila-light", "fill-faded-black"];

const THEMES = [
  { x: 239, label: "Light" },
  { x: 312, label: "Dark" },
  { x: 385, label: "Brand B" },
];

function TokenLayers() {
  return (
    <>
      {TOKEN_COLUMNS.map(({ x, title, meta, rows }, column) => (
        <g key={title}>
          <Panel x={x} y={16} w={210} h={176} title={title} meta={meta} accent={column === 1} />
          {rows.map((row, i) => {
            const y = 72 + i * 36;
            return (
              <g key={row} data-d="bar">
                <rect
                  x={x + 16}
                  y={y}
                  width={178}
                  height={26}
                  rx={8}
                  strokeWidth={1.5}
                  className={PANEL}
                />
                <circle
                  cx={x + 32}
                  cy={y + 13}
                  r={6}
                  strokeWidth={1.5}
                  className={cn(SWATCHES[i], "stroke-line-strong")}
                />
                <Sub x={x + 46} y={y + 17}>
                  {row}
                </Sub>
              </g>
            );
          })}
          {column > 0 &&
            rows.map((row, i) => {
              const y = 72 + i * 36 + 13;
              return <Joint key={row} x1={x - 29} y1={y} x2={x} y2={y} />;
            })}
        </g>
      ))}
      <Note x={16} y={252}>
        Themes
      </Note>
      {THEMES.map(({ x, label }) => (
        <g key={label}>
          <Chip x={x} y={236} w={64} label={label} />
          <Wire d={`M${x + 32} 236 C${x + 32} 214 360 216 360 198`} dashed>
            <UpHead x={360} y={196} />
          </Wire>
        </g>
      ))}
      <Remark x={16} y={292}>
        Components never name a raw colour. A theme remaps the middle column and nothing else.
      </Remark>
      <Remark x={16} y={312}>
        Dark mode or a second brand costs one file, not a sweep through every component.
      </Remark>
    </>
  );
}

export const frontendDiagrams = {
  serverTree: { height: 316, Art: ServerTree },
  streamingShell: { height: 278, Art: StreamingShell },
  inpAnatomy: { height: 270, Art: InpAnatomy },
  yieldChunks: { height: 264, Art: YieldChunks },
  moduleBoundaries: { height: 404, Art: ModuleBoundaries },
  tokenLayers: { height: 326, Art: TokenLayers },
} satisfies Partial<Record<PostDiagramName, DiagramArt>>;
