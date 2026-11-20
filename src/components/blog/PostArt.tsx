import type { CSSProperties, ReactNode } from "react";

import { barPath, Label } from "@/components/article/ArtParts";
import type { PostArtName } from "@/data/posts";
import { cn } from "@/lib/cn";

/** Staggers a growing shape behind the ones before it. */
function delay(index: number) {
  return { animationDelay: `${index * 0.1}s` };
}

const TRAVEL_START = 8;

const TRAVEL_STOP = 18;

function Travel({ d, length, full = false }: { d: string; length: number; full?: boolean }) {
  const travel = {
    offsetPath: `path("${d}")`,
    "--travel-from": full ? "0%" : `${((TRAVEL_START / length) * 100).toFixed(2)}%`,
    "--travel-to": full ? "100%" : `${((1 - TRAVEL_STOP / length) * 100).toFixed(2)}%`,
  } as CSSProperties;

  return (
    <circle data-travel="" r={4} fill="currentColor" stroke="none" opacity={0} style={travel} />
  );
}

/** Dashed connector with a dot that runs along it while the card is hovered or focused. */
function Flow({ d, dashes }: { d: string; dashes: number }) {
  const length = dashes * 10 - 5;

  return (
    <>
      <path d={d} strokeDasharray="5 5" pathLength={length} />
      <Travel d={d} length={length} />
    </>
  );
}

type Point = { x: number; y: number };

function Head({ x, y, angle = 0 }: Point & { angle?: number }) {
  return (
    <path
      d={`M${x} ${y} L${x - 10} ${y - 6} L${x - 10} ${y + 6} Z`}
      fill="currentColor"
      strokeWidth={1.5}
      {...(angle !== 0 && { transform: `rotate(${angle} ${x} ${y})` })}
    />
  );
}

type ArrowProps = {
  d: string;
  length: number;
  from: Point;
  tip: Point;
  angle?: number;
  twoWay?: boolean;
};

function Arrow({ d, length, from, tip, angle = 0, twoWay = false }: ArrowProps) {
  return (
    <>
      <path d={d} opacity={0.6} />
      <Travel d={d} length={length} full />
      {twoWay ? (
        <Head x={from.x} y={from.y} angle={angle + 180} />
      ) : (
        <circle cx={from.x} cy={from.y} r={3.5} fill="currentColor" stroke="none" />
      )}
      <Head x={tip.x} y={tip.y} angle={angle} />
    </>
  );
}

const SURFACE = "fill-(--cover-bg)";

type PanelProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  r?: number;
  solid?: boolean;
  dashed?: boolean;
};

function Panel({ x, y, w, h, r = 10, solid = false, dashed = false }: PanelProps) {
  return (
    <>
      {!dashed && (
        <rect
          x={x + 6}
          y={y + 6}
          width={w}
          height={h}
          rx={r}
          fill="currentColor"
          stroke="none"
          opacity={0.14}
        />
      )}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={r}
        className={SURFACE}
        {...(solid ? { stroke: "none" } : dashed && { strokeDasharray: "5 5" })}
      />
      {solid && (
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          rx={r}
          fill="currentColor"
          stroke="none"
          opacity={0.85}
        />
      )}
    </>
  );
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const a = (deg * Math.PI) / 180;
  return {
    x: Math.round((cx + r * Math.cos(a)) * 10) / 10,
    y: Math.round((cy + r * Math.sin(a)) * 10) / 10,
  };
}

function sparkle(cx: number, cy: number, s: number) {
  return `M${cx} ${cy - s} Q${cx} ${cy} ${cx + s} ${cy} Q${cx} ${cy} ${cx} ${cy + s} Q${cx} ${cy} ${cx - s} ${cy} Q${cx} ${cy} ${cx} ${cy - s} Z`;
}

const CELLS = [
  { y: 52, name: "Cell A", failed: false, load: 54, d: "M172 162 C236 162 236 88 300 88" },
  { y: 140, name: "Cell B", failed: true, load: 0, d: "M172 180 C236 180 236 176 300 176" },
  { y: 228, name: "Cell C", failed: false, load: 38, d: "M172 198 C236 198 236 264 300 264" },
];

const ROUTES = ["A", "B", "C"];

function CellStack({ x, y }: { x: number; y: number }) {
  const cy = y + 36;
  const app = x + 150;
  const queue = x + 196;
  const db = x + 242;
  return (
    <>
      <rect x={app - 11} y={cy - 9} width={22} height={18} rx={3} />
      <path d={`M${app - 6} ${cy - 3} H${app + 6} M${app - 6} ${cy + 3} H${app + 2}`} />
      {[0, 1, 2].map((slot) => (
        <rect
          key={slot}
          x={queue - 11 + slot * 9}
          y={cy - 6}
          width={5}
          height={12}
          rx={1.5}
          {...(slot === 2 && { fill: "currentColor" })}
        />
      ))}
      <ellipse cx={db} cy={cy - 7} rx={10} ry={4} />
      <path d={`M${db - 10} ${cy - 7} V${cy + 7} A10 4 0 0 0 ${db + 10} ${cy + 7} V${cy - 7}`} />
    </>
  );
}

function Cells() {
  return (
    <>
      <Panel x={52} y={128} w={120} h={104} />
      <Label x={68} y={154} size={10}>
        Router
      </Label>
      {ROUTES.map((cell, i) => (
        <g key={cell} opacity={i === 1 ? 0.4 : 1}>
          <path d={`M68 ${176 + i * 20} H120`} opacity={0.5} />
          <Label x={156} y={180 + i * 20} anchor="end" size={9}>
            {cell}
          </Label>
        </g>
      ))}
      {CELLS.map(({ y, name, failed, load, d }, i) => (
        <g key={name}>
          <g opacity={failed ? 0.45 : 1}>
            <Flow d={d} dashes={failed ? 13 : 16} />
            <Panel x={300} y={y} w={280} h={72} dashed={failed} />
            <Label x={316} y={y + 30} size={10}>
              {name}
            </Label>
            <rect
              x={316}
              y={y + 48}
              width={96}
              height={8}
              rx={4}
              fill="currentColor"
              stroke="none"
              opacity={0.2}
            />
            {!failed && (
              <rect
                data-grow="x"
                style={delay(i)}
                x={316}
                y={y + 48}
                width={load}
                height={8}
                rx={4}
                fill="currentColor"
                stroke="none"
                opacity={0.85}
              />
            )}
            <CellStack x={300} y={y} />
          </g>
          {failed ? (
            <>
              <circle cx={564} cy={y + 16} r={9} className={SURFACE} />
              <path d={`M560 ${y + 12} l8 8 M568 ${y + 12} l-8 8`} />
            </>
          ) : (
            <circle cx={564} cy={y + 16} r={4} fill="currentColor" stroke="none" />
          )}
        </g>
      ))}
      <Label x={440} y={334} anchor="middle" size={11}>
        One cell fails alone
      </Label>
    </>
  );
}

