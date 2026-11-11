import type { ReactNode } from "react";

import type { PostArtName } from "@/data/posts";
import { cn } from "@/lib/cn";

type LabelProps = {
  x: number;
  y: number;
  anchor?: "start" | "middle";
  size?: number;
  children: string;
};

function Label({ x, y, anchor = "start", size = 13, children }: LabelProps) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={size}
      letterSpacing="0.12em"
      fill="currentColor"
      stroke="none"
      className="font-display font-medium uppercase"
    >
      {children}
    </text>
  );
}

function ArrowHead({ x, y }: { x: number; y: number }) {
  return <path d={`M${x - 9} ${y - 7} L${x} ${y} L${x - 9} ${y + 7}`} />;
}

function Person({ x, y }: { x: number; y: number }) {
  return (
    <>
      <circle cx={x} cy={y - 8} r={8} />
      <path d={`M${x - 15} ${y + 18} a15 15 0 0 1 30 0`} />
    </>
  );
}

function Spark({ x, y }: { x: number; y: number }) {
  return (
    <path
      data-twinkle=""
      className="origin-center transform-fill"
      d={`M${x} ${y - 18} L${x + 5} ${y - 5} L${x + 18} ${y} L${x + 5} ${y + 5} L${x} ${y + 18} L${x - 5} ${y + 5} L${x - 18} ${y} L${x - 5} ${y - 5} Z`}
    />
  );
}

const TENANTS = [
  { y: 70, name: "Tenant_A" },
  { y: 150, name: "Tenant_B" },
  { y: 230, name: "Tenant_C" },
];

function Tenants() {
  return (
    <>
      <ellipse cx={130} cy={110} rx={52} ry={15} />
      <path d="M78 110 V214 A52 15 0 0 0 182 214 V110" />
      <path d="M78 145 A52 15 0 0 0 182 145 M78 180 A52 15 0 0 0 182 180" opacity={0.5} />
      <Label x={130} y={258} anchor="middle">
        Postgres
      </Label>
      <rect x={85} y={276} width={90} height={36} rx={8} strokeDasharray="5 5" />
      <Label x={130} y={299} anchor="middle" size={12}>
        Public
      </Label>
      {TENANTS.map(({ y, name }) => (
        <g key={name}>
          <path d={`M194 165 C270 165 262 ${y + 30} 340 ${y + 30}`} strokeDasharray="5 5" />
          <rect x={340} y={y} width={200} height={60} rx={8} />
          <Label x={356} y={y + 24} size={12}>
            {name}
          </Label>
          <path d={`M356 ${y + 38} H480 M356 ${y + 48} H450`} opacity={0.6} />
          <circle cx={522} cy={y + 19} r={4} />
        </g>
      ))}
    </>
  );
}

const SCOPES = [
  { y: 105, name: "Own" },
  { y: 155, name: "Team" },
  { y: 205, name: "Tenant" },
];

function Cache() {
  return (
    <>
      <circle cx={115} cy={175} r={52} />
      <path d="M115 175 L143 164" />
      <path data-spin="" d="M115 175 V140" className="origin-bottom transform-fill" />
      <path d="M115 131 v6 M115 213 v6 M71 175 h6 M153 175 h6" opacity={0.6} />
      <circle cx={115} cy={175} r={3} fill="currentColor" />
      <Label x={115} y={262} anchor="middle" size={12}>
        Every 60s
      </Label>
      <path d="M184 175 H234" />
      <ArrowHead x={236} y={175} />
      {SCOPES.map(({ y, name }) => (
        <g key={name}>
          <rect x={258} y={y} width={136} height={40} rx={8} />
          <Label x={274} y={y + 25} size={12}>
            {name}
          </Label>
          <rect
            x={356}
            y={y + 14}
            width={24}
            height={12}
            rx={6}
            fill="currentColor"
            stroke="none"
            opacity={0.75}
          />
          <path d={`M394 ${y + 20} H478`} strokeDasharray="5 5" />
          <Person x={510} y={y + 16} />
        </g>
      ))}
      <Label x={326} y={282} anchor="middle" size={12}>
        Redis
      </Label>
      <Label x={510} y={282} anchor="middle" size={12}>
        Readers
      </Label>
    </>
  );
}

const OUTBOX_ROWS = [105, 135, 165, 195, 225];

