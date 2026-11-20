import { ArrowHead, Label } from "@/components/article/ArtParts";
import {
  Bar,
  Graph,
  Note,
  PANEL,
  PANEL_ACCENT,
  Remark,
  Sub,
  UpHead,
  Wire,
  Zone,
  type DiagramArt,
  type NodeSpec,
} from "@/components/article/DiagramParts";
import type { PostDiagramName } from "@/data/posts";

const QUADRANTS = [
  {
    x: 120,
    y: 16,
    title: "Announce, then decide",
    accent: false,
    dots: [
      { x: 152, y: 76, label: "Log format" },
      { x: 250, y: 104, label: "Shared CI template" },
    ],
  },
  {
    x: 416,
    y: 16,
    title: "RFC and ADR",
    accent: true,
    dots: [
      { x: 448, y: 76, label: "Tenancy model" },
      { x: 560, y: 104, label: "Primary datastore" },
    ],
  },
  {
    x: 120,
    y: 140,
    title: "Decide in the PR",
    accent: false,
    dots: [
      { x: 152, y: 200, label: "Form library" },
      { x: 250, y: 228, label: "Retry count" },
    ],
  },
  {
    x: 416,
    y: 140,
    title: "Short design note",
    accent: false,
    dots: [
      { x: 448, y: 200, label: "Table schema" },
      { x: 560, y: 228, label: "Service boundary" },
    ],
  },
];

function DoorTest() {
  return (
    <>
      {QUADRANTS.map(({ x, y, title, accent, dots }) => (
        <g key={title}>
          <g data-d="node">
            <rect
              x={x}
              y={y}
              width={288}
              height={116}
              rx={12}
              strokeWidth={1.5}
              className={accent ? PANEL_ACCENT : PANEL}
            />
            <Label x={x + 16} y={y + 26} size={10}>
              {title}
            </Label>
          </g>
          {dots.map((dot) => (
            <g key={dot.label} data-d="fade">
              <circle
                cx={dot.x}
                cy={dot.y}
                r={5}
                stroke="none"
                className={accent ? "fill-accent" : "fill-current"}
              />
              <Sub x={dot.x + 12} y={dot.y + 4}>
                {dot.label}
              </Sub>
            </g>
          ))}
        </g>
      ))}
      <Note x={16} y={78}>
        Org-wide
      </Note>
      <Note x={16} y={202}>
        One team
      </Note>
      <Wire d="M120 270 H704">
        <ArrowHead x={704} y={270} />
      </Wire>
      <Note x={120} y={292}>
        Cheap to undo
      </Note>
      <Note x={704} y={292} anchor="end">
        Expensive to undo
      </Note>
    </>
  );
}

const RFC_NODES: NodeSpec[] = [
  {
    id: "question",
    x: 16,
    y: 16,
    w: 300,
    label: "Two-way door?",
    sub: "Cheap to undo, one team affected",
    icon: "flag",
  },
  {
    id: "pr",
    x: 404,
    y: 16,
    w: 300,
    label: "Decide in the PR",
    sub: "Say why in the description",
    icon: "branch",
  },
  { id: "draft", x: 16, y: 120, w: 120, h: 84, label: "Draft RFC", icon: "doc", stack: true },
  { id: "review", x: 158, y: 120, w: 120, h: 84, label: "Review", icon: "users", stack: true },
  { id: "decide", x: 300, y: 120, w: 120, h: 84, label: "Decide", icon: "check", stack: true },
  {
    id: "adr",
    x: 442,
    y: 120,
    w: 120,
    h: 84,
    label: "ADR",
    icon: "list",
    stack: true,
    accent: true,
  },
  { id: "revisit", x: 584, y: 120, w: 120, h: 84, label: "Revisit", icon: "clock", stack: true },
];

const RFC_NOTES = [
  "Problem, options, cost",
  "Async, five days",
  "One owner decides",
  "Merged beside code",
  "A named trigger",
];

function RfcFlow() {
  return (
    <>
      <Graph
        nodes={RFC_NODES}
        links={[
          { from: "question", to: "pr" },
          { from: "question", to: "draft", fromX: 76, toX: 76 },
          { from: "draft", to: "review" },
          { from: "review", to: "decide" },
          { from: "decide", to: "adr" },
          { from: "adr", to: "revisit" },
        ]}
      />
      <Note x={360} y={34} anchor="middle">
        Yes
      </Note>
      <Note x={86} y={100}>
        No
      </Note>
      {RFC_NOTES.map((note, i) => (
        <Remark key={note} x={76 + i * 142} y={222} anchor="middle">
          {note}
        </Remark>
      ))}
      <Wire d="M644 232 V252 Q644 260 636 260 H84 Q76 260 76 252 V236" dashed>
        <UpHead x={76} y={234} />
      </Wire>
      <Remark x={360} y={284} anchor="middle">
        When the trigger fires, a new ADR supersedes the old one and links back to it.
      </Remark>
    </>
  );
}