const STEPS = [
  { name: "Charge card", state: "done" },
  { name: "Reserve stock", state: "done" },
  { name: "Ship order", state: "retry" },
  { name: "Send email", state: "pending" },
] as const;

const EVENTS = [160, 120, 170, 140, 150, 110];

function Journal() {
  return (
    <>
      <Panel x={52} y={52} w={230} h={256} />
      <Label x={72} y={80} size={10}>
        Workflow
      </Label>
      {STEPS.map(({ name, state }, i) => {
        const y = 112 + i * 52;
        return (
          <g key={name}>
            {i < 3 && (
              <path
                d={`M84 ${y + 10} V${y + 42}`}
                {...(i === 2 && { strokeDasharray: "5 5" })}
                opacity={0.6}
              />
            )}
            {state === "done" && (
              <g data-grow="y" style={delay(i)}>
                <circle cx={84} cy={y} r={10} className={SURFACE} stroke="none" />
                <circle cx={84} cy={y} r={10} fill="currentColor" stroke="none" opacity={0.85} />
                <path d={`M80 ${y} l3 3 l5 -6`} className="stroke-(--cover-bg)" />
              </g>
            )}
            {state === "retry" && (
              <>
                <circle cx={84} cy={y} r={10} className={SURFACE} />
                <circle cx={84} cy={y} r={4} fill="currentColor" stroke="none" />
                <rect
                  data-grow="x"
                  x={194}
                  y={y - 9}
                  width={60}
                  height={18}
                  rx={9}
                  fill="currentColor"
                  stroke="none"
                  opacity={0.85}
                />
                <g className="text-(--cover-bg)">
                  <Label x={224} y={y + 3.5} anchor="middle" size={8}>
                    Retry
                  </Label>
                </g>
              </>
            )}
            {state === "pending" && (
              <circle cx={84} cy={y} r={10} className={SURFACE} strokeDasharray="4 4" />
            )}
            <g opacity={state === "pending" ? 0.5 : 1}>
              <Label x={106} y={y + 4} size={9}>
                {name}
              </Label>
            </g>
          </g>
        );
      })}
      <Panel x={362} y={52} w={226} h={256} />
      <Label x={378} y={80} size={10}>
        Event history
      </Label>
      <path d="M362 94 H588" opacity={0.4} />
      {EVENTS.map((w, k) => {
        const y = 118 + k * 26;
        return (
          <g key={y}>
            <rect
              x={378}
              y={y - 5}
              width={10}
              height={10}
              rx={2}
              fill="currentColor"
              stroke="none"
              opacity={0.85}
            />
            <path d={`M398 ${y} H${398 + w}`} opacity={0.55} />
          </g>
        );
      })}
      <rect x={378} y={269} width={10} height={10} rx={2} />
      <path d="M398 274 H508" strokeDasharray="5 5" opacity={0.55} />
      <Arrow d="M290 112 H348" length={58} from={{ x: 290, y: 112 }} tip={{ x: 357, y: 112 }} />
      <Label x={324} y={102} anchor="middle" size={8}>
        Record
      </Label>
      <Arrow
        d="M357 216 H297"
        length={60}
        from={{ x: 357, y: 216 }}
        tip={{ x: 288, y: 216 }}
        angle={180}
      />
      <Label x={324} y={206} anchor="middle" size={8}>
        Replay
      </Label>
    </>
  );
}

const LOAD = [
  34, 38, 44, 50, 60, 72, 88, 106, 124, 138, 148, 152, 146, 134, 116, 98, 82, 68, 58, 50, 42, 38,
];

const LOAD_BASE = 284;

const LOAD_CAPACITY = 96;

function Shedding() {
  return (
    <>
      <Panel x={52} y={44} w={536} h={272} />
      <Label x={76} y={76} size={11}>
        Load over time
      </Label>
      <rect x={430} y={67} width={10} height={10} rx={2} fill="currentColor" stroke="none" />
      <Label x={448} y={76} size={9}>
        Served
      </Label>
      <rect
        x={510}
        y={67}
        width={10}
        height={10}
        rx={2}
        fill="currentColor"
        stroke="none"
        opacity={0.3}
      />
      <Label x={528} y={76} size={9}>
        Shed
      </Label>
      <path d="M76 140 H564 M76 236 H564" opacity={0.12} />
      {LOAD.map((h, i) => {
        const x = 82 + i * 22;
        const over = h > LOAD_CAPACITY;
        return (
          <g key={x}>
            {over && (
              <path
                d={barPath({
                  x,
                  top: LOAD_BASE - h,
                  bottom: LOAD_BASE - LOAD_CAPACITY,
                  w: 14,
                  r: 4,
                })}
                fill="currentColor"
                stroke="none"
                opacity={0.3}
              />
            )}
            <path
              data-grow="y"
              style={delay(i / 2)}
              d={barPath({
                x,
                top: LOAD_BASE - Math.min(h, LOAD_CAPACITY),
                bottom: LOAD_BASE,
                w: 14,
                r: over ? 0 : 4,
              })}
              fill="currentColor"
              stroke="none"
              opacity={0.85}
            />
          </g>
        );
      })}
      <path d={`M76 ${LOAD_BASE} H564`} opacity={0.5} />
      <path d={`M76 ${LOAD_BASE - LOAD_CAPACITY} H564`} strokeDasharray="5 5" pathLength={245} />
      <Label x={564} y={LOAD_BASE - LOAD_CAPACITY - 10} anchor="end" size={9}>
        Capacity
      </Label>
      <path d="M236 128 V122 H426 V128" opacity={0.6} />
      <Label x={331} y={112} anchor="middle" size={9}>
        Shed
      </Label>
    </>
  );
}

