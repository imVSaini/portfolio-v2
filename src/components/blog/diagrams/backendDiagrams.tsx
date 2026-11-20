import { ArrowHead, Label } from "@/components/article/ArtParts";
import {
  Chip,
  Graph,
  Note,
  PANEL,
  PANEL_ACCENT,
  Panel,
  Remark,
  Sub,
  UpHead,
  Wire,
  type DiagramArt,
  type NodeSpec,
} from "@/components/article/DiagramParts";
import type { PostDiagramName } from "@/data/posts";

const QUEUE_PRODUCERS: NodeSpec[] = [
  {
    id: "api",
    x: 16,
    y: 152,
    w: 172,
    h: 52,
    label: "API",
    sub: "Same transaction",
    icon: "server",
  },
  {
    id: "scheduler",
    x: 16,
    y: 216,
    w: 172,
    h: 52,
    label: "Scheduler",
    sub: "Inserts due jobs",
    icon: "clock",
  },
];

const JOBS = [
  { id: "1041", kind: "send_invoice", by: "W1" },
  { id: "1042", kind: "sync_crm", by: "W2" },
  { id: "1043", kind: "resize_image", by: "W3" },
  { id: "1044", kind: "send_invoice", by: "" },
  { id: "1045", kind: "sync_crm", by: "" },
  { id: "1046", kind: "export_csv", by: "" },
];

const QUEUE_WORKERS = [40, 120, 200];

function jobCentre(index: number) {
  return 70 + index * 32 + 12;
}

function SkipLocked() {
  return (
    <>
      <Graph nodes={QUEUE_PRODUCERS} links={[]} />
      <Panel x={222} y={16} w={246} h={262} title="Jobs table" meta="Postgres" />
      {JOBS.map(({ id, kind, by }, i) => {
        const y = 70 + i * 32;
        return (
          <g key={id} data-d="bar">
            <rect
              x={238}
              y={y}
              width={214}
              height={24}
              rx={7}
              strokeWidth={1.5}
              className={by ? PANEL_ACCENT : PANEL}
            />
            <Sub x={250} y={y + 16}>
              {`#${id} · ${kind}`}
            </Sub>
            {by ? (
              <Label x={440} y={y + 16} anchor="end" size={9}>
                {`Locked · ${by}`}
              </Label>
            ) : (
              <Sub x={440} y={y + 16} anchor="end">
                ready
              </Sub>
            )}
          </g>
        );
      })}
      <Remark x={16} y={84}>
        A job is inserted in the same
      </Remark>
      <Remark x={16} y={102}>
        commit as the data it is about,
      </Remark>
      <Remark x={16} y={120}>
        so neither exists without the other.
      </Remark>
      <Wire d={`M188 ${jobCentre(3)} H220`}>
        <ArrowHead x={220} y={jobCentre(3)} />
      </Wire>
      <Wire d={`M188 ${jobCentre(5)} H220`} dashed>
        <ArrowHead x={220} y={jobCentre(5)} />
      </Wire>
      <Graph
        nodes={QUEUE_WORKERS.map((y, i) => ({
          id: `worker${i}`,
          x: 544,
          y,
          w: 160,
          label: `Worker ${i + 1}`,
          sub: "Skip locked rows",
          icon: "refresh",
        }))}
        links={[]}
      />
      {QUEUE_WORKERS.map((y, i) => {
        const from = y + 28;
        const to = jobCentre(i);
        return (
          <Wire key={y} d={`M544 ${from} C516 ${from} 516 ${to} 487 ${to} H475`}>
            <ArrowHead x={475} y={to} angle={180} />
          </Wire>
        );
      })}
      <Note x={360} y={304} anchor="middle">
        Each worker claims a different row. Nobody waits, nobody runs a job twice.
      </Note>
    </>
  );
}

