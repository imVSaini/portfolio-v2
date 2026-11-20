import type { CSSProperties, ReactNode } from "react";

import { ArrowHead, barPath, Label } from "@/components/article/ArtParts";
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

const CELL_ROWS = [
  { y: 70, failed: false, d: "M166.3 163.1 C202 146.5 240 102 296 102" },
  { y: 148, failed: true, d: "M170 180 H296" },
  { y: 226, failed: false, d: "M166.3 196.9 C202 213.5 240 258 296 258" },
];

function Cells() {
  return (
    <>
      <circle cx={130} cy={180} r={40} />
      <path d="M112 180 H148 M136 168 l12 12 l-12 12" />
      <Label x={130} y={252} anchor="middle" size={12}>
        Router
      </Label>
      {CELL_ROWS.map(({ y, failed, d }, row) => (
        <g key={y} opacity={failed ? 0.5 : 1}>
          <Flow d={d} dashes={failed ? 13 : 16} />
          <rect
            x={300}
            y={y}
            width={250}
            height={64}
            rx={10}
            {...(failed && { strokeDasharray: "5 5" })}
          />
          {[0, 1, 2].map((box) => (
            <rect
              key={box}
              x={318 + box * 50}
              y={y + 16}
              width={34}
              height={32}
              rx={6}
              {...(box === 0 &&
                !failed && {
                  "data-grow": "y",
                  style: delay(row),
                  fill: "currentColor",
                  stroke: "none",
                  opacity: 0.85,
                })}
            />
          ))}
          {failed && <path d="M500 168 l20 20 M520 168 l-20 20" />}
        </g>
      ))}
      <Label x={425} y={322} anchor="middle" size={12}>
        One cell fails alone
      </Label>
    </>
  );
}

const JOURNAL_ROWS = [0, 1, 2, 3];

function Journal() {
  return (
    <>
      {JOURNAL_ROWS.map((row) => {
        const y = 72 + row * 54;
        return (
          <g key={row}>
            <rect
              x={110}
              y={y}
              width={290}
              height={38}
              rx={8}
              {...(row === 3 && { strokeDasharray: "5 5" })}
            />
            <circle cx={132} cy={y + 19} r={9} />
            {row < 2 && <path d={`M128 ${y + 19} l3 3 l5 -6`} />}
            <path d={`M154 ${y + 19} H${row === 2 ? 250 : 300}`} opacity={0.6} />
            {row === 2 && (
              <rect
                data-grow="x"
                x={262}
                y={y + 10}
                width={120}
                height={18}
                rx={9}
                fill="currentColor"
                stroke="none"
                opacity={0.85}
              />
            )}
          </g>
        );
      })}
      <Flow d="M410 253 C520 253 520 91 418 91" dashes={26} />
      <ArrowHead x={418} y={91} angle={180} />
      <Label x={540} y={176} size={12}>
        Replay
      </Label>
      <Label x={255} y={316} anchor="middle" size={12}>
        Journal
      </Label>
    </>
  );
}

const LOAD_BARS = [
  { x: 110, h: 90 },
  { x: 182, h: 100 },
  { x: 254, h: 172 },
  { x: 326, h: 196 },
  { x: 398, h: 178 },
  { x: 470, h: 110 },
];

const CAPACITY_LINE = 140;

function Shedding() {
  return (
    <>
      {LOAD_BARS.map(({ x, h }, i) => {
        const top = 280 - h;
        const kept = Math.min(h, 280 - CAPACITY_LINE);
        return (
          <g key={x}>
            <path
              data-grow="y"
              style={delay(i)}
              d={barPath({ x, top: 280 - kept, bottom: 279, w: 44, r: 6 })}
              strokeLinecap="butt"
              {...(h > 280 - CAPACITY_LINE && {
                fill: "currentColor",
                stroke: "none",
                opacity: 0.85,
              })}
            />
            {top < CAPACITY_LINE && (
              <rect
                x={x}
                y={top}
                width={44}
                height={CAPACITY_LINE - top - 6}
                rx={6}
                strokeDasharray="5 5"
              />
            )}
          </g>
        );
      })}
      <path d="M80 280 H560" />
      <path d={`M80 ${CAPACITY_LINE} H560`} strokeDasharray="5 5" pathLength={240} />
      <Label x={560} y={CAPACITY_LINE - 12} anchor="end" size={11}>
        Capacity
      </Label>
      <Label x={348} y={68} anchor="middle" size={11}>
        Shed
      </Label>
      <Label x={320} y={316} anchor="middle" size={12}>
        Load over time
      </Label>
    </>
  );
}