const EXTENSIONS = [
  { x: 52, y: 70, name: "Queue", ext: "Skip locked", d: "M202 98 C236 98 232 150 262 150" },
  { x: 438, y: 70, name: "Search", ext: "tsvector", d: "M438 98 C404 98 408 150 378 150" },
  { x: 52, y: 234, name: "Vectors", ext: "pgvector", d: "M202 262 C236 262 232 210 262 210" },
  { x: 438, y: 234, name: "JSON", ext: "jsonb", d: "M438 262 C404 262 408 210 378 210" },
];

const CYLINDER = "M262 120 V236 A58 16 0 0 0 378 236 V120";

function ExtensionIcon({ index, cx, cy }: { index: number; cx: number; cy: number }) {
  if (index === 0) {
    return (
      <path
        d={`M${cx - 10} ${cy - 7} H${cx + 10} M${cx - 10} ${cy} H${cx + 6} M${cx - 10} ${cy + 7} H${cx + 2}`}
      />
    );
  }
  if (index === 1) {
    return (
      <>
        <circle cx={cx - 2} cy={cy - 2} r={7} />
        <path d={`M${cx + 2.9} ${cy + 2.9} L${cx + 9} ${cy + 9}`} />
      </>
    );
  }
  if (index === 2) {
    return (
      <>
        <path
          d={`M${cx - 8} ${cy + 7} L${cx - 3} ${cy - 7} L${cx + 8} ${cy - 3} L${cx + 5} ${cy + 8} Z M${cx - 3} ${cy - 7} L${cx + 5} ${cy + 8}`}
          opacity={0.6}
        />
        <g fill="currentColor" stroke="none">
          <circle cx={cx - 8} cy={cy + 7} r={3} />
          <circle cx={cx - 3} cy={cy - 7} r={3} />
          <circle cx={cx + 8} cy={cy - 3} r={3} />
          <circle cx={cx + 5} cy={cy + 8} r={3} />
        </g>
      </>
    );
  }
  return (
    <path
      d={`M${cx - 4} ${cy - 10} C${cx - 9} ${cy - 10} ${cx - 7} ${cy - 2} ${cx - 11} ${cy} C${cx - 7} ${cy + 2} ${cx - 9} ${cy + 10} ${cx - 4} ${cy + 10} M${cx + 4} ${cy - 10} C${cx + 9} ${cy - 10} ${cx + 7} ${cy - 2} ${cx + 11} ${cy} C${cx + 7} ${cy + 2} ${cx + 9} ${cy + 10} ${cx + 4} ${cy + 10}`}
    />
  );
}

function Postgres() {
  return (
    <>
      {EXTENSIONS.map(({ d }) => (
        <Flow key={d} d={d} dashes={8} />
      ))}
      <g transform="translate(6 6)" fill="currentColor" stroke="none" opacity={0.14}>
        <path d={CYLINDER} />
        <ellipse cx={320} cy={120} rx={58} ry={16} />
      </g>
      <path d={CYLINDER} className={SURFACE} />
      <path d="M262 158 A58 16 0 0 0 378 158 M262 197 A58 16 0 0 0 378 197" opacity={0.5} />
      <ellipse cx={320} cy={120} rx={58} ry={16} className={SURFACE} />
      <Label x={320} y={292} anchor="middle" size={12}>
        Postgres
      </Label>
      {EXTENSIONS.map(({ x, y, name, ext }, i) => (
        <g key={name}>
          <Panel x={x} y={y} w={150} h={56} solid={i === 0} />
          <g {...(i === 0 && { className: "text-(--cover-bg)" })}>
            <ExtensionIcon index={i} cx={x + 28} cy={y + 28} />
            <Label x={x + 52} y={y + 25} size={11}>
              {name}
            </Label>
            <g opacity={0.7}>
              <Label x={x + 52} y={y + 42} size={8}>
                {ext}
              </Label>
            </g>
          </g>
        </g>
      ))}
    </>
  );
}

const PHASES = [
  { x: 220, name: "Expand" },
  { x: 320, name: "Migrate" },
  { x: 420, name: "Contract" },
];

function Schema() {
  return (
    <g transform="translate(0 10)">
      <rect
        x={255}
        y={48}
        width={130}
        height={22}
        rx={11}
        fill="currentColor"
        stroke="none"
        opacity={0.85}
      />
      <g className="text-(--cover-bg)">
        <Label x={320} y={63} anchor="middle" size={9}>
          Zero downtime
        </Label>
      </g>
      <path d="M220 130 V124 H420 V130" opacity={0.6} />
      <Label x={320} y={114} anchor="middle" size={9}>
        Dual write
      </Label>
      <path
        d="M172 148 H420 C320 148 320 212 220 212 H172 Z"
        fill="currentColor"
        stroke="none"
        opacity={0.3}
      />
      <path
        data-grow="x"
        d="M220 212 C320 212 320 148 420 148 H468 V212 Z"
        fill="currentColor"
        stroke="none"
        opacity={0.85}
      />
      <Panel x={52} y={136} w={120} h={88} r={12} />
      <Label x={68} y={176} size={12}>
        name
      </Label>
      <g opacity={0.7}>
        <Label x={68} y={196} size={8}>
          Old column
        </Label>
      </g>
      <Panel x={468} y={136} w={120} h={88} r={12} solid />
      <g className="text-(--cover-bg)">
        <Label x={484} y={176} size={11}>
          full_name
        </Label>
        <g opacity={0.8}>
          <Label x={484} y={196} size={8}>
            New column
          </Label>
        </g>
      </g>
      <path d="M172 262 H468" opacity={0.3} />
      {PHASES.map(({ x, name }, i) => (
        <g key={name}>
          <path d={`M${x} 222 V252`} strokeDasharray="4 4" opacity={0.4} />
          <g data-grow="y" style={delay(i)}>
            <circle cx={x} cy={262} r={5} fill="currentColor" stroke="none" />
          </g>
          <Label x={x} y={290} anchor="middle" size={10}>
            {name}
          </Label>
        </g>
      ))}
    </g>
  );
}

const RESULTS = [
  { y: 156, line: 92, score: 88 },
  { y: 198, line: 80, score: 76 },
  { y: 240, line: 70, score: 60 },
];