const WORKLOADS = [
  {
    name: "Job queue",
    feature: "SKIP LOCKED",
    reach: 330,
    next: "Many consumers replay one stream: a log such as Kafka",
  },
  {
    name: "Search",
    feature: "tsvector + GIN",
    reach: 270,
    next: "Relevance tuning, facets, typo tolerance: a search engine",
  },
  {
    name: "Vectors",
    feature: "pgvector + HNSW",
    reach: 250,
    next: "Huge indexes under heavy filtered load: a vector store",
  },
  {
    name: "Documents",
    feature: "jsonb + GIN",
    reach: 300,
    next: "Schema-free writes at very high volume: a document store",
  },
  {
    name: "Analytics",
    feature: "Materialized views",
    reach: 180,
    next: "Scans over billions of rows: a columnar warehouse",
  },
];

function PostgresEnvelope() {
  return (
    <>
      <Note x={16} y={24}>
        Workload
      </Note>
      <Note x={150} y={24}>
        Postgres covers it
      </Note>
      <Note x={704} y={24} anchor="end">
        Graduate when
      </Note>
      {WORKLOADS.map(({ name, feature, reach, next }, i) => {
        const y = 44 + i * 58;
        return (
          <g key={name}>
            <Note x={16} y={y + 17}>
              {name}
            </Note>
            <rect
              data-d="fade"
              x={150}
              y={y}
              width={554}
              height={26}
              rx={13}
              strokeWidth={1.5}
              strokeDasharray="5 5"
              className="stroke-line-strong"
            />
            <g data-d="bar" className="text-faded-black">
              <rect
                x={150}
                y={y}
                width={reach}
                height={26}
                rx={13}
                strokeWidth={1.5}
                className="fill-accent stroke-accent"
              />
              <Label x={166} y={y + 17} size={9}>
                {feature}
              </Label>
            </g>
            <Remark x={704} y={y + 44} anchor="end">
              {next}
            </Remark>
          </g>
        );
      })}
      <Note x={360} y={344} anchor="middle">
        Each move adds a system to run, secure and sync. Make it when a number forces you.
      </Note>
    </>
  );
}

const LANE_NAMES = ["Report query", "ALTER TABLE", "New queries"];

/** Top of each lane in the two panels, 36 apart. */
const BEFORE = { report: 72, alter: 108, queries: 144 };

const AFTER = { report: 260, alter: 296, queries: 332 };

function LaneLabels({ top }: { top: number }) {
  return (
    <g data-d="fade">
      {LANE_NAMES.map((label, i) => (
        <Sub key={label} x={32} y={top + i * 36 + 15}>
          {label}
        </Sub>
      ))}
    </g>
  );
}

const SPAN_TONES = {
  plain: PANEL,
  accent: "fill-accent stroke-accent",
  wait: "stroke-line-strong",
  queued: "fill-red/15 stroke-red",
} as const;

type SpanProps = {
  x1: number;
  x2: number;
  y: number;
  tone: keyof typeof SPAN_TONES;
  children?: string;
};

function Span({ x1, x2, y, tone, children }: SpanProps) {
  return (
    <g data-d="bar">
      <rect
        x={x1}
        y={y}
        width={x2 - x1}
        height={22}
        rx={6}
        strokeWidth={1.5}
        {...((tone === "wait" || tone === "queued") && { strokeDasharray: "5 5" })}
        className={SPAN_TONES[tone]}
      />
      {children && (
        <Sub x={x1 + 8} y={y + 15}>
          {children}
        </Sub>
      )}
    </g>
  );
}

