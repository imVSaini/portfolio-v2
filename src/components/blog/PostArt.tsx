import type { CSSProperties, ReactNode } from "react";

import { ArrowHead, barPath, Label } from "@/components/blog/PostArtParts";
import type { PostArtName } from "@/data/posts";
import { cn } from "@/lib/cn";

/** Staggers a growing shape behind the ones before it. */
function delay(index: number) {
  return { animationDelay: `${index * 0.1}s` };
}

const TRAVEL_START = 8;

const TRAVEL_STOP = 18;

/** Dashed connector with a dot that runs along it while the card is hovered or focused. */
function Flow({ d, dashes }: { d: string; dashes: number }) {
  const length = dashes * 10 - 5;
  const travel = {
    offsetPath: `path("${d}")`,
    "--travel-from": `${((TRAVEL_START / length) * 100).toFixed(2)}%`,
    "--travel-to": `${((1 - TRAVEL_STOP / length) * 100).toFixed(2)}%`,
  } as CSSProperties;

  return (
    <>
      <path d={d} strokeDasharray="5 5" pathLength={length} />
      <circle data-travel="" r={4} fill="currentColor" stroke="none" opacity={0} style={travel} />
    </>
  );
}

function Tradeoffs() {
  return (
    <>
      <path d="M320 60 V264 M250 264 H390" />
      <path d="M150 103 L490 73" />
      <circle cx={320} cy={88} r={6} fill="currentColor" stroke="none" />
      <path d="M150 103 L100 193 M150 103 L200 193" strokeDasharray="5 5" pathLength={210} />
      <path d="M92 193 A58 26 0 0 0 208 193 Z" />
      <rect x={128} y={163} width={44} height={30} rx={4} />
      <Label x={150} y={252} anchor="middle" size={12}>
        Simplicity
      </Label>
      <path d="M490 73 L440 163 M490 73 L540 163" strokeDasharray="5 5" pathLength={210} />
      <path d="M432 163 A58 26 0 0 0 548 163 Z" />
      <circle cx={468} cy={155} r={8} />
      <circle cx={490} cy={155} r={8} />
      <circle cx={512} cy={155} r={8} />
      <Label x={490} y={222} anchor="middle" size={12}>
        Scale
      </Label>
      <Label x={320} y={300} anchor="middle" size={12}>
        Constraints
      </Label>
    </>
  );
}

const NODES = [
  { x: 60, name: "Node 1", pods: 3, port: 270 },
  { x: 240, name: "Node 2", pods: 2, port: 320 },
  { x: 420, name: "Node 3", pods: 1, port: 370 },
];

function Cluster() {
  return (
    <>
      <rect x={220} y={55} width={200} height={50} rx={8} />
      <Label x={320} y={84} anchor="middle" size={12}>
        Control plane
      </Label>
      {NODES.map(({ x, name, pods, port }, node) => (
        <g key={name}>
          <Flow
            d={`M${port} 105 C${port} 137 ${x + 80} 137 ${x + 80} 169`}
            dashes={port === x + 80 ? 7 : 16}
          />
          <rect x={x} y={169} width={160} height={104} rx={8} />
          {Array.from({ length: pods }, (_, i) => (
            <rect
              key={i}
              x={x + 16 + i * 46}
              y={185}
              width={36}
              height={36}
              rx={6}
              {...(i === 0 && {
                "data-grow": "y",
                style: delay(node),
                fill: "currentColor",
                stroke: "none",
                opacity: 0.85,
              })}
            />
          ))}
          <Label x={x + 80} y={251} anchor="middle" size={12}>
            {name}
          </Label>
        </g>
      ))}
      <Label x={320} y={304} anchor="middle" size={11}>
        Or one server
      </Label>
    </>
  );
}

const VITALS = [
  { y: 78, name: "LCP", fill: 190 },
  { y: 148, name: "INP", fill: 120 },
  { y: 218, name: "CLS", fill: 70 },
];

function Vitals() {
  return (
    <>
      {VITALS.map(({ y, name, fill }, i) => (
        <g key={name}>
          <Label x={75} y={y + 20.5}>
            {name}
          </Label>
          <rect x={145} y={y} width={420} height={32} rx={16} />
          <rect
            data-grow="x"
            style={delay(i)}
            x={145}
            y={y}
            width={fill}
            height={32}
            rx={16}
            fill="currentColor"
            stroke="none"
            opacity={0.85}
          />
        </g>
      ))}
      <path d="M405 60 V268" strokeDasharray="5 5" pathLength={205} />
      <Label x={405} y={300} anchor="middle" size={11}>
        Good
      </Label>
    </>
  );
}

const REQUESTS = [
  { y: 88, name: "Request" },
  { y: 144, name: "Retry" },
  { y: 200, name: "Burst" },
];

const GATES = [
  { y: 90, name: "Rate limit" },
  { y: 146, name: "Idempotency" },
  { y: 202, name: "Timeout" },
];