const ANSWER =
  "M442 86 H576 A12 12 0 0 1 588 98 V220 A12 12 0 0 1 576 232 H476 L450 256 V232 H442 A12 12 0 0 1 430 220 V98 A12 12 0 0 1 442 86 Z";

const CITATIONS = [
  { x: 560, y: 140, n: "1" },
  { x: 524, y: 166, n: "2" },
];

function Retrieval() {
  return (
    <>
      <rect x={58} y={110} width={128} height={168} rx={8} className={SURFACE} />
      <rect x={70} y={98} width={128} height={168} rx={8} className={SURFACE} />
      <rect x={82} y={86} width={128} height={168} rx={8} className={SURFACE} />
      <path d="M100 116 H190 M100 136 H178 M100 156 H186 M100 222 H170" opacity={0.6} />
      <rect
        data-grow="x"
        x={100}
        y={180}
        width={80}
        height={14}
        rx={7}
        fill="currentColor"
        stroke="none"
        opacity={0.85}
      />
      <Arrow d="M216 174 H233" length={17} from={{ x: 216, y: 174 }} tip={{ x: 242, y: 174 }} />
      <Panel x={246} y={86} w={150} h={176} />
      <circle cx={268} cy={110} r={6} />
      <path d="M272.2 114.2 L277 119" />
      <Label x={284} y={114} size={9}>
        Top-k
      </Label>
      <path d="M246 128 H396" opacity={0.4} />
      {RESULTS.map(({ y, line, score }, i) => (
        <g key={y}>
          <Label x={262} y={y} size={9}>
            {String(i + 1)}
          </Label>
          <path d={`M280 ${y - 6} H${280 + line}`} opacity={0.6} />
          <rect
            x={280}
            y={y + 2}
            width={96}
            height={5}
            rx={2.5}
            fill="currentColor"
            stroke="none"
            opacity={0.2}
          />
          <rect
            data-grow="x"
            style={delay(i)}
            x={280}
            y={y + 2}
            width={score}
            height={5}
            rx={2.5}
            fill="currentColor"
            stroke="none"
            opacity={0.85}
          />
        </g>
      ))}
      <Arrow d="M406 174 H418" length={12} from={{ x: 406, y: 174 }} tip={{ x: 427, y: 174 }} />
      <path
        d={ANSWER}
        transform="translate(6 6)"
        fill="currentColor"
        stroke="none"
        opacity={0.14}
      />
      <path d={ANSWER} className={SURFACE} />
      <path d={sparkle(454, 112, 6)} fill="currentColor" stroke="none" />
      <Label x={466} y={116} size={9}>
        Answer
      </Label>
      <path d="M448 140 H550 M448 166 H514 M448 192 H560 M448 212 H520" opacity={0.6} />
      {CITATIONS.map(({ x, y, n }) => (
        <g key={n}>
          <rect
            x={x - 8}
            y={y - 8}
            width={16}
            height={16}
            rx={4}
            fill="currentColor"
            stroke="none"
            opacity={0.85}
          />
          <g className="text-(--cover-bg)">
            <Label x={x} y={y + 3.5} anchor="middle" size={9}>
              {n}
            </Label>
          </g>
        </g>
      ))}
      <Label x={134} y={304} anchor="middle" size={12}>
        Sources
      </Label>
      <Label x={321} y={304} anchor="middle" size={12}>
        Retrieve
      </Label>
      <Label x={509} y={304} anchor="middle" size={12}>
        Cited answer
      </Label>
    </>
  );
}

const TREE_MIDS = [
  { x: 140, name: "Header" },
  { x: 320, name: "Feed" },
  { x: 500, name: "Sidebar" },
];

function Tree() {
  return (
    <>
      {TREE_MIDS.map(({ x }) => (
        <path key={x} d={`M320 84 C320 112 ${x} 112 ${x} 140`} />
      ))}
      <Panel x={262} y={44} w={116} h={40} r={20} />
      <Label x={320} y={68} anchor="middle" size={10}>
        Layout
      </Label>
      {TREE_MIDS.map(({ x, name }, i) => (
        <g key={name}>
          <path d={`M${x} 180 C${x} 206 ${x - 36} 206 ${x - 36} 232`} />
          <Flow d={`M${x} 180 C${x} 206 ${x + 36} 206 ${x + 36} 232`} dashes={6} />
          <Panel x={x - 56} y={140} w={112} h={40} />
          <Label x={x} y={164} anchor="middle" size={10}>
            {name}
          </Label>
          <Panel x={x - 66} y={232} w={60} h={34} r={8} />
          <path d={`M${x - 50} 244 H${x - 22} M${x - 50} 254 H${x - 30}`} opacity={0.6} />
          <g data-grow="y" style={delay(i)}>
            <Panel x={x + 6} y={232} w={60} h={34} r={8} solid />
            <path
              d={`M${x + 39} 239 L${x + 31} 251 H${x + 36} L${x + 33} 259 L${x + 41} 247 H${x + 36} Z`}
              stroke="none"
              className="fill-(--cover-bg)"
            />
          </g>
        </g>
      ))}
      <rect x={236} y={296} width={14} height={14} rx={3} className={SURFACE} />
      <Label x={258} y={308} size={10}>
        Server
      </Label>
      <rect
        x={340}
        y={296}
        width={14}
        height={14}
        rx={3}
        fill="currentColor"
        stroke="none"
        opacity={0.85}
      />
      <Label x={362} y={308} size={10}>
        Client
      </Label>
    </>
  );
}

const FRAME_START = 150;

const FRAME_STEP = 45;

const FRAME_TICKS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

const LONG_STACK = [
  { x: 150, w: 270, level: 0 },
  { x: 426, w: 129, level: 0 },
  { x: 160, w: 140, level: 1 },
  { x: 306, w: 104, level: 1 },
  { x: 436, w: 84, level: 1 },
  { x: 170, w: 70, level: 2 },
  { x: 320, w: 60, level: 2 },
];

const HATCH = Array.from({ length: 35 }, (_, i) => 197 + i * 10);

const CHUNKS = [0, 1, 2, 3, 4, 5, 6, 7, 8];

const HANDLER = 2;