function LockQueue() {
  return (
    <>
      <Panel x={16} y={16} w={688} h={172} title="Without lock_timeout" meta="Everyone waits" />
      <LaneLabels top={BEFORE.report} />
      <Span x1={200} x2={560} y={BEFORE.report} tone="plain">
        Holds ACCESS SHARE for minutes
      </Span>
      <Span x1={250} x2={560} y={BEFORE.alter} tone="wait">
        Waits for ACCESS EXCLUSIVE
      </Span>
      <Span x1={560} x2={594} y={BEFORE.alter} tone="accent" />
      <Span x1={262} x2={594} y={BEFORE.queries} tone="queued">
        Queued behind the ALTER: the outage
      </Span>
      <Span x1={602} x2={630} y={BEFORE.queries} tone="accent" />
      <Span x1={638} x2={666} y={BEFORE.queries} tone="accent" />

      <Panel
        x={16}
        y={204}
        w={688}
        h={164}
        title="With lock_timeout = 2s"
        meta="The migration waits, not users"
        accent
      />
      <LaneLabels top={AFTER.report} />
      <Span x1={200} x2={560} y={AFTER.report} tone="plain">
        Holds ACCESS SHARE for minutes
      </Span>
      <Span x1={250} x2={300} y={AFTER.alter} tone="wait" />
      <path
        data-d="fade"
        d={`M300 ${AFTER.alter + 5} l12 12 M312 ${AFTER.alter + 5} l-12 12`}
        strokeWidth={2}
        className="stroke-red"
      />
      <Remark x={322} y={AFTER.alter + 15}>
        Gives up, retries in a minute
      </Remark>
      <Span x1={600} x2={634} y={AFTER.alter} tone="accent" />
      {Array.from({ length: 10 }, (_, k) => (
        <Span key={k} x1={262 + k * 44} x2={292 + k * 44} y={AFTER.queries} tone="accent" />
      ))}
    </>
  );
}

const PHASES = [
  { name: "Add", sub: "Nullable column" },
  { name: "Dual write", sub: "Old and new" },
  { name: "Backfill", sub: "Batches of 1,000" },
  { name: "Read new", sub: "Behind a flag" },
  { name: "Write new", sub: "Old goes quiet" },
  { name: "Drop old", sub: "Contract" },
];

const WRITES = ["Old", "Old + new", "Old + new", "Old + new", "New", "New"];

const READS = ["Old", "Old", "Old", "New", "New", "New"];

function chipTone(value: string) {
  if (value === "New") return "accent";
  if (value === "Old") return "plain";
  return "ghost";
}

function ExpandContract() {
  return (
    <>
      {PHASES.map(({ name, sub }, i) => {
        const x = 96 + i * 102;
        return (
          <g key={name}>
            <g data-d="node">
              <rect
                x={x}
                y={16}
                width={92}
                height={80}
                rx={12}
                strokeWidth={1.5}
                className={i === PHASES.length - 1 ? PANEL_ACCENT : PANEL}
              />
              <Sub x={x + 46} y={36} anchor="middle">
                {`Deploy ${i + 1}`}
              </Sub>
              <Label x={x + 46} y={58} anchor="middle" size={10}>
                {name}
              </Label>
              <Sub x={x + 46} y={78} anchor="middle">
                {sub}
              </Sub>
            </g>
            <Chip x={x} y={112} w={92} label={WRITES[i] ?? ""} tone={chipTone(WRITES[i] ?? "")} />
            <Chip x={x} y={148} w={92} label={READS[i] ?? ""} tone={chipTone(READS[i] ?? "")} />
          </g>
        );
      })}
      <Note x={16} y={128}>
        Writes
      </Note>
      <Note x={16} y={164}>
        Reads
      </Note>
      <path
        data-d="fade"
        d="M96 196 H698"
        strokeWidth={1.5}
        strokeDasharray="5 5"
        className="stroke-accent motion-safe:animate-dash-flow"
      />
      <Note x={397} y={220} anchor="middle">
        Neighbouring steps run side by side, so every deploy can roll back
      </Note>
    </>
  );
}

const RAG_NODES: NodeSpec[] = [
  { id: "docs", x: 16, y: 36, w: 120, h: 84, label: "Documents", icon: "doc", stack: true },
  { id: "chunk", x: 158, y: 36, w: 120, h: 84, label: "Chunk", icon: "list", stack: true },
  { id: "embed", x: 300, y: 36, w: 120, h: 84, label: "Embed", icon: "spark", stack: true },
  {
    id: "store",
    x: 442,
    y: 36,
    w: 120,
    h: 84,
    label: "pgvector",
    icon: "db",
    stack: true,
    accent: true,
  },
  { id: "question", x: 16, y: 176, w: 120, h: 84, label: "Question", icon: "users", stack: true },
  {
    id: "search",
    x: 158,
    y: 176,
    w: 120,
    h: 84,
    label: "Hybrid search",
    icon: "route",
    stack: true,
  },
  { id: "rerank", x: 300, y: 176, w: 120, h: 84, label: "Rerank", icon: "chart", stack: true },
  { id: "prompt", x: 442, y: 176, w: 120, h: 84, label: "Prompt", icon: "doc", stack: true },
  {
    id: "model",
    x: 584,
    y: 176,
    w: 120,
    h: 84,
    label: "Model",
    icon: "spark",
    stack: true,
    accent: true,
  },
];