const SPOKES = [
  { x: 110, y: 90, name: "Queue", d: "M258 132 C210 132 200 98 170 98" },
  { x: 530, y: 90, name: "Search", d: "M382 132 C430 132 440 98 470 98" },
  { x: 110, y: 280, name: "Vectors", d: "M258 226 C210 226 200 272 170 272" },
  { x: 530, y: 280, name: "JSON", d: "M382 226 C430 226 440 272 470 272" },
];

function Postgres() {
  return (
    <>
      <ellipse cx={320} cy={120} rx={62} ry={18} />
      <path d="M258 120 V230 A62 18 0 0 0 382 230 V120" />
      <path d="M258 158 A62 18 0 0 0 382 158 M258 194 A62 18 0 0 0 382 194" opacity={0.5} />
      <Label x={320} y={290} anchor="middle" size={12}>
        Postgres
      </Label>
      {SPOKES.map(({ x, y, name, d }, i) => (
        <g key={name}>
          <Flow d={d} dashes={10} />
          <rect
            x={x - 60}
            y={y - 22}
            width={120}
            height={44}
            rx={8}
            {...(i === 0 && { fill: "currentColor", stroke: "none", opacity: 0.85 })}
          />
          <g {...(i === 0 && { className: "text-faded-black" })}>
            <Label x={x} y={y + 5} anchor="middle" size={12}>
              {name}
            </Label>
          </g>
        </g>
      ))}
    </>
  );
}

const TABLES = [
  { x: 70, rows: ["name"] },
  { x: 250, rows: ["name", "full_name"] },
  { x: 430, rows: ["full_name"] },
];

function Schema() {
  return (
    <>
      {TABLES.map(({ x, rows }, i) => (
        <g key={x}>
          <rect x={x} y={92} width={140} height={160} rx={10} />
          <path d={`M${x} 128 H${x + 140}`} />
          <path d={`M${x + 18} 110 H${x + 70}`} opacity={0.6} />
          {rows.map((row, r) => (
            <rect
              key={row}
              x={x + 16}
              y={144 + r * 46}
              width={108}
              height={32}
              rx={6}
              {...(row === "full_name"
                ? {
                    "data-grow": "x",
                    style: delay(i),
                    fill: "currentColor",
                    stroke: "none",
                    opacity: 0.85,
                  }
                : i === 1 && { strokeDasharray: "5 5" })}
            />
          ))}
          {i > 0 && (
            <>
              <Flow d={`M${x - 36} 172 H${x - 10}`} dashes={3} />
              <ArrowHead x={x - 8} y={172} />
            </>
          )}
        </g>
      ))}
      <Label x={140} y={292} anchor="middle" size={12}>
        Before
      </Label>
      <Label x={320} y={292} anchor="middle" size={12}>
        Expand
      </Label>
      <Label x={500} y={292} anchor="middle" size={12}>
        Contract
      </Label>
    </>
  );
}