function Frames() {
  return (
    <>
      <Panel x={40} y={36} w={560} h={288} />
      {[58, 70, 82].map((cx) => (
        <circle key={cx} cx={cx} cy={50} r={3.5} fill="currentColor" stroke="none" opacity={0.45} />
      ))}
      <Label x={100} y={54} size={9}>
        Performance
      </Label>
      <Label x={580} y={54} anchor="end" size={9}>
        Main thread
      </Label>
      <path d="M40 64 H600" opacity={0.4} />
      <path
        d={FRAME_TICKS.map(
          (t) => `M${FRAME_START + t * FRAME_STEP} 88 V${t % 2 === 0 ? 96 : 92}`,
        ).join(" ")}
        opacity={0.5}
      />
      {[0, 2, 4, 6, 8].map((t) => (
        <g key={t} opacity={0.7}>
          <Label x={FRAME_START + t * FRAME_STEP + 4} y={84} size={7}>
            {t === 0 ? "0" : `${t * 50} ms`}
          </Label>
        </g>
      ))}
      <path d="M195 100 V290" strokeDasharray="4 4" opacity={0.35} />
      <Label x={60} y={135} size={9}>
        Long task
      </Label>
      <path d="M240 108 H555 M555 103 V113" opacity={0.7} />
      <path d="M240 102 L246 108 L240 114 L234 108 Z" fill="currentColor" stroke="none" />
      <rect
        x={150}
        y={120}
        width={405}
        height={22}
        rx={4}
        fill="currentColor"
        stroke="none"
        opacity={0.3}
      />
      <path
        d={HATCH.map((x) => `M${x} 141 L${x + 10} 121`).join(" ")}
        strokeWidth={1.5}
        opacity={0.45}
      />
      <path d="M539 120 H551 A4 4 0 0 1 555 124 V136 Z" fill="currentColor" stroke="none" />
      {LONG_STACK.map(({ x, w, level }, i) => (
        <rect
          key={`${x}-${level}`}
          data-grow="x"
          style={delay(i)}
          x={x}
          y={147 + level * 15}
          width={w}
          height={11}
          rx={2}
          fill="currentColor"
          stroke="none"
          opacity={0.22 - level * 0.04}
        />
      ))}
      <Label x={60} y={239} size={9}>
        Yielding
      </Label>
      <path d="M240 212 H282 M282 207 V217" opacity={0.7} />
      <path d="M240 206 L246 212 L240 218 L234 212 Z" fill="currentColor" stroke="none" />
      {CHUNKS.map((chunk) => {
        const x = FRAME_START + chunk * FRAME_STEP;
        const handler = chunk === HANDLER;
        return (
          <g key={chunk}>
            <rect
              x={x + 2}
              y={224}
              width={39}
              height={22}
              rx={4}
              fill="currentColor"
              stroke="none"
              opacity={handler ? 0.85 : 0.3}
              {...(handler && { "data-grow": "y" })}
            />
            <rect
              x={x + 2}
              y={251}
              width={handler ? 34 : 26 + (chunk % 3) * 4}
              height={11}
              rx={2}
              fill="currentColor"
              stroke="none"
              opacity={handler ? 0.5 : 0.22}
            />
            {chunk % 2 === 0 && (
              <rect
                x={x + 2}
                y={266}
                width={handler ? 22 : 16}
                height={11}
                rx={2}
                fill="currentColor"
                stroke="none"
                opacity={handler ? 0.35 : 0.18}
              />
            )}
          </g>
        );
      })}
      <path d="M40 290 H600" opacity={0.2} />
      <rect
        x={60}
        y={301}
        width={12}
        height={12}
        rx={2}
        fill="currentColor"
        stroke="none"
        opacity={0.3}
      />
      <path d="M61 312 L71 302" strokeWidth={1.5} opacity={0.6} />
      <Label x={80} y={311} size={8}>
        Over 50 ms
      </Label>
      <rect
        x={180}
        y={301}
        width={12}
        height={12}
        rx={2}
        fill="currentColor"
        stroke="none"
        opacity={0.85}
      />
      <Label x={200} y={311} size={8}>
        Input handler
      </Label>
      <path d="M326 307 L331 302 L336 307 L331 312 Z" fill="currentColor" stroke="none" />
      <Label x={344} y={311} size={8}>
        Input
      </Label>
    </>
  );
}

const MODULES = [
  { x: 72, name: "Deals" },
  { x: 252, name: "Billing" },
  { x: 432, name: "Reports" },
];

const KANBAN = [3, 2, 1];

const LEDGER = [0, 1, 2, 3, 4];

const REPORT_BARS = [24, 40, 32, 56, 44];

function ModuleBody({ x, index }: { x: number; index: number }) {
  if (index === 0) {
    return KANBAN.flatMap((cards, column) =>
      Array.from({ length: cards }, (_, card) => (
        <rect
          key={`${column}-${card}`}
          x={x + 16 + column * 36}
          y={156 + card * 22}
          width={28}
          height={16}
          rx={3}
          fill="currentColor"
          stroke="none"
          opacity={column === 0 && card === 0 ? 0.85 : 0.3}
        />
      )),
    );
  }
  if (index === 1) {
    return LEDGER.map((row) => (
      <path
        key={row}
        d={`M${x + 16} ${160 + row * 15} H${x + 64} M${x + 92} ${160 + row * 15} H${x + 120}`}
        opacity={row === 0 ? 0.9 : 0.4}
      />
    ));
  }
  return REPORT_BARS.map((h, bar) => (
    <rect
      key={bar}
      data-grow="y"
      style={delay(bar)}
      x={x + 16 + bar * 21}
      y={226 - h}
      width={14}
      height={h}
      rx={3}
      fill="currentColor"
      stroke="none"
      opacity={bar === 3 ? 0.85 : 0.4}
    />
  ));
}

const SWATCHES = [0.2, 0.4, 0.6, 0.85];