function Gates() {
  return (
    <>
      {REQUESTS.map(({ y, name }, i) => (
        <g key={name}>
          <rect
            x={45}
            y={y}
            width={150}
            height={40}
            rx={20}
            {...(i === 1 && { strokeDasharray: "5 5" })}
          />
          <circle cx={65} cy={y + 20} r={4} fill="currentColor" stroke="none" />
          <Label x={81} y={y + 24} size={12}>
            {name}
          </Label>
        </g>
      ))}
      <Label x={120} y={272} anchor="middle" size={12}>
        Real traffic
      </Label>
      <Flow d="M195 164 H261" dashes={7} />
      <ArrowHead x={261} y={164} />
      {GATES.map(({ y, name }) => (
        <g key={name}>
          <rect x={269} y={y} width={156} height={36} rx={8} />
          <Label x={285} y={y + 22} size={12}>
            {name}
          </Label>
        </g>
      ))}
      <path d="M425 164 H491" />
      <ArrowHead x={491} y={164} />
      <rect x={499} y={116} width={96} height={42} rx={8} />
      <rect x={499} y={170} width={96} height={42} rx={8} />
      <circle cx={517} cy={137} r={4} fill="currentColor" stroke="none" />
      <circle cx={517} cy={191} r={4} fill="currentColor" stroke="none" />
      <path d="M533 137 H577 M533 191 H577" opacity={0.6} />
      <Label x={547} y={244} anchor="middle" size={12}>
        API
      </Label>
    </>
  );
}

const STAGES = [
  { x: 110, name: "Check" },
  { x: 250, name: "Build" },
  { x: 390, name: "Staging" },
  { x: 530, name: "Production" },
];

function Pipeline() {
  return (
    <>
      {STAGES.map(({ x, name }, i) => (
        <g key={name}>
          {i > 0 && <Flow d={`M${x - 108} 120 H${x - 32}`} dashes={8} />}
          <circle cx={x} cy={120} r={32} />
          {i < 3 ? (
            <path d={`M${x - 12} 120 l9 9 l16 -19`} />
          ) : (
            <circle cx={x} cy={120} r={9} fill="currentColor" stroke="none" />
          )}
          <Label x={x} y={184} anchor="middle" size={12}>
            {name}
          </Label>
        </g>
      ))}
      <Flow d="M530 208 C530 262 390 262 390 208" dashes={18} />
      <path d="M383 217 L390 208 L397 217" />
      <Label x={460} y={273} anchor="middle" size={11}>
        Rollback
      </Label>
      <rect x={78} y={208} width={150} height={40} rx={8} />
      <path d="M94 228 H152" opacity={0.6} />
      <circle cx={208} cy={228} r={4} fill="currentColor" stroke="none" />
      <Label x={153} y={273} anchor="middle" size={11}>
        One image
      </Label>
    </>
  );
}

const FEATURES = [
  { x: 60, name: "Deals" },
  { x: 240, name: "Billing" },
  { x: 420, name: "Reports" },
];

function Layers() {
  return (
    <>
      <rect x={200} y={52} width={240} height={48} rx={8} />
      <Label x={320} y={80} anchor="middle" size={12}>
        App
      </Label>
      <path d="M320 100 V128 M140 128 H500 M140 128 V156 M320 128 V156 M500 128 V156" />
      {FEATURES.map(({ x, name }) => (
        <g key={name}>
          <rect x={x} y={156} width={160} height={48} rx={8} />
          <circle cx={x + 146} cy={170} r={4} fill="currentColor" stroke="none" />
          <Label x={x + 80} y={184} anchor="middle" size={12}>
            {name}
          </Label>
          <Flow d={`M${x + 80} 204 V260`} dashes={6} />
        </g>
      ))}
      <rect x={60} y={260} width={520} height={48} rx={8} />
      <Label x={320} y={288} anchor="middle" size={12}>
        Shared UI
      </Label>
    </>
  );
}

const TABLE_ROWS = [0, 1, 2, 3, 4];

function QueryPlan() {
  return (
    <>
      <ellipse cx={131} cy={85} rx={52} ry={15} />
      <path d="M79 85 V243 A52 15 0 0 0 183 243 V85" />
      <path d="M79 138 A52 15 0 0 0 183 138 M79 190 A52 15 0 0 0 183 190" opacity={0.5} />
      <Label x={131} y={290} anchor="middle" size={12}>
        Postgres
      </Label>
      <Flow d="M195 164 H285" dashes={10} />
      <ArrowHead x={285} y={164} />
      {TABLE_ROWS.map((row) => (
        <rect
          key={row}
          data-grow="x"
          style={delay(row)}
          x={297}
          y={70 + row * 40}
          width={264}
          height={28}
          rx={6}
          {...(row === 1 || row === 2
            ? { fill: "currentColor", stroke: "none", opacity: 0.85 }
            : { opacity: 0.6 })}
        />
      ))}
      <Label x={429} y={290} anchor="middle" size={12}>
        Index scan
      </Label>
    </>
  );
}