function Retrieval() {
  return (
    <>
      <path d="M98 110 H78 A8 8 0 0 0 70 118 V242 A8 8 0 0 0 78 250 H172 A8 8 0 0 0 180 242 V236" />
      <path d="M98 96 H92 A8 8 0 0 0 84 104 V228 A8 8 0 0 0 92 236 H186 A8 8 0 0 0 194 228 V222" />
      <rect x={98} y={82} width={110} height={140} rx={8} />
      <path d="M116 112 H190 M116 134 H178 M116 156 H186" opacity={0.6} />
      <rect
        data-grow="x"
        x={116}
        y={174}
        width={70}
        height={14}
        rx={7}
        fill="currentColor"
        stroke="none"
        opacity={0.85}
      />
      <Flow d="M222 166 H272" dashes={6} />
      <ArrowHead x={272} y={166} />
      <circle cx={322} cy={160} r={38} />
      <path
        d="M346.4 188.6 L381.9 224.1 A3 3 0 0 0 386.1 219.9 L350.6 184.4 Z"
        fill="currentColor"
        stroke="none"
      />
      <Flow d="M398 166 H446" dashes={6} />
      <ArrowHead x={446} y={166} />
      <path d="M470 98 H578 A12 12 0 0 1 590 110 V202 A12 12 0 0 1 578 214 H504 L478 238 V214 H470 A12 12 0 0 1 458 202 V110 A12 12 0 0 1 470 98 Z" />
      <path d="M478 128 H570 M478 150 H556 M478 172 H530" opacity={0.6} />
      <circle cx={550} cy={172} r={5} fill="currentColor" stroke="none" />
      <Label x={139} y={290} anchor="middle" size={12}>
        Sources
      </Label>
      <Label x={330} y={290} anchor="middle" size={12}>
        Retrieve
      </Label>
      <Label x={524} y={290} anchor="middle" size={12}>
        Cited answer
      </Label>
    </>
  );
}

const TREE_MIDS = [140, 320, 500];

function Tree() {
  return (
    <>
      <circle cx={320} cy={70} r={22} />
      {TREE_MIDS.map((x, i) => (
        <g key={x}>
          <path d={`M320 92 C320 122 ${x} 120 ${x} 148`} />
          <circle cx={x} cy={170} r={22} />
          {[x - 44, x + 44].map((leaf, j) => (
            <g key={leaf}>
              <path
                d={`M${x} 192 C${x} 220 ${leaf} 218 ${leaf} 242`}
                {...(j === 1 && { strokeDasharray: "5 5" })}
              />
              <rect
                x={leaf - 22}
                y={242}
                width={44}
                height={34}
                rx={8}
                {...(j === 1 && {
                  "data-grow": "y",
                  style: delay(i),
                  fill: "currentColor",
                  stroke: "none",
                  opacity: 0.85,
                })}
              />
            </g>
          ))}
        </g>
      ))}
      <Label x={320} y={318} anchor="middle" size={12}>
        Server tree, client leaves
      </Label>
    </>
  );
}

const FRAME_CHUNKS = [0, 1, 2, 3, 4, 5, 6, 7];

function Frames() {
  return (
    <>
      <Label x={90} y={118} size={11}>
        Long task
      </Label>
      <rect x={210} y={96} width={340} height={34} rx={8} />
      <path d="M226 113 H530" opacity={0.4} strokeDasharray="5 5" />
      <Label x={90} y={218} size={11}>
        Yielding
      </Label>
      {FRAME_CHUNKS.map((chunk) => (
        <rect
          key={chunk}
          x={210 + chunk * 44}
          y={196}
          width={34}
          height={34}
          rx={7}
          {...(chunk === 2 && {
            "data-grow": "y",
            fill: "currentColor",
            stroke: "none",
            opacity: 0.85,
          })}
        />
      ))}
      <Flow d="M311 58 V88" dashes={3} />
      <path d="M304 80 L311 89 L318 80" />
      <Label x={311} y={46} anchor="middle" size={11}>
        Click
      </Label>
      <Flow d="M311 150 V188" dashes={4} />
      <path d="M304 180 L311 189 L318 180" />
      <Label x={380} y={290} anchor="middle" size={12}>
        Input runs between chunks
      </Label>
    </>
  );
}

const MODULE_BOXES = [
  { x: 60, name: "Deals" },
  { x: 240, name: "Billing" },
  { x: 420, name: "Reports" },
];

