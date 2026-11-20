import { ArrowHead, Label } from "@/components/article/ArtParts";
import {
  DownHead,
  Graph,
  Joint,
  Note,
  PANEL,
  PANEL_ACCENT,
  Panel,
  Remark,
  Sub,
  Wire,
  Zone,
  type DiagramArt,
  type NodeSpec,
} from "@/components/article/DiagramParts";
import type { PostDiagramName } from "@/data/posts";
import { cn } from "@/lib/cn";

function Cross({ x, y }: { x: number; y: number }) {
  return (
    <path
      data-d="fade"
      d={`M${x - 6} ${y - 6} l12 12 M${x + 6} ${y - 6} l-12 12`}
      strokeWidth={2}
      className="stroke-red"
    />
  );
}

const CELL_PATH_NODES: NodeSpec[] = [
  {
    id: "control",
    x: 190,
    y: 16,
    w: 166,
    label: "Control plane",
    sub: "Off the request path",
    icon: "layers",
  },
  { id: "map", x: 190, y: 116, w: 166, label: "Cell map", sub: "Tenant → cell", icon: "list" },
  { id: "clients", x: 16, y: 216, w: 150, label: "Clients", sub: "Tenant in token", icon: "globe" },
  {
    id: "router",
    x: 190,
    y: 216,
    w: 166,
    label: "Cell router",
    sub: "Thin, stateless",
    icon: "route",
    accent: true,
  },
];

const CELLS = [
  { y: 16, label: "Cell 1 · tenants 1–400", failing: false },
  { y: 124, label: "Cell 2 · tenants 401–800", failing: true },
  { y: 232, label: "Cell 3 · tenants 801–1,200", failing: false },
];

const CELL_PARTS = [
  { dx: 12, label: "API", icon: "server" },
  { dx: 106, label: "Jobs", icon: "refresh" },
  { dx: 200, label: "DB", icon: "db" },
] as const;

function CellRouter() {
  return (
    <>
      <Graph
        nodes={CELL_PATH_NODES}
        links={[
          { from: "control", to: "map", dashed: true },
          { from: "map", to: "router" },
          { from: "clients", to: "router" },
        ]}
      />
      {CELLS.map(({ y, label, failing }) => {
        const centre = y + 57;
        return (
          <g key={label}>
            <Zone
              x={400}
              y={y}
              w={304}
              h={92}
              label={label}
              meta={failing ? "Failing" : "Healthy"}
              {...(failing && { className: "stroke-red" })}
            />
            <g opacity={failing ? 0.4 : 1}>
              <Graph
                nodes={CELL_PARTS.map((part) => ({
                  id: `${label}-${part.label}`,
                  x: 400 + part.dx,
                  y: y + 34,
                  w: 88,
                  h: 46,
                  label: part.label,
                  icon: part.icon,
                }))}
                links={[]}
              />
            </g>
            <Wire
              d={`M356 244 C377 244 377 ${centre} 388 ${centre} H398`}
              {...(failing && { className: "stroke-red text-red" })}
            >
              <ArrowHead x={398} y={centre} />
            </Wire>
          </g>
        );
      })}
      <Note x={360} y={352} anchor="middle">
        A bad deploy or a poison tenant takes down one cell, not the service
      </Note>
    </>
  );
}

const TENANTS = [
  { x: 16, name: "Tenant A", workers: [0, 3], poison: false },
  { x: 196, name: "Tenant B", workers: [1, 5], poison: false },
  { x: 376, name: "Tenant C", workers: [3, 6], poison: true },
  { x: 556, name: "Tenant D", workers: [2, 7], poison: false },
];

const WORKERS = Array.from({ length: 8 }, (_, i) => i);

const DOWN_WORKERS = new Set([3, 6]);

function workerCentre(index: number) {
  return 16 + index * 87 + 38;
}