function Outbox() {
  return (
    <>
      <rect x={50} y={115} width={140} height={110} rx={8} />
      <path d="M68 145 H150 M68 168 H172 M68 191 H138" opacity={0.6} />
      <Label x={120} y={258} anchor="middle">
        Leads
      </Label>
      <path d="M190 170 H244" />
      <ArrowHead x={246} y={170} />
      <rect x={256} y={90} width={140} height={160} rx={8} />
      <path d="M256 122 H396 M256 154 H396 M256 186 H396 M256 218 H396" opacity={0.5} />
      {OUTBOX_ROWS.map((y, i) => (
        <g key={y}>
          <path d={`M272 ${y + 1} H${i % 2 === 0 ? 340 : 322}`} opacity={0.6} />
          <circle
            cx={378}
            cy={y + 1}
            r={4}
            {...(i < 3 && { fill: "currentColor", stroke: "none" })}
          />
        </g>
      ))}
      <Label x={326} y={282} anchor="middle">
        Outbox
      </Label>
      <Label x={427} y={156} anchor="middle" size={11}>
        Retry
      </Label>
      <path d="M396 170 H450" strokeDasharray="5 5" />
      <ArrowHead x={456} y={170} />
      <rect x={466} y={120} width={130} height={100} rx={16} />
      <circle cx={494} cy={150} r={10} />
      <path d="M516 146 H574 M484 180 H574 M484 198 H550" opacity={0.6} />
      <Label x={531} y={258} anchor="middle">
        Zoho CRM
      </Label>
    </>
  );
}

function Proposal() {
  return (
    <>
      <circle cx={95} cy={170} r={38} />
      <Spark x={95} y={170} />
      <Label x={95} y={238} anchor="middle" size={12}>
        Model
      </Label>
      <path d="M133 170 H188" strokeDasharray="5 5" />
      <ArrowHead x={194} y={170} />
      <rect x={204} y={85} width={220} height={170} rx={10} />
      <path d="M204 118 H424" />
      <circle cx={222} cy={102} r={4} fill="currentColor" stroke="none" />
      <Label x={236} y={106} size={12}>
        Proposal
      </Label>
      <Label x={222} y={144} size={11}>
        Before
      </Label>
      <path d="M278 141 H380" opacity={0.5} />
      <Label x={222} y={172} size={11}>
        After
      </Label>
      <path d="M278 169 H404" />
      <rect
        x={222}
        y={202}
        width={88}
        height={32}
        rx={16}
        fill="currentColor"
        stroke="none"
        opacity={0.85}
      />
      <rect x={320} y={202} width={88} height={32} rx={16} />
      <path d="M424 170 H482" />
      <ArrowHead x={484} y={170} />
      <Person x={540} y={166} />
      <path d="M560 146 l7 7 l13 -15" />
      <Label x={540} y={238} anchor="middle" size={12}>
        Human commits
      </Label>
    </>
  );
}

const FACTORS = [
  { y: 70, name: "Passkey" },
  { y: 150, name: "TOTP" },
  { y: 230, name: "Recovery codes" },
];

function Factors() {
  return (
    <>
      {FACTORS.map(({ y, name }, i) => (
        <g key={name}>
          <rect x={60} y={y} width={230} height={52} rx={8} />
          <Label x={78} y={y + 31} size={12}>
            {name}
          </Label>
          <circle
            cx={266}
            cy={y + 26}
            r={5}
            {...(i === 0 && { fill: "currentColor", stroke: "none" })}
          />
          {i > 0 && (
            <path d={`M175 ${y - 26} V${y - 6} M168 ${y - 13} L175 ${y - 5} L182 ${y - 13}`} />
          )}
        </g>
      ))}
      <path d="M290 176 H392" strokeDasharray="5 5" />
      <path d="M470 86 L544 112 V176 C544 224 512 250 470 268 C428 250 396 224 396 176 V112 Z" />
      <circle cx={470} cy={164} r={13} />
      <path d="M470 177 V206" />
      <Label x={470} y={304} anchor="middle">
        Account
      </Label>
    </>
  );
}

const GATES = [
  { y: 100, name: "Origin" },
  { y: 152, name: "Rate limit" },
  { y: 204, name: "Budget" },
];

function Widget() {
  return (
    <>
      <rect x={46} y={80} width={224} height={180} rx={10} />
      <path d="M46 110 H270" />
      <circle cx={64} cy={95} r={3} fill="currentColor" stroke="none" />
      <circle cx={78} cy={95} r={3} fill="currentColor" stroke="none" />
      <circle cx={92} cy={95} r={3} fill="currentColor" stroke="none" />
      <path d="M64 134 H170 M64 154 H140 M64 174 H156" opacity={0.5} />
      <rect x={186} y={186} width={68} height={58} rx={10} />
      <circle cx={206} cy={215} r={3} fill="currentColor" stroke="none" />
      <circle cx={220} cy={215} r={3} fill="currentColor" stroke="none" />
      <circle cx={234} cy={215} r={3} fill="currentColor" stroke="none" />
      <Label x={158} y={292} anchor="middle" size={12}>
        Any website
      </Label>
      <path d="M270 170 H316" strokeDasharray="5 5" />
      <ArrowHead x={322} y={170} />
      {GATES.map(({ y, name }) => (
        <g key={name}>
          <rect x={332} y={y} width={124} height={36} rx={8} />
          <Label x={348} y={y + 23} size={12}>
            {name}
          </Label>
        </g>
      ))}
      <path d="M456 170 H496" />
      <ArrowHead x={498} y={170} />
      <circle cx={548} cy={170} r={38} />
      <Spark x={548} y={170} />
      <Label x={548} y={238} anchor="middle" size={12}>
        LLM
      </Label>
    </>
  );
}