function Modules() {
  return (
    <>
      <Panel x={48} y={36} w={544} h={236} />
      {[68, 80, 92].map((cx) => (
        <circle key={cx} cx={cx} cy={54} r={3.5} fill="currentColor" stroke="none" opacity={0.45} />
      ))}
      <rect x={116} y={46} width={180} height={16} rx={8} opacity={0.4} />
      <Label x={568} y={59} anchor="end" size={9}>
        App shell
      </Label>
      <path d="M48 72 H592" opacity={0.5} />
      <path d="M320 72 V88 M140 88 H500 M140 88 V103 M320 88 V103 M500 88 V103" opacity={0.6} />
      {MODULES.map(({ x, name }, i) => (
        <g key={name}>
          <Flow d={`M${x + 68} 240 V286`} dashes={5} />
          <Panel x={x} y={112} w={136} h={128} />
          <rect x={x + 40} y={103} width={56} height={18} rx={9} className={SURFACE} />
          <Label x={x + 68} y={115} anchor="middle" size={8}>
            index
          </Label>
          <Label x={x + 16} y={146} size={10}>
            {name}
          </Label>
          <ModuleBody x={x} index={i} />
        </g>
      ))}
      <Panel x={48} y={286} w={544} h={40} />
      <Label x={72} y={311} size={10}>
        Design system
      </Label>
      {SWATCHES.map((opacity, i) => (
        <circle
          key={opacity}
          cx={496 + i * 20}
          cy={306}
          r={7}
          fill="currentColor"
          stroke="none"
          opacity={opacity}
        />
      ))}
      <circle cx={576} cy={306} r={7} />
    </>
  );
}

const ROLLOUT = [
  { x: 120, step: "5%" },
  { x: 266, step: "25%" },
  { x: 413, step: "50%" },
  { x: 560, step: "100%" },
];

function Canary() {
  return (
    <>
      <path
        d="M119 160 C180 160 190 110 250 110"
        strokeWidth={8}
        strokeLinecap="butt"
        opacity={0.35}
      />
      <Flow d="M120 160 C180 160 190 210 250 210" dashes={15} />
      <circle cx={102} cy={166} r={24} fill="currentColor" stroke="none" opacity={0.14} />
      <circle cx={96} cy={160} r={24} className={SURFACE} />
      <path d="M84 160 H92 C100 160 100 152 108 152 M92 160 C100 160 100 168 108 168" />
      <Panel x={250} y={80} w={160} h={60} />
      <Label x={270} y={104} size={9}>
        Stable
      </Label>
      <Label x={390} y={126} anchor="end" size={20}>
        95%
      </Label>
      <Panel x={250} y={180} w={160} h={60} solid />
      <g className="text-(--cover-bg)">
        <Label x={270} y={204} size={9}>
          Canary
        </Label>
        <Label x={390} y={226} anchor="end" size={20}>
          5%
        </Label>
      </g>
      <Panel x={440} y={80} w={152} h={160} />
      <Label x={456} y={104} size={9}>
        Error rate
      </Label>
      <path d="M456 140 H576" strokeDasharray="5 5" opacity={0.6} />
      <Label x={576} y={133} anchor="end" size={8}>
        SLO
      </Label>
      <path data-grow="x" d="M456 196 L476 188 L496 200 L516 184 L536 192 L556 180 L572 186" />
      <circle cx={576} cy={186} r={4} fill="currentColor" stroke="none" />
      <circle cx={466} cy={222} r={8} fill="currentColor" stroke="none" opacity={0.85} />
      <path d="M462.5 222 l2.5 2.5 l4.5 -5" className="stroke-(--cover-bg)" />
      <Label x={482} y={226} size={9}>
        Healthy
      </Label>
      <path d="M120 296 H560" strokeWidth={4} opacity={0.25} />
      <path data-grow="x" d="M120 296 H413" strokeWidth={4} opacity={0.85} />
      {ROLLOUT.map(({ x, step }, i) => (
        <g key={step}>
          <circle cx={x} cy={296} r={11} className={SURFACE} {...(i < 3 && { stroke: "none" })} />
          {i < 3 ? (
            <>
              <circle cx={x} cy={296} r={11} fill="currentColor" stroke="none" opacity={0.85} />
              <path d={`M${x - 4} 296 l3 3 l5 -6`} className="stroke-(--cover-bg)" />
            </>
          ) : (
            <circle cx={x} cy={296} r={3} fill="currentColor" stroke="none" />
          )}
          <Label x={x} y={328} anchor="middle" size={10}>
            {step}
          </Label>
        </g>
      ))}
    </>
  );
}

const GOLDEN_PATH = ["CI / CD", "Observability", "Security", "Runbooks"];

const SERVICES = [
  { y: 56, name: "Payments", port: 162 },
  { y: 140, name: "Search", port: 180 },
  { y: 224, name: "Notify", port: 198 },
];

function Paved() {
  return (
    <>
      <Panel x={52} y={76} w={200} h={208} />
      <Label x={72} y={104} size={10}>
        Golden path
      </Label>
      <path d="M52 120 H252" opacity={0.4} />
      {GOLDEN_PATH.map((item, i) => {
        const y = 148 + i * 34;
        return (
          <g key={item}>
            <g data-grow="y" style={delay(i)}>
              <circle cx={80} cy={y} r={8} fill="currentColor" stroke="none" opacity={0.85} />
              <path d={`M76.5 ${y} l2.5 2.5 l4.5 -5`} className="stroke-(--cover-bg)" />
            </g>
            <Label x={98} y={y + 3.5} size={9}>
              {item}
            </Label>
          </g>
        );
      })}
      {SERVICES.map(({ y, port }) => (
        <Flow key={y} d={`M252 ${port} C306 ${port} 306 ${y + 32} 360 ${y + 32}`} dashes={12} />
      ))}
      {SERVICES.map(({ y, name }, i) => (
        <g key={name}>
          <Panel x={360} y={y} w={228} h={64} solid={i === 0} />
          <g {...(i === 0 && { className: "text-(--cover-bg)" })}>
            <ChainIcon index={1} cx={388} cy={y + 32} />
            <Label x={412} y={y + 28} size={10}>
              {name}
            </Label>
            {[0, 1, 2, 3].map((badge) => (
              <circle
                key={badge}
                cx={416 + badge * 14}
                cy={y + 44}
                r={4}
                fill="currentColor"
                stroke="none"
                opacity={0.85}
              />
            ))}
            <circle cx={546} cy={y + 24} r={3} fill="currentColor" stroke="none" />
            <Label x={554} y={y + 27.5} size={8}>
              Live
            </Label>
          </g>
        </g>
      ))}
      <Label x={152} y={316} anchor="middle" size={12}>
        Template
      </Label>
      <Label x={474} y={316} anchor="middle" size={12}>
        Services
      </Label>
    </>
  );
}
const CHAIN_NAMES = ["Source", "Deps", "Build", "Sign", "Deploy"];

const CHAIN_TOP = 88;

