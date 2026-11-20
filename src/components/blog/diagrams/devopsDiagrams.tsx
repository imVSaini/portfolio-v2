import {
  DownHead,
  Graph,
  Note,
  Remark,
  Sub,
  UpHead,
  Wire,
  type DiagramArt,
  type NodeSpec,
} from "@/components/article/DiagramParts";
import type { PostDiagramName } from "@/data/posts";

const CANARY_STAGES = [
  { label: "5%", weight: 5 },
  { label: "Analyse", checks: ["Errors < 1%", "p95 < 400 ms"] },
  { label: "25%", weight: 25 },
  { label: "Analyse", checks: ["Errors < 1%", "p95 < 400 ms"] },
  { label: "50%", weight: 50 },
  { label: "Analyse", checks: ["Saturation", "Business KPI"] },
  { label: "100%", weight: 100 },
];

const CANARY_NODES: NodeSpec[] = CANARY_STAGES.map(({ label, weight }, i) => ({
  id: `stage${i}`,
  x: 16 + i * 100,
  y: 16,
  w: 86,
  h: 84,
  label,
  icon: weight === undefined ? "shield" : "route",
  stack: true,
  accent: weight === 100,
}));

const ROLLBACK_NODE: NodeSpec[] = [
  {
    id: "rollback",
    x: 210,
    y: 196,
    w: 300,
    label: "Abort and roll back",
    sub: "Stable keeps 100%, no one paged",
    icon: "refresh",
  },
];

const GATE_DROPS = [
  { from: 159, to: 260 },
  { from: 359, to: 360 },
  { from: 559, to: 460 },
];

function CanarySteps() {
  return (
    <>
      <Graph
        nodes={[...CANARY_NODES, ...ROLLBACK_NODE]}
        links={CANARY_NODES.slice(1).map((node, i) => ({ from: `stage${i}`, to: node.id }))}
      />
      {CANARY_STAGES.map(({ weight, checks }, i) => {
        const x = 16 + i * 100;
        if (weight !== undefined) {
          return (
            <g key={i} data-d="bar">
              <rect
                x={x}
                y={112}
                width={86}
                height={10}
                rx={5}
                strokeWidth={1.5}
                className="stroke-line-strong"
              />
              <rect
                x={x}
                y={112}
                width={(86 * weight) / 100}
                height={10}
                rx={5}
                stroke="none"
                className="fill-accent"
              />
            </g>
          );
        }
        return (
          <g key={i} data-d="fade">
            {(checks ?? []).map((check, line) => (
              <Sub key={check} x={x + 43} y={120 + line * 14} anchor="middle">
                {check}
              </Sub>
            ))}
          </g>
        );
      })}
      {GATE_DROPS.map(({ from, to }) => (
        <Wire
          key={from}
          d={from === to ? `M${from} 150 V192` : `M${from} 150 C${from} 172 ${to} 170 ${to} 192`}
          dashed
          className="stroke-red"
        >
          <DownHead x={to} y={194} />
        </Wire>
      ))}
      <Note x={360} y={284} anchor="middle">
        Each gate compares canary pods with stable pods, not with last week
      </Note>
    </>
  );
}

const DEPLOY_NODES: NodeSpec[] = [
  {
    id: "merge",
    x: 16,
    y: 36,
    w: 210,
    label: "Merge",
    sub: "Main stays releasable",
    icon: "branch",
  },
  { id: "image", x: 255, y: 36, w: 210, label: "Image", sub: "Built once, signed", icon: "box" },
  {
    id: "prod",
    x: 494,
    y: 36,
    w: 210,
    label: "Production",
    sub: "Flag off: code is dark",
    icon: "server",
  },
];

const RELEASE_NODES: NodeSpec[] = [
  { id: "staff", x: 16, y: 162, w: 160, label: "Staff", sub: "Dogfood first", icon: "users" },
  { id: "one", x: 192, y: 162, w: 160, label: "1% of users", sub: "Watch errors", icon: "chart" },
  { id: "beta", x: 368, y: 162, w: 160, label: "Beta tenants", sub: "Opted in", icon: "flag" },
  {
    id: "all",
    x: 544,
    y: 162,
    w: 160,
    label: "Everyone",
    sub: "Delete the flag",
    icon: "globe",
    accent: true,
  },
];