function Modules() {
  return (
    <>
      <rect x={200} y={44} width={240} height={48} rx={8} />
      <Label x={320} y={73} anchor="middle" size={12}>
        App shell
      </Label>
      <path d="M320 92 V120 M140 120 H500 M140 120 V150 M320 120 V150 M500 120 V150" />
      {MODULE_BOXES.map(({ x, name }, i) => (
        <g key={name}>
          <rect x={x} y={150} width={160} height={56} rx={8} />
          <rect data-grow="x" style={delay(i)} x={x + 86} y={127} width={62} height={18} rx={9} />
          <Label x={x + 117} y={140} anchor="middle" size={9}>
            index
          </Label>
          <Label x={x + 80} y={190} anchor="middle" size={12}>
            {name}
          </Label>
          <Flow d={`M${x + 80} 206 V258`} dashes={6} />
        </g>
      ))}
      <rect x={60} y={258} width={520} height={48} rx={8} />
      <Label x={320} y={287} anchor="middle" size={12}>
        Design system
      </Label>
    </>
  );
}

const CANARY_BARS = [
  { y: 70, weight: 5 },
  { y: 130, weight: 25 },
  { y: 190, weight: 50 },
  { y: 250, weight: 100 },
];

function Canary() {
  return (
    <>
      {CANARY_BARS.map(({ y, weight }, i) => (
        <g key={y}>
          <Label x={130} y={y + 21} anchor="end" size={12}>
            {`${weight}%`}
          </Label>
          <rect x={150} y={y} width={380} height={30} rx={15} />
          <rect
            data-grow="x"
            style={delay(i)}
            x={154}
            y={y + 4}
            width={Math.max(22, (372 * weight) / 100)}
            height={22}
            rx={11}
            fill="currentColor"
            stroke="none"
            opacity={0.85}
          />
          {i < 3 && <circle cx={555} cy={y + 15} r={9} />}
          {i < 3 && <path d={`M551 ${y + 15} l3 3 l5 -6`} />}
        </g>
      ))}
      <Label x={340} y={318} anchor="middle" size={12}>
        Promote only on green
      </Label>
    </>
  );
}

const PAVED_OUTPUTS = [86, 136, 186, 236];

function Paved() {
  return (
    <>
      <rect x={70} y={146} width={120} height={70} rx={10} />
      <path d="M96 170 H164 M96 192 H146" opacity={0.6} />
      <Label x={130} y={250} anchor="middle" size={12}>
        Template
      </Label>
      {PAVED_OUTPUTS.map((y, i) => {
        const port = 166 + i * 10;
        return (
          <g key={y}>
            <Flow d={`M190 ${port} C230 ${port} 230 ${y + 14} 266 ${y + 14}`} dashes={9} />
            <rect
              x={266}
              y={y}
              width={120}
              height={28}
              rx={14}
              {...(i === 0 && {
                "data-grow": "x",
                fill: "currentColor",
                stroke: "none",
                opacity: 0.85,
              })}
            />
            <path d={`M386 ${y + 14} C422 ${y + 14} 410 ${port} 450 ${port}`} />
          </g>
        );
      })}
      <rect x={450} y={146} width={120} height={70} rx={10} />
      <circle cx={472} cy={168} r={5} fill="currentColor" stroke="none" />
      <path d="M488 168 H550 M470 186 H550 M470 200 H530" opacity={0.6} />
      <Label x={510} y={250} anchor="middle" size={12}>
        Service
      </Label>
    </>
  );
}

const CHAIN_LINKS = [100, 210, 320, 430, 540];

const CHAIN_NAMES = ["Source", "Deps", "Build", "Sign", "Deploy"];

function Chain() {
  return (
    <>
      {CHAIN_LINKS.map((x, i) => (
        <g key={x}>
          {i > 0 && <Flow d={`M${x - 82} 160 H${x - 28}`} dashes={6} />}
          <circle
            cx={x}
            cy={160}
            r={28}
            {...(i === 3 && { fill: "currentColor", stroke: "none", opacity: 0.85 })}
          />
          {i === 3 ? (
            <g className="text-faded-black" stroke="currentColor">
              <rect x={x - 10} y={157} width={20} height={14} rx={3} />
              <path d={`M${x - 6} 157 V151 A6 6 0 0 1 ${x + 6} 151 V157`} />
            </g>
          ) : (
            <circle cx={x} cy={160} r={6} fill="currentColor" stroke="none" />
          )}
        </g>
      ))}
      {CHAIN_LINKS.map((x, i) => (
        <Label key={x} x={x} y={222} anchor="middle" size={11}>
          {CHAIN_NAMES[i] ?? ""}
        </Label>
      ))}
      <Label x={320} y={292} anchor="middle" size={12}>
        Verified at every link
      </Label>
    </>
  );
}