const CHAIN_SEAL = 236;

function ChainIcon({ index, cx, cy }: { index: number; cx: number; cy: number }) {
  if (index === 0) {
    return (
      <>
        <circle cx={cx - 8} cy={cy - 11} r={4} />
        <circle cx={cx - 8} cy={cy + 11} r={4} />
        <circle cx={cx + 8} cy={cy - 5} r={4} />
        <path
          d={`M${cx - 8} ${cy - 7} V${cy + 7} M${cx + 8} ${cy - 1} C${cx + 8} ${cy + 5} ${cx - 8} ${cy + 3} ${cx - 8} ${cy + 7}`}
        />
      </>
    );
  }
  if (index === 1) {
    return (
      <path
        d={`M${cx} ${cy - 12} L${cx + 11} ${cy - 6} V${cy + 6} L${cx} ${cy + 12} L${cx - 11} ${cy + 6} V${cy - 6} Z M${cx - 11} ${cy - 6} L${cx} ${cy} L${cx + 11} ${cy - 6} M${cx} ${cy} V${cy + 12}`}
      />
    );
  }
  if (index === 2) {
    return (
      <>
        <rect x={cx - 14} y={cy - 11} width={28} height={22} rx={3} />
        <path d={`M${cx - 8} ${cy - 4} l4 4 l-4 4 M${cx - 1} ${cy + 4} H${cx + 7}`} />
      </>
    );
  }
  if (index === 3) {
    return (
      <g className="text-(--cover-bg)">
        <rect x={cx - 9} y={cy - 2} width={18} height={13} rx={3} />
        <path d={`M${cx - 5} ${cy - 2} V${cy - 7} A5 5 0 0 1 ${cx + 5} ${cy - 7} V${cy - 2}`} />
        <circle cx={cx} cy={cy + 4.5} r={1.5} fill="currentColor" stroke="none" />
      </g>
    );
  }
  return (
    <>
      <rect x={cx - 13} y={cy - 12} width={26} height={10} rx={3} />
      <rect x={cx - 13} y={cy + 2} width={26} height={10} rx={3} />
      <circle cx={cx - 7} cy={cy - 7} r={1.5} fill="currentColor" stroke="none" />
      <circle cx={cx - 7} cy={cy + 7} r={1.5} fill="currentColor" stroke="none" />
    </>
  );
}

function Chain() {
  return (
    <>
      {CHAIN_NAMES.map((name, i) => {
        const x = 48 + i * 112;
        const cx = x + 42;
        return (
          <g key={name}>
            <Flow d={`M${cx} ${CHAIN_TOP + 84} V${CHAIN_SEAL - 10}`} dashes={6} />
            {i < 4 && <path d={`M${cx + 10} ${CHAIN_SEAL} H${cx + 102}`} opacity={0.4} />}
            <Panel x={x} y={CHAIN_TOP} w={84} h={84} solid={i === 3} />
            <ChainIcon index={i} cx={cx} cy={CHAIN_TOP + 34} />
            <g {...(i === 3 && { className: "text-(--cover-bg)" })}>
              <Label x={cx} y={CHAIN_TOP + 70} anchor="middle" size={9}>
                {name}
              </Label>
            </g>
            <g data-grow="y" style={delay(i)}>
              <circle cx={cx} cy={CHAIN_SEAL} r={10} className={SURFACE} stroke="none" />
              <circle
                cx={cx}
                cy={CHAIN_SEAL}
                r={10}
                fill="currentColor"
                stroke="none"
                opacity={0.85}
              />
              <path d={`M${cx - 4} ${CHAIN_SEAL} l3 3 l5 -6`} className="stroke-(--cover-bg)" />
            </g>
          </g>
        );
      })}
      <Label x={320} y={292} anchor="middle" size={12}>
        Verified at every link
      </Label>
    </>
  );
}

function Doors() {
  return (
    <>
      <path
        d="M120 284 L250 284 L300 338 L70 338 Z"
        fill="currentColor"
        stroke="none"
        opacity={0.1}
      />
      <path
        d="M121 284 V86 A5 5 0 0 1 126 81 H244 A5 5 0 0 1 249 86 V284 Z"
        fill="currentColor"
        stroke="none"
        opacity={0.2}
      />
      <path d="M64 284 H576" opacity={0.5} />
      <path d="M120 284 V86 A6 6 0 0 1 126 80 H244 A6 6 0 0 1 250 86 V284" />
      <path d="M120 86 L182 103 V266 L120 284 Z" className={SURFACE} />
      <circle cx={172} cy={182} r={4} fill="currentColor" stroke="none" />
      <circle cx={250} cy={80} r={15} className={SURFACE} />
      <path d="M243 77 H257 M254 74 L257 77 L254 80 M257 84 H243 M246 81 L243 84 L246 87" />
      <Arrow
        d="M155 312 H216"
        length={61}
        from={{ x: 145, y: 312 }}
        tip={{ x: 226, y: 312 }}
        twoWay
      />
      <Label x={185} y={52} anchor="middle" size={12}>
        Two-way
      </Label>
      <path d="M390 284 V86 A6 6 0 0 1 396 80 H514 A6 6 0 0 1 520 86 V284" />
      <rect
        data-grow="y"
        x={394}
        y={84}
        width={122}
        height={200}
        rx={3}
        fill="currentColor"
        stroke="none"
        opacity={0.85}
      />
      <circle cx={502} cy={182} r={4.5} stroke="none" className="fill-(--cover-bg)" opacity={0.7} />
      <circle cx={520} cy={80} r={15} className={SURFACE} />
      <rect x={514} y={79} width={12} height={9} rx={2} />
      <path d="M517 79 V76 A3 3 0 0 1 523 76 V79" />
      <Arrow d="M418 312 H485" length={67} from={{ x: 418, y: 312 }} tip={{ x: 494, y: 312 }} />
      <Label x={455} y={52} anchor="middle" size={12}>
        One-way
      </Label>
    </>
  );
}

const GAUGE = { cx: 190, cy: 250, r: 92, value: 0.68 };

const GAUGE_TICKS = Array.from({ length: 13 }, (_, k) => k);