function DeployRelease() {
  return (
    <>
      <Note x={704} y={24} anchor="end">
        Deploy: code reaches servers
      </Note>
      <Note x={704} y={150} anchor="end">
        Release: people see it
      </Note>
      <Graph
        nodes={[...DEPLOY_NODES, ...RELEASE_NODES]}
        links={[
          { from: "merge", to: "image" },
          { from: "image", to: "prod" },
          { from: "prod", to: "staff", dashed: true },
          { from: "staff", to: "one" },
          { from: "one", to: "beta" },
          { from: "beta", to: "all" },
        ]}
      />
      <Wire
        d="M624 218 V238 Q624 246 616 246 H104 Q96 246 96 238 V222"
        dashed
        className="stroke-red"
      >
        <UpHead x={96} y={220} />
      </Wire>
      <Remark x={360} y={270} anchor="middle">
        Kill switch: back to off in seconds, without a deploy
      </Remark>
    </>
  );
}

const GITOPS_NODES: NodeSpec[] = [
  { id: "dev", x: 16, y: 30, w: 140, label: "Developer", sub: "Opens a PR", icon: "users" },
  { id: "app", x: 180, y: 30, w: 156, label: "App repo", sub: "Code and tests", icon: "branch" },
  {
    id: "ci",
    x: 360,
    y: 30,
    w: 156,
    label: "CI",
    sub: "Build, test, sign",
    icon: "refresh",
    accent: true,
  },
  { id: "registry", x: 540, y: 30, w: 164, label: "Registry", sub: "Signed images", icon: "box" },
  { id: "config", x: 180, y: 170, w: 156, label: "Config repo", sub: "Desired state", icon: "doc" },
  {
    id: "argo",
    x: 360,
    y: 170,
    w: 156,
    label: "Argo CD",
    sub: "Pulls, reconciles",
    icon: "refresh",
    accent: true,
  },
  { id: "cluster", x: 540, y: 170, w: 164, label: "Cluster", sub: "Actual state", icon: "server" },
];

function GitopsLoop() {
  return (
    <>
      <Graph
        nodes={GITOPS_NODES}
        links={[
          { from: "dev", to: "app" },
          { from: "app", to: "ci" },
          { from: "ci", to: "registry" },
          { from: "ci", to: "config" },
          { from: "config", to: "argo" },
          { from: "argo", to: "cluster" },
        ]}
      />
      <Remark x={348} y={150} anchor="middle">
        Opens a PR that bumps the tag
      </Remark>
      <Wire d="M622 170 V88" dashed>
        <UpHead x={622} y={88} />
      </Wire>
      <Remark x={632} y={132}>
        Pulls the image
      </Remark>
      <Wire d="M622 226 V262 Q622 270 614 270 H446 Q438 270 438 262 V228" dashed>
        <UpHead x={438} y={228} />
      </Wire>
      <Remark x={530} y={292} anchor="middle">
        Drift is detected and reverted
      </Remark>
      <Note x={16} y={318}>
        Nothing pushes into the cluster. A merged commit is the only way in.
      </Note>
    </>
  );
}

const PATH_OUTPUTS: Pick<NodeSpec, "label" | "icon">[] = [
  { label: "CI pipeline", icon: "refresh" },
  { label: "Container build", icon: "box" },
  { label: "Deploy config", icon: "doc" },
  { label: "Dashboards", icon: "chart" },
  { label: "Alerts and SLO", icon: "bolt" },
  { label: "Owner and runbook", icon: "users" },
];

const PATH_NODES: NodeSpec[] = [
  {
    id: "template",
    x: 16,
    y: 134,
    w: 170,
    label: "Template",
    sub: "One command",
    icon: "layers",
    accent: true,
  },
  ...PATH_OUTPUTS.map((output, i) => ({
    ...output,
    id: `out${i}`,
    x: 236,
    y: 16 + i * 50,
    w: 220,
    h: 40,
  })),
  {
    id: "prod",
    x: 506,
    y: 134,
    w: 198,
    label: "Production",
    sub: "Day one, not month two",
    icon: "server",
    accent: true,
  },
];

function GoldenPath() {
  return (
    <>
      <Graph
        nodes={PATH_NODES}
        links={PATH_OUTPUTS.flatMap((_, i) => [
          { from: "template", to: `out${i}` },
          { from: `out${i}`, to: "prod" },
        ])}
      />
      <Remark x={16} y={334}>
        Leaving the path is allowed. The team then owns its own on-call, upgrades and patches.
      </Remark>
    </>
  );
}