function Doors() {
  return (
    <>
      <rect x={110} y={70} width={150} height={210} rx={6} />
      <path d="M110 77 L190 95 V255 L110 273" />
      <circle cx={178} cy={176} r={4} fill="currentColor" stroke="none" />
      <Flow d="M150 312 H226" dashes={8} />
      <ArrowHead x={226} y={312} />
      <ArrowHead x={146} y={312} angle={180} />
      <Label x={185} y={50} anchor="middle" size={12}>
        Two-way
      </Label>
      <rect
        data-grow="y"
        x={380}
        y={70}
        width={150}
        height={210}
        rx={6}
        fill="currentColor"
        stroke="none"
        opacity={0.85}
      />
      <circle cx={508} cy={176} r={5} stroke="none" className="fill-faded-black" opacity={0.7} />
      <Flow d="M418 312 H494" dashes={8} />
      <ArrowHead x={494} y={312} />
      <Label x={455} y={50} anchor="middle" size={12}>
        One-way
      </Label>
    </>
  );
}

const GAUGES = [
  { x: 120, y: 140, name: "Lead time", angle: -40 },
  { x: 320, y: 140, name: "Deploys", angle: 30 },
  { x: 520, y: 140, name: "Recovery", angle: -10 },
  { x: 220, y: 270, name: "Fail rate", angle: -60 },
  { x: 420, y: 270, name: "Rework", angle: -70 },
];

function Gauges() {
  return (
    <>
      {GAUGES.map(({ x, y, name, angle }, i) => (
        <g key={name}>
          <path d={`M${x - 52} ${y} A52 52 0 0 1 ${x + 52} ${y}`} />
          <path
            d={`M${x} ${y} L${x} ${y - 40}`}
            transform={`rotate(${angle} ${x} ${y})`}
            strokeWidth={3}
          />
          <circle
            cx={x}
            cy={y}
            r={6}
            fill="currentColor"
            stroke="none"
            {...(i < 3 && { "data-grow": "y", style: delay(i) })}
          />
          <Label x={x} y={y + 26} anchor="middle" size={11}>
            {name}
          </Label>
        </g>
      ))}
    </>
  );
}

const REVIEW_CHECKS = [0, 1, 2, 3];

function Review() {
  return (
    <>
      <rect x={110} y={56} width={300} height={248} rx={12} />
      <path d="M134 86 H300" />
      <path d="M134 108 H250" opacity={0.6} />
      {REVIEW_CHECKS.map((row) => {
        const y = 140 + row * 38;
        return (
          <g key={row}>
            {row < 3 ? (
              <g data-grow="y" style={delay(row)}>
                <circle cx={146} cy={y} r={11} fill="currentColor" stroke="none" opacity={0.85} />
                <path d={`M141 ${y} l4 4 l7 -8`} className="stroke-faded-black" />
              </g>
            ) : (
              <circle cx={146} cy={y} r={11} />
            )}
            {row === 3 && <circle cx={146} cy={y} r={3} fill="currentColor" stroke="none" />}
            <path d={`M170 ${y} H${row === 3 ? 300 : 370}`} opacity={0.6} />
          </g>
        );
      })}
      <Flow d="M410 180 H458" dashes={5} />
      <ArrowHead x={462} y={180} />
      <circle cx={500} cy={180} r={30} />
      <circle cx={500} cy={170} r={9} />
      <path d="M477.6 200 A22.4 16 0 0 1 522.4 200" />
      <Label x={500} y={236} anchor="middle" size={11}>
        Intent
      </Label>
      <Label x={320} y={334} anchor="middle" size={12}>
        Gates first, people last
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