const THROUGHPUT: NodeSpec[] = [
  {
    id: "lead",
    x: 32,
    y: 50,
    w: 400,
    h: 48,
    label: "Lead time",
    sub: "Commit to production",
    icon: "clock",
  },
  {
    id: "frequency",
    x: 32,
    y: 108,
    w: 400,
    h: 48,
    label: "Deploy frequency",
    sub: "Deploys per service, per day",
    icon: "refresh",
  },
  {
    id: "recovery",
    x: 32,
    y: 166,
    w: 400,
    h: 48,
    label: "Recovery time",
    sub: "Failed deploy to restored service",
    icon: "bolt",
  },
];

const INSTABILITY: NodeSpec[] = [
  {
    id: "fail",
    x: 480,
    y: 50,
    w: 208,
    h: 48,
    label: "Change fail rate",
    sub: "Deploys needing a fix",
    icon: "shield",
    accent: true,
  },
  {
    id: "rework",
    x: 480,
    y: 108,
    w: 208,
    h: 48,
    label: "Rework rate",
    sub: "Unplanned fix deploys",
    icon: "refresh",
    accent: true,
  },
];

function DoraMetrics() {
  return (
    <>
      <Zone x={16} y={16} w={432} h={210} label="Throughput" meta="How fast" />
      <Zone x={464} y={16} w={240} h={210} label="Instability" meta="How safely" />
      <Graph nodes={[...THROUGHPUT, ...INSTABILITY]} links={[]} />
      <Remark x={480} y={186}>
        Read all five together, per
      </Remark>
      <Remark x={480} y={202}>
        service, never per person.
      </Remark>
      <Note x={360} y={258} anchor="middle">
        Speed without stability is just faster incidents
      </Note>
    </>
  );
}

const AMPLIFIER_NODES: NodeSpec[] = [
  {
    id: "ai",
    x: 16,
    y: 102,
    w: 120,
    h: 84,
    label: "AI assistant",
    icon: "spark",
    stack: true,
    accent: true,
  },
  {
    id: "smallA",
    x: 186,
    y: 36,
    w: 150,
    label: "Small PRs",
    sub: "Under 400 lines",
    icon: "branch",
  },
  { id: "ciA", x: 358, y: 36, w: 172, label: "Fast CI", sub: "Minutes, not hours", icon: "check" },
  {
    id: "resultA",
    x: 552,
    y: 36,
    w: 152,
    label: "Ships more",
    sub: "Stability holds",
    icon: "chart",
    accent: true,
  },
  { id: "largeB", x: 186, y: 196, w: 150, label: "Large PRs", sub: "Huge diffs", icon: "branch" },
  {
    id: "queueB",
    x: 358,
    y: 196,
    w: 172,
    label: "Review queue",
    sub: "Days to merge",
    icon: "clock",
  },
  {
    id: "resultB",
    x: 552,
    y: 196,
    w: 152,
    label: "Breaks more",
    sub: "Rework rises",
    icon: "bolt",
  },
];

function AiAmplifier() {
  return (
    <>
      <Note x={186} y={24}>
        Team A: loose coupling, fast feedback
      </Note>
      <Note x={186} y={184}>
        Team B: tight coupling, slow review
      </Note>
      <Graph
        nodes={AMPLIFIER_NODES}
        links={[
          { from: "ai", to: "smallA" },
          { from: "smallA", to: "ciA" },
          { from: "ciA", to: "resultA" },
          { from: "ai", to: "largeB" },
          { from: "largeB", to: "queueB" },
          { from: "queueB", to: "resultB", dashed: true },
        ]}
      />
      <Remark x={16} y={288}>
        DORA 2025: AI use now tracks higher throughput, and it still tracks higher instability.
      </Remark>
    </>
  );
}

const GATES: Pick<NodeSpec, "label" | "sub" | "icon">[] = [
  { label: "Types", sub: "Strict compiler", icon: "check" },
  { label: "Lint", sub: "Rules and format", icon: "list" },
  { label: "Tests", sub: "Unit and end-to-end", icon: "refresh" },
  { label: "Security", sub: "Secrets, deps, SAST", icon: "shield" },
  { label: "Size", sub: "Under 400 lines", icon: "box" },
];