const CHAIN_STAGES = [
  {
    label: "Source",
    icon: "branch",
    threat: "Stolen token",
    control: "Passkeys, short tokens",
  },
  {
    label: "Dependencies",
    icon: "box",
    threat: "Malicious update",
    control: "Lockfile + cooldown",
  },
  {
    label: "Build",
    icon: "refresh",
    threat: "Tampered workflow",
    control: "Pinned actions, OIDC",
  },
  {
    label: "Artifact",
    icon: "lock",
    threat: "Swapped image",
    control: "Provenance, signature",
  },
  {
    label: "Deploy",
    icon: "server",
    threat: "Unsigned image runs",
    control: "Verify at admission",
  },
] as const;

function SupplyChain() {
  return (
    <>
      <g className="text-red">
        <Note x={16} y={22}>
          Threat
        </Note>
      </g>
      <Graph
        nodes={CHAIN_STAGES.map(({ label, icon }, i) => ({
          id: label,
          x: 16 + i * 143,
          y: 112,
          w: 116,
          h: 84,
          label,
          icon,
          stack: true,
          accent: label === "Artifact",
        }))}
        links={CHAIN_STAGES.slice(1).map(({ label }, i) => ({
          from: CHAIN_STAGES[i]?.label ?? "",
          to: label,
        }))}
      />
      {CHAIN_STAGES.map(({ label, threat, control }, i) => {
        const x = 16 + i * 143;
        const centre = x + 58;
        return (
          <g key={label}>
            <g data-d="node">
              <rect
                x={x - 6}
                y={32}
                width={128}
                height={40}
                rx={10}
                strokeWidth={1.5}
                className="fill-red/15 stroke-red"
              />
              <Sub x={centre} y={56} anchor="middle">
                {threat}
              </Sub>
            </g>
            <Wire d={`M${centre} 72 V106`} dashed className="stroke-red">
              <DownHead x={centre} y={108} />
            </Wire>
            <g data-d="node">
              <rect
                x={x - 6}
                y={232}
                width={128}
                height={40}
                rx={10}
                strokeWidth={1.5}
                className="fill-accent/10 stroke-accent"
              />
              <Sub x={centre} y={256} anchor="middle">
                {control}
              </Sub>
            </g>
            <Wire d={`M${centre} 232 V202`}>
              <UpHead x={centre} y={200} />
            </Wire>
          </g>
        );
      })}
      <Note x={16} y={292}>
        Control
      </Note>
      <Remark x={704} y={292} anchor="end">
        Signing the image does nothing for a poisoned dependency. Each stage needs its own.
      </Remark>
    </>
  );
}

const SIGN_NODES: NodeSpec[] = [
  { id: "ci", x: 16, y: 30, w: 160, label: "CI job", sub: "OIDC identity", icon: "refresh" },
  { id: "fulcio", x: 200, y: 30, w: 170, label: "Fulcio", sub: "10-minute cert", icon: "key" },
  { id: "rekor", x: 394, y: 30, w: 170, label: "Rekor", sub: "Public log", icon: "list" },
  {
    id: "registry",
    x: 200,
    y: 170,
    w: 170,
    label: "Registry",
    sub: "Image + attestation",
    icon: "box",
  },
  {
    id: "admission",
    x: 394,
    y: 170,
    w: 170,
    label: "Admission",
    sub: "Checks the identity",
    icon: "shield",
    accent: true,
  },
  { id: "pod", x: 588, y: 170, w: 116, label: "Pod", sub: "Runs", icon: "server" },
];

function SignedBuild() {
  return (
    <>
      <Graph
        nodes={SIGN_NODES}
        links={[
          { from: "ci", to: "fulcio" },
          { from: "fulcio", to: "rekor", dashed: true },
          { from: "ci", to: "registry", down: true, fromX: 96, toX: 285 },
          { from: "registry", to: "admission" },
          { from: "admission", to: "pod" },
        ]}
      />
      <Wire d="M479 170 V88" dashed>
        <UpHead x={479} y={88} />
      </Wire>
      <Remark x={489} y={132}>
        Is it in the log?
      </Remark>
      <g className="text-red">
        <Note x={394} y={252}>
          Wrong workflow or no signature: rejected
        </Note>
      </g>
      <Remark x={16} y={286}>
        The policy names a repo, a workflow file and a branch, never a key someone could leak.
      </Remark>
    </>
  );
}

export const devopsDiagrams = {
  canarySteps: { height: 298, Art: CanarySteps },
  deployRelease: { height: 284, Art: DeployRelease },
  gitopsLoop: { height: 330, Art: GitopsLoop },
  goldenPath: { height: 346, Art: GoldenPath },
  supplyChain: { height: 304, Art: SupplyChain },
  signedBuild: { height: 300, Art: SignedBuild },
} satisfies Partial<Record<PostDiagramName, DiagramArt>>;