function ShuffleShards() {
  return (
    <>
      <Graph
        nodes={TENANTS.map(({ x, name, workers, poison }) => ({
          id: name,
          x,
          y: 16,
          w: 148,
          label: name,
          sub: poison ? "Poison request" : `Workers ${workers.map((w) => w + 1).join(" · ")}`,
          icon: "users",
          accent: poison,
        }))}
        links={[]}
      />
      {TENANTS.flatMap(({ x, name, workers, poison }) =>
        workers.map((worker) => {
          const from = x + 74;
          const to = workerCentre(worker);
          return (
            <Wire
              key={`${name}-${worker}`}
              d={`M${from} 72 C${from} 110 ${to} 110 ${to} 148`}
              {...(poison && { className: "stroke-red text-red" })}
            >
              <DownHead x={to} y={148} />
            </Wire>
          );
        }),
      )}
      {WORKERS.map((worker) => (
        <g key={worker} opacity={DOWN_WORKERS.has(worker) ? 0.4 : 1}>
          <Graph
            nodes={[
              {
                id: `w${worker}`,
                x: 16 + worker * 87,
                y: 150,
                w: 76,
                h: 70,
                label: `W${worker + 1}`,
                icon: "server",
                stack: true,
              },
            ]}
            links={[]}
          />
        </g>
      ))}
      {[...DOWN_WORKERS].map((worker) => (
        <Cross key={worker} x={workerCentre(worker) + 28} y={160} />
      ))}
      <Note x={360} y={254} anchor="middle">
        8 workers, 2 per tenant: 28 possible shards
      </Note>
      <Remark x={360} y={276} anchor="middle">
        Tenant C takes out workers 4 and 7. Tenant A still has worker 1; B and D never notice.
      </Remark>
    </>
  );
}

const SPRAWL_NODES: NodeSpec[] = [
  { id: "api", x: 16, y: 16, w: 150, label: "API", sub: "Starts the order", icon: "server" },
  { id: "queue", x: 188, y: 16, w: 150, label: "Queue", sub: "At-least-once", icon: "list" },
  { id: "worker", x: 360, y: 16, w: 160, label: "Worker", sub: "Calls each step", icon: "refresh" },
  { id: "vendor", x: 542, y: 16, w: 162, label: "Payment API", sub: "Can time out", icon: "card" },
  { id: "cron", x: 16, y: 136, w: 150, label: "Cron", sub: "Finds stuck rows", icon: "clock" },
  {
    id: "status",
    x: 360,
    y: 136,
    w: 160,
    label: "Status table",
    sub: "Hand-written states",
    icon: "db",
    accent: true,
  },
  {
    id: "dlq",
    x: 542,
    y: 136,
    w: 162,
    label: "Dead letters",
    sub: "Failed for good",
    icon: "mail",
  },
  {
    id: "compensate",
    x: 360,
    y: 256,
    w: 160,
    label: "Compensator",
    sub: "Undoes half-done",
    icon: "refresh",
  },
  { id: "oncall", x: 542, y: 256, w: 162, label: "On-call", sub: "Reads a runbook", icon: "users" },
];

function WorkflowSprawl() {
  return (
    <>
      <Graph
        nodes={SPRAWL_NODES}
        links={[
          { from: "api", to: "queue" },
          { from: "queue", to: "worker" },
          { from: "worker", to: "vendor" },
          { from: "worker", to: "status", fromX: 420, toX: 420 },
          { from: "worker", to: "dlq", dashed: true, down: true, fromX: 496, toX: 623 },
          { from: "cron", to: "status", dashed: true },
          { from: "status", to: "compensate", dashed: true },
          { from: "dlq", to: "oncall", dashed: true },
        ]}
      />
      <Note x={360} y={346} anchor="middle">
        Five moving parts share one business process, and none of them sees all of it
      </Note>
    </>
  );
}

const STEPS = ["Reserve stock", "Charge card", "Create shipment", "Email receipt"];