const REVIEW_NODES: NodeSpec[] = [
  { id: "agent", x: 16, y: 150, w: 150, label: "Agent draft", sub: "Opens a PR", icon: "spark" },
  ...GATES.map((gate, i) => ({
    ...gate,
    id: `gate${i}`,
    x: 212,
    y: 46 + i * 56,
    w: 218,
    h: 44,
  })),
  {
    id: "rules",
    x: 476,
    y: 16,
    w: 228,
    label: "AGENTS.md",
    sub: "Rules the agent reads",
    icon: "doc",
  },
  {
    id: "human",
    x: 476,
    y: 130,
    w: 228,
    label: "Human review",
    sub: "Intent, design, risk",
    icon: "users",
    accent: true,
  },
  {
    id: "merge",
    x: 476,
    y: 246,
    w: 228,
    label: "Merge",
    sub: "Small, explained, owned",
    icon: "branch",
  },
];

function ReviewGates() {
  return (
    <>
      <Zone x={196} y={16} w={250} h={316} label="Automated gates" meta="No human yet" />
      <Graph
        nodes={REVIEW_NODES}
        links={[
          { from: "agent", to: "gate0" },
          ...GATES.slice(1).map((_, i) => ({ from: `gate${i}`, to: `gate${i + 1}` })),
          { from: "gate4", to: "human" },
          { from: "human", to: "merge" },
        ]}
      />
      <Wire d="M590 130 V76" dashed>
        <UpHead x={590} y={74} />
      </Wire>
      <Remark x={580} y={108} anchor="end">
        Said twice? Make it a rule
      </Remark>
      <Wire d="M206 300 H99 Q91 300 91 292 V210" dashed className="stroke-red text-red">
        <UpHead x={91} y={208} />
      </Wire>
      <Remark x={16} y={352}>
        Gate failures go straight back to the agent. People review intent, not commas.
      </Remark>
    </>
  );
}

const ATTENTION = [
  { name: "Style", before: 30, after: 0 },
  { name: "Obvious bugs", before: 25, after: 5 },
  { name: "Missing tests", before: 20, after: 5 },
  { name: "Design fit", before: 15, after: 35 },
  { name: "Intent and risk", before: 10, after: 55 },
];

const ATTENTION_AXIS = 236;

function ReviewAttention() {
  return (
    <>
      <g data-d="fade">
        <rect x={16} y={16} width={14} height={14} rx={4} strokeWidth={1.5} className={PANEL} />
        <Sub x={38} y={27}>
          Reviewing without gates
        </Sub>
        <rect
          x={200}
          y={16}
          width={14}
          height={14}
          rx={4}
          strokeWidth={1.5}
          className="fill-accent stroke-accent"
        />
        <Sub x={222} y={27}>
          With gates and written rules
        </Sub>
      </g>
      {ATTENTION.map(({ name, before, after }, i) => {
        const x = 40 + i * 134;
        return (
          <g key={name}>
            <Bar x={x + 12} w={44} h={before * 3} axis={ATTENTION_AXIS} />
            {after > 0 && (
              <Bar
                x={x + 62}
                w={44}
                h={after * 3}
                axis={ATTENTION_AXIS}
                className="fill-accent stroke-accent"
              />
            )}
            <Remark x={x + 34} y={ATTENTION_AXIS - before * 3 - 8} anchor="middle">
              {`${before}%`}
            </Remark>
            <Remark x={x + 84} y={ATTENTION_AXIS - after * 3 - 8} anchor="middle">
              {`${after}%`}
            </Remark>
            <Remark x={x + 59} y={ATTENTION_AXIS + 20} anchor="middle">
              {name}
            </Remark>
          </g>
        );
      })}
      <path d={`M16 ${ATTENTION_AXIS} H704`} strokeWidth={1.5} className="stroke-line-strong" />
      <Remark x={704} y={282} anchor="end">
        Illustrative split of one reviewer’s time
      </Remark>
    </>
  );
}

export const leadershipDiagrams = {
  doorTest: { height: 304, Art: DoorTest },
  rfcFlow: { height: 296, Art: RfcFlow },
  doraMetrics: { height: 272, Art: DoraMetrics },
  aiAmplifier: { height: 300, Art: AiAmplifier },
  reviewGates: { height: 362, Art: ReviewGates },
  reviewAttention: { height: 292, Art: ReviewAttention },
} satisfies Partial<Record<PostDiagramName, DiagramArt>>;