function RagPipeline() {
  return (
    <>
      <Note x={16} y={24}>
        Ingest, when a document changes
      </Note>
      <Note x={16} y={168}>
        Answer, on every question
      </Note>
      <Graph
        nodes={RAG_NODES}
        links={[
          { from: "docs", to: "chunk" },
          { from: "chunk", to: "embed" },
          { from: "embed", to: "store" },
          { from: "store", to: "search", dashed: true },
          { from: "question", to: "search" },
          { from: "search", to: "rerank" },
          { from: "rerank", to: "prompt" },
          { from: "prompt", to: "model" },
        ]}
      />
      <Remark x={584} y={66}>
        Keyword index
      </Remark>
      <Remark x={584} y={84}>
        and vectors share
      </Remark>
      <Remark x={584} y={102}>
        one tenant filter
      </Remark>
      <Remark x={16} y={292}>
        Every chunk keeps its tenant_id and source; search filters by tenant before it ranks.
      </Remark>
      <Remark x={16} y={312}>
        The answer cites the chunks it used, so a wrong answer traces back to a wrong source.
      </Remark>
    </>
  );
}

const TOOL_NODES: NodeSpec[] = [
  { id: "user", x: 16, y: 40, w: 130, label: "User", sub: "Asks in words", icon: "users" },
  {
    id: "model",
    x: 170,
    y: 40,
    w: 150,
    label: "Model",
    sub: "Proposes a call",
    icon: "spark",
    accent: true,
  },
  {
    id: "validate",
    x: 344,
    y: 40,
    w: 180,
    label: "Validate",
    sub: "Schema, tenant, role",
    icon: "shield",
  },
  { id: "confirm", x: 548, y: 40, w: 156, label: "Confirm", sub: "Writes only", icon: "check" },
  {
    id: "execute",
    x: 548,
    y: 176,
    w: 156,
    label: "Execute",
    sub: "Typed function",
    icon: "server",
  },
];

function ToolLoop() {
  return (
    <>
      <Graph
        nodes={TOOL_NODES}
        links={[
          { from: "user", to: "model" },
          { from: "model", to: "validate" },
          { from: "validate", to: "confirm" },
          { from: "confirm", to: "execute" },
        ]}
      />
      <Wire d="M434 96 V118 Q434 126 426 126 H288 Q280 126 280 118 V100" dashed>
        <UpHead x={280} y={98} />
      </Wire>
      <Remark x={358} y={146} anchor="middle">
        Invalid calls return as errors
      </Remark>
      <Wire d="M548 204 H218 Q210 204 210 196 V100">
        <UpHead x={210} y={98} />
      </Wire>
      <Remark x={380} y={196} anchor="middle">
        The result goes back as data
      </Remark>
      <Note x={16} y={252}>
        Stops at an answer, a refusal or six steps
      </Note>
      <Remark x={16} y={274}>
        Every call is logged with tenant, arguments, result, latency and cost.
      </Remark>
    </>
  );
}

export const backendDiagrams = {
  skipLocked: { height: 316, Art: SkipLocked },
  postgresEnvelope: { height: 358, Art: PostgresEnvelope },
  lockQueue: { height: 382, Art: LockQueue },
  expandContract: { height: 236, Art: ExpandContract },
  ragPipeline: { height: 324, Art: RagPipeline },
  toolLoop: { height: 288, Art: ToolLoop },
} satisfies Partial<Record<PostDiagramName, DiagramArt>>;