const JOURNAL = ["Reserved", "ch_8f2", "", ""];

type RowState = "done" | "crash" | "idle" | "replayed" | "running";

const RUNS: { x: number; title: string; meta: string; states: RowState[] }[] = [
  { x: 16, title: "First run", meta: "Worker dies", states: ["done", "done", "crash", "idle"] },
  {
    x: 486,
    title: "After restart",
    meta: "Same code",
    states: ["replayed", "replayed", "running", "idle"],
  },
];

const STATE_NOTE: Record<RowState, string> = {
  done: "done",
  crash: "crash",
  idle: "",
  replayed: "replayed",
  running: "runs now",
};

function rowClass(state: RowState) {
  if (state === "running") return PANEL_ACCENT;
  if (state === "crash") return "fill-red/15 stroke-red";
  return PANEL;
}

function JournalReplay() {
  return (
    <>
      {RUNS.map(({ x, title, meta, states }) => (
        <g key={title}>
          <Panel x={x} y={16} w={218} h={222} title={title} meta={meta} />
          {STEPS.map((step, i) => {
            const state = states[i] ?? "idle";
            const y = 72 + i * 40;
            return (
              <g
                key={step}
                data-d="bar"
                opacity={state === "replayed" ? 0.55 : 1}
                className={cn(state === "crash" && "text-red")}
              >
                <rect
                  x={x + 16}
                  y={y}
                  width={186}
                  height={30}
                  rx={8}
                  strokeWidth={1.5}
                  {...(state === "idle" && { strokeDasharray: "5 5" })}
                  className={state === "idle" ? "stroke-line-strong" : rowClass(state)}
                />
                <Label x={x + 28} y={y + 19.5} size={10}>
                  {step}
                </Label>
                <Sub x={x + 192} y={y + 19} anchor="end">
                  {STATE_NOTE[state]}
                </Sub>
              </g>
            );
          })}
        </g>
      ))}
      <Panel x={251} y={16} w={218} h={222} title="Journal" meta="Postgres" accent />
      {STEPS.map((step, i) => {
        const y = 72 + i * 40;
        const value = JOURNAL[i] ?? "";
        return (
          <g key={step} data-d="bar">
            <rect
              x={267}
              y={y}
              width={186}
              height={30}
              rx={8}
              strokeWidth={1.5}
              {...(!value && { strokeDasharray: "5 5" })}
              className={value ? PANEL : "stroke-line-strong"}
            />
            <Label x={279} y={y + 19.5} size={10}>
              {`Step ${i + 1}`}
            </Label>
            {value && (
              <Sub x={441} y={y + 19} anchor="end">
                {value}
              </Sub>
            )}
          </g>
        );
      })}
      {[236, 471].map((x) => (
        <Joint key={x} x1={x - 2} y1={127} x2={x + 15} y2={127} />
      ))}
      <Note x={360} y={264} anchor="middle">
        Finished steps return their recorded result. The card is charged once.
      </Note>
    </>
  );
}

const BASE_LOAD = [64, 64, 66, 64, 64, 62, 64, 64];

const BUDGETS = [
  {
    x: 16,
    title: "Without a budget",
    meta: "Every layer retries 3×",
    retries: [0, 0, 0, 36, 64, 86, 96, 96],
    tone: "fill-red/40 stroke-red",
    remark: "Retries add load exactly when there is least to spare.",
  },
  {
    x: 370,
    title: "With a retry budget",
    meta: "Retries ≤ 10%",
    retries: [0, 0, 0, 6, 6, 6, 6, 6],
    tone: "fill-accent stroke-accent",
    remark: "Load stays under capacity while the dependency recovers.",
  },
];

const LOAD_AXIS = 236;

const CAPACITY = 110;