function Signals() {
  return (
    <>
      <Label x={70} y={84} size={12}>
        Metrics
      </Label>
      <path d="M210 107 L250 93 L290 101 L330 67 L370 89 L410 53 L450 81 L490 75 L570 93" />
      <Label x={70} y={176} size={12}>
        Traces
      </Label>
      <rect data-grow="x" x={210} y={143} width={230} height={14} rx={7} />
      <rect
        data-grow="x"
        style={delay(1)}
        x={260}
        y={165}
        width={120}
        height={14}
        rx={7}
        fill="currentColor"
        stroke="none"
        opacity={0.85}
      />
      <rect data-grow="x" style={delay(2)} x={390} y={187} width={150} height={14} rx={7} />
      <Label x={70} y={268} size={12}>
        Logs
      </Label>
      <path d="M210 248 H530 M210 264 H470 M210 280 H510" opacity={0.6} />
      <path d="M410 37 V296" strokeDasharray="5 5" pathLength={255} />
      <Label x={410} y={321} anchor="middle" size={11}>
        Request ID
      </Label>
    </>
  );
}

const EVENT_CELLS = [0, 1, 2, 3, 4];

const CONSUMERS = [
  { y: 70, name: "Billing", port: 168 },
  { y: 158, name: "Email", port: 180 },
  { y: 246, name: "Vendor", port: 192 },
];

function Events() {
  return (
    <>
      <rect x={45} y={140} width={124} height={80} rx={8} />
      <path d="M63 169 H139 M63 191 H121" opacity={0.6} />
      <Label x={107} y={252} anchor="middle" size={12}>
        Producer
      </Label>
      <path d="M169 180 H217" />
      <ArrowHead x={217} y={180} />
      {EVENT_CELLS.map((cell) => (
        <rect
          key={cell}
          data-grow="y"
          style={delay(cell)}
          x={225 + cell * 36}
          y={158}
          width={30}
          height={44}
          rx={6}
          {...(cell < 3 && { fill: "currentColor", stroke: "none", opacity: 0.85 })}
        />
      ))}
      <Label x={312} y={234} anchor="middle" size={12}>
        Events
      </Label>
      {CONSUMERS.map(({ y, name, port }) => (
        <g key={name}>
          <Flow
            d={`M399 ${port} C432 ${port} 432 ${y + 22} 465 ${y + 22} H477`}
            dashes={port === y + 22 ? 8 : 12}
          />
          <ArrowHead x={477} y={y + 22} />
          <rect x={485} y={y} width={110} height={44} rx={8} />
          <Label x={540} y={y + 26} anchor="middle" size={12}>
            {name}
          </Label>
        </g>
      ))}
    </>
  );
}

const DEBT_BARS = [
  { x: 90, h: 20 },
  { x: 190, h: 34 },
  { x: 290, h: 58 },
  { x: 390, h: 98 },
  { x: 490, h: 156 },
];

function Debt() {
  return (
    <>
      {DEBT_BARS.map(({ x, h }, i) => (
        <path
          key={x}
          data-grow="y"
          style={delay(i)}
          d={barPath({ x, top: 270 - h, bottom: 269, w: 60, r: 6 })}
          strokeLinecap="butt"
          {...(i === 4 && { fill: "currentColor", stroke: "none", opacity: 0.85 })}
        />
      ))}
      <path d="M60 270 H580" />
      <Flow d="M90 232 C250 224 440 128 550 58" dashes={50} />
      <ArrowHead x={550} y={58} angle={-32.5} />
      <Label x={516} y={60} anchor="end" size={12}>
        Interest
      </Label>
      <Label x={320} y={306} anchor="middle" size={12}>
        Shortcuts over time
      </Label>
    </>
  );
}

/** Motion that plays while the surrounding card is hovered or focused. */
const hover = cn(
  "motion-safe:group-intent:**:[[stroke-dasharray]]:animate-dash-flow",
  "motion-safe:group-intent:**:data-travel:animate-travel",
  "**:data-grow:transform-fill **:data-[grow=x]:origin-left **:data-[grow=y]:origin-bottom",
  "motion-safe:group-intent:**:data-[grow=x]:animate-grow-x motion-safe:group-intent:**:data-[grow=y]:animate-grow-y",
);

const art: Record<PostArtName, () => ReactNode> = {
  tradeoffs: Tradeoffs,
  gates: Gates,
  pipeline: Pipeline,
  layers: Layers,
  cluster: Cluster,
  queryPlan: QueryPlan,
  vitals: Vitals,
  signals: Signals,
  events: Events,
  debt: Debt,
};

type PostArtProps = {
  name: PostArtName;
  className?: string;
};

export function PostArt({ name, className }: PostArtProps) {
  const Art = art[name];

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 640 360"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("size-full", hover, className)}
    >
      <Art />
    </svg>
  );
}