function Pyramid() {
  return (
    <>
      <path d="M230 64 L282 136 H178 Z" />
      <path d="M170 148 H290 L334 210 H126 Z" />
      <path d="M118 222 H342 L386 286 H74 Z" />
      <path d="M266 100 H410 M322 180 H410 M372 254 H410" strokeDasharray="5 5" />
      <Label x={422} y={104} size={12}>
        28 end-to-end
      </Label>
      <Label x={422} y={184} size={12}>
        Integration
      </Label>
      <Label x={422} y={258} size={12}>
        Real Postgres
      </Label>
      <path d="M218 252 l9 9 l17 -19" />
    </>
  );
}

const ENTRIES = [
  { y: 72, action: "Deal.stage_changed", actor: "User" },
  { y: 146, action: "Field.renamed", actor: "API key" },
  { y: 220, action: "Task.reassigned", actor: "Assistant" },
];

function Timeline() {
  return (
    <>
      <path d="M96 60 V300" strokeDasharray="5 5" />
      {ENTRIES.map(({ y, action, actor }) => (
        <g key={action}>
          <circle cx={96} cy={y + 28} r={7} fill="currentColor" stroke="none" />
          <path d={`M103 ${y + 28} H140`} />
          <rect x={140} y={y} width={420} height={56} rx={8} />
          <Label x={158} y={y + 25} size={12}>
            {action}
          </Label>
          <path d={`M158 ${y + 40} H330`} opacity={0.5} />
          <rect x={440} y={y + 15} width={102} height={26} rx={13} />
          <Label x={491} y={y + 32} anchor="middle" size={11}>
            {actor}
          </Label>
        </g>
      ))}
    </>
  );
}

const DIFF_ROWS = [
  { y: 112, sign: "+", to: 300 },
  { y: 140, sign: "+", to: 260 },
  { y: 168, sign: "−", to: 320 },
  { y: 196, sign: "+", to: 240 },
  { y: 224, sign: "−", to: 290 },
  { y: 252, sign: "+", to: 270 },
];

function Review() {
  return (
    <>
      <rect x={60} y={66} width={300} height={220} rx={10} />
      <path d="M60 94 H360" />
      <Label x={78} y={85} size={11}>
        Pull request
      </Label>
      {DIFF_ROWS.map(({ y, sign, to }) => (
        <g key={y} opacity={sign === "+" ? 1 : 0.5}>
          <Label x={78} y={y + 4} size={14}>
            {sign}
          </Label>
          <path d={`M100 ${y} H${to}`} />
        </g>
      ))}
      <path d="M330 168 H398" strokeDasharray="5 5" />
      <path d="M410 120 H580 V200 H440 L420 218 V200 H410 Z" />
      <path d="M428 146 H560 M428 168 H530" opacity={0.6} />
      <circle cx={495} cy={258} r={20} />
      <path d="M485 258 l8 8 l14 -16" />
    </>
  );
}

const LEAVES = [
  { x: 60, name: "Text" },
  { x: 235, name: "Data" },
  { x: 410, name: "Use client" },
];

function Tree() {
  return (
    <>
      <rect x={200} y={56} width={240} height={52} rx={8} />
      <Label x={320} y={87} anchor="middle" size={12}>
        Server section
      </Label>
      <path d="M320 108 V160 M145 160 H495 M145 160 V214 M320 160 V214 M495 160 V214" />
      {LEAVES.map(({ x, name }, i) => (
        <g key={name}>
          <rect x={x} y={214} width={170} height={52} rx={8} />
          <Label x={x + 85} y={245} anchor="middle" size={12}>
            {name}
          </Label>
          {i === 2 && (
            <>
              <rect
                x={x - 14}
                y={200}
                width={198}
                height={80}
                rx={14}
                strokeDasharray="5 5"
                opacity={0.7}
              />
              <circle cx={x + 152} cy={228} r={4} fill="currentColor" stroke="none" />
            </>
          )}
        </g>
      ))}
      <Label x={495} y={306} anchor="middle" size={11}>
        Client boundary
      </Label>
    </>
  );
}

/** Motion that plays while the surrounding card is hovered or focused. */
const hover =
  "motion-safe:group-intent:[&_[stroke-dasharray]]:animate-dash-flow motion-safe:group-intent:[&_[data-spin]]:animate-spin-steady motion-safe:group-intent:[&_[data-twinkle]]:animate-twinkle motion-safe:group-intent:[&_:is(circle,rect)[fill=currentColor]]:animate-flicker";

const art: Record<PostArtName, () => ReactNode> = {
  tenants: Tenants,
  cache: Cache,
  outbox: Outbox,
  proposal: Proposal,
  factors: Factors,
  widget: Widget,
  pyramid: Pyramid,
  timeline: Timeline,
  review: Review,
  tree: Tree,
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