const METRICS = [
  { name: "Deploys", value: "14/d", trend: [0.2, 0.35, 0.3, 0.5, 0.45, 0.7, 0.8] },
  { name: "Recovery", value: "38m", trend: [0.8, 0.6, 0.65, 0.4, 0.45, 0.3, 0.25] },
  { name: "Fail rate", value: "4%", trend: [0.6, 0.5, 0.55, 0.35, 0.4, 0.3, 0.2] },
  { name: "Rework", value: "7%", trend: [0.3, 0.45, 0.35, 0.5, 0.4, 0.55, 0.45] },
];

function Gauges() {
  const { cx, cy, r, value } = GAUGE;
  const end = polar(cx, cy, r, 180 + 180 * value);
  const needle = polar(cx, cy, r - 30, 180 + 180 * value);
  const ticks = GAUGE_TICKS.map((k) => {
    const from = polar(cx, cy, k % 3 === 0 ? r - 26 : r - 22, 180 + k * 15);
    const to = polar(cx, cy, r - 16, 180 + k * 15);
    return `M${from.x} ${from.y} L${to.x} ${to.y}`;
  }).join(" ");

  return (
    <>
      <Panel x={52} y={44} w={276} h={272} />
      <Label x={76} y={76} size={10}>
        Lead time
      </Label>
      <Label x={76} y={110} size={22}>
        1.8 days
      </Label>
      <path d={ticks} opacity={0.5} />
      <path
        d={`M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        strokeWidth={10}
        opacity={0.2}
      />
      <path
        d={`M${cx - r} ${cy} A${r} ${r} 0 0 1 ${end.x} ${end.y}`}
        strokeWidth={10}
        opacity={0.85}
      />
      <path d={`M${cx} ${cy} L${needle.x} ${needle.y}`} strokeWidth={3} />
      <circle cx={cx} cy={cy} r={7} fill="currentColor" stroke="none" />
      <circle cx={cx} cy={cy} r={2.5} className={SURFACE} stroke="none" />
      {METRICS.map(({ name, value: figure, trend }, i) => {
        const x = 352 + (i % 2) * 124;
        const y = 44 + Math.floor(i / 2) * 142;
        const last = trend.at(-1) ?? 0;
        return (
          <g key={name}>
            <Panel x={x} y={y} w={112} h={130} />
            <Label x={x + 14} y={y + 26} size={9}>
              {name}
            </Label>
            <Label x={x + 14} y={y + 54} size={16}>
              {figure}
            </Label>
            <path
              data-grow="x"
              style={delay(i)}
              d={trend
                .map((v, p) => `${p === 0 ? "M" : "L"}${x + 14 + p * 14} ${y + 112 - v * 40}`)
                .join(" ")}
            />
            <circle
              cx={x + 98}
              cy={y + 112 - last * 40}
              r={3.5}
              fill="currentColor"
              stroke="none"
            />
          </g>
        );
      })}
    </>
  );
}

const DIFF_ROWS = [
  { w: 150, sign: "" },
  { w: 190, sign: "" },
  { w: 120, sign: "-" },
  { w: 170, sign: "-" },
  { w: 200, sign: "+" },
  { w: 160, sign: "+" },
  { w: 110, sign: "" },
  { w: 140, sign: "" },
];

const GATES = [
  { y: 84, name: "Lint" },
  { y: 136, name: "Tests" },
  { y: 188, name: "AI" },
];

function Review() {
  return (
    <>
      <Panel x={52} y={48} w={340} h={260} />
      {[72, 84, 96].map((cx) => (
        <circle key={cx} cx={cx} cy={67} r={3.5} fill="currentColor" stroke="none" opacity={0.45} />
      ))}
      <Label x={114} y={71} size={9}>
        Pull request
      </Label>
      <path d="M52 86 H392" opacity={0.4} />
      {DIFF_ROWS.map(({ w, sign }, row) => {
        const y = 104 + row * 24;
        return (
          <g key={y}>
            {sign !== "" && (
              <rect
                x={53}
                y={y - 10}
                width={338}
                height={20}
                fill="currentColor"
                stroke="none"
                opacity={sign === "+" ? 0.18 : 0.08}
              />
            )}
            <path d={`M68 ${y} H78`} opacity={0.35} />
            {sign === "-" && <path d={`M90 ${y} H98`} />}
            {sign === "+" && <path d={`M90 ${y} H98 M94 ${y - 4} V${y + 4}`} />}
            <path d={`M110 ${y} H${110 + w}`} opacity={sign === "+" ? 0.9 : 0.55} />
          </g>
        );
      })}
      <path d={sparkle(376, 224, 6)} fill="currentColor" stroke="none" />
      <Panel x={286} y={236} w={196} h={68} />
      <path d={sparkle(306, 256, 7)} fill="currentColor" stroke="none" />
      <Label x={320} y={260} size={9}>
        AI review
      </Label>
      <path d="M306 278 H462 M306 292 H420" opacity={0.6} />
      <Label x={548} y={58} anchor="middle" size={9}>
        Gates
      </Label>
      <Flow d="M548 98 V122" dashes={3} />
      <Flow d="M548 150 V174" dashes={3} />
      <Flow d="M548 202 V232" dashes={3} />
      {GATES.map(({ y, name }, i) => (
        <g key={name}>
          <g data-grow="y" style={delay(i)}>
            <circle cx={548} cy={y} r={14} className={SURFACE} stroke="none" />
            <circle cx={548} cy={y} r={14} fill="currentColor" stroke="none" opacity={0.85} />
            {i < 2 ? (
              <path d={`M543 ${y} l3.5 3.5 l6 -7`} className="stroke-(--cover-bg)" />
            ) : (
              <path d={sparkle(548, y, 7)} stroke="none" className="fill-(--cover-bg)" />
            )}
          </g>
          <Label x={570} y={y + 4} size={8}>
            {name}
          </Label>
        </g>
      ))}
      <circle cx={548} cy={254} r={22} className={SURFACE} />
      <circle cx={548} cy={246} r={7} />
      <path d="M531 268 A17 11 0 0 1 565 268" />
      <Label x={548} y={300} anchor="middle" size={10}>
        Intent
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
  cells: Cells,
  journal: Journal,
  shedding: Shedding,
  postgres: Postgres,
  schema: Schema,
  retrieval: Retrieval,
  tree: Tree,
  frames: Frames,
  modules: Modules,
  canary: Canary,
  paved: Paved,
  chain: Chain,
  doors: Doors,
  gauges: Gauges,
  review: Review,
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