function RetryBudget() {
  return (
    <>
      {BUDGETS.map(({ x, title, meta, retries, tone, remark }) => (
        <g key={title}>
          <Panel x={x} y={16} w={334} h={256} title={title} meta={meta} />
          {BASE_LOAD.map((base, i) => {
            const retry = retries[i] ?? 0;
            const bx = x + 28 + i * 36;
            return (
              <g key={i}>
                <rect
                  data-d="rise"
                  x={bx}
                  y={LOAD_AXIS - base}
                  width={24}
                  height={base}
                  rx={3}
                  strokeWidth={1.5}
                  className={PANEL}
                />
                {retry > 0 && (
                  <rect
                    data-d="rise"
                    x={bx}
                    y={LOAD_AXIS - base - retry}
                    width={24}
                    height={retry}
                    rx={3}
                    strokeWidth={1.5}
                    className={tone}
                  />
                )}
              </g>
            );
          })}
          <path
            d={`M${x + 16} ${LOAD_AXIS} H${x + 318}`}
            strokeWidth={1.5}
            className="stroke-line-strong"
          />
          <path
            data-d="fade"
            d={`M${x + 16} ${LOAD_AXIS - CAPACITY} H${x + 318}`}
            strokeWidth={1.5}
            strokeDasharray="5 5"
            className="stroke-accent motion-safe:animate-dash-flow"
          />
          <Remark x={x + 22} y={LOAD_AXIS - CAPACITY - 8}>
            Capacity
          </Remark>
          <path
            data-d="fade"
            d={`M${x + 130} 66 V${LOAD_AXIS}`}
            strokeWidth={1}
            strokeDasharray="2 4"
          />
          <Remark x={x + 136} y={74}>
            Dependency slows
          </Remark>
          <Remark x={x + 16} y={258}>
            {remark}
          </Remark>
        </g>
      ))}
    </>
  );
}

const LEVELS = [
  { name: "Normal", served: "Everything", off: "Nothing" },
  {
    name: "Shed extras",
    served: "Core pages with live data",
    off: "Recommendations, exports, previews",
  },
  {
    name: "Serve stale",
    served: "Reads from cache, writes queued",
    off: "Live counts and search suggestions",
  },
  {
    name: "Core only",
    served: "Sign-in, checkout, status page",
    off: "Everything else: 503 with Retry-After",
  },
];

function DegradeLadder() {
  return (
    <>
      <Note x={72} y={30}>
        Level
      </Note>
      <Note x={240} y={30}>
        Still served
      </Note>
      <Note x={476} y={30}>
        Switched off
      </Note>
      {LEVELS.map(({ name, served, off }, i) => {
        const y = 44 + i * 60;
        return (
          <g key={name}>
            <g data-d="bar">
              <rect
                x={56}
                y={y}
                width={648}
                height={48}
                rx={10}
                strokeWidth={1.5}
                className={i === LEVELS.length - 1 ? PANEL_ACCENT : PANEL}
              />
            </g>
            <g data-d="fade">
              <Label x={72} y={y + 28} size={10}>
                {`${i} · ${name}`}
              </Label>
              <Sub x={240} y={y + 28}>
                {served}
              </Sub>
              <Sub x={476} y={y + 28}>
                {off}
              </Sub>
            </g>
          </g>
        );
      })}
      <Wire d="M30 50 V266">
        <DownHead x={30} y={268} />
      </Wire>
      <Remark x={16} y={300}>
        Pressure rises downwards. Each level is a flag on-call can flip by hand, and a trigger can
        flip without them.
      </Remark>
    </>
  );
}

export const architectureDiagrams = {
  cellRouter: { height: 364, Art: CellRouter },
  shuffleShards: { height: 290, Art: ShuffleShards },
  workflowSprawl: { height: 360, Art: WorkflowSprawl },
  journalReplay: { height: 278, Art: JournalReplay },
  retryBudget: { height: 288, Art: RetryBudget },
  degradeLadder: { height: 314, Art: DegradeLadder },
} satisfies Partial<Record<PostDiagramName, DiagramArt>>;
