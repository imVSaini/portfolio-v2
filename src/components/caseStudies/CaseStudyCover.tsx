import type { CaseStudy, CaseStudyArtName } from "@/data/caseStudies";
import type { ProjectTint } from "@/data/projects";
import { cn } from "@/lib/cn";

const tints: Record<ProjectTint, string> = {
  orange: "bg-orange text-faded-black",
  gold: "bg-gold text-faded-black",
  magenta: "bg-magenta text-manila-light",
  red: "bg-red text-manila-light",
  soot: "bg-soot text-manila-light",
};

const WINDOW_LABELS: Record<CaseStudyArtName, string> = {
  pipeline: "Pipeline",
  chat: "Support chat",
  ledger: "Journal entry",
  parking: "Reservation",
};

const STAGES = [
  { name: "New", cards: 3 },
  { name: "Contacted", cards: 2 },
  { name: "Qualified", cards: 2 },
  { name: "Won", cards: 1 },
] as const;

const DRAGGED_CARD = { column: 2, card: 0 } as const;

const SOURCES = ["pricing.pdf", "faq.md"] as const;

const LEDGER_LINES: { account: string; debit?: string; credit?: string }[] = [
  { account: "Bank account", debit: "1,130.00" },
  { account: "Sales revenue", credit: "1,000.00" },
  { account: "Sales tax payable", credit: "130.00" },
  { account: "Office rent", debit: "800.00" },
  { account: "Bank account", credit: "800.00" },
];

const LEDGER_TOTAL = "1,930.00";

const BAY_COUNT = 16;
const TAKEN_BAYS: readonly number[] = [0, 1, 3, 6, 7, 8, 10, 12, 13, 15];
const RESERVED_BAY = 4;

const bar = "h-[0.9cqw] rounded-full";
const bubble = "rounded-[2cqw] px-[2.6cqw] py-[1.8cqw]";

function PipelineArt() {
  return (
    <div className="grid flex-1 grid-cols-3 content-start gap-[2cqw] p-[3cqw] @md:grid-cols-4">
      {STAGES.map((stage, column) => (
        <div
          key={stage.name}
          className={cn("min-w-0 flex-col gap-[1.5cqw]", column === 3 ? "hidden @md:flex" : "flex")}
        >
          <p className="flex items-center gap-[1cqw] font-display text-[clamp(0.5rem,1.7cqw,0.875rem)] font-medium tracking-wide uppercase">
            <span className="size-[1cqw] shrink-0 rounded-full bg-accent" />
            <span className="truncate">{stage.name}</span>
            <span className="hidden shrink-0 text-muted tabular-nums @md:inline">
              {stage.cards}
            </span>
          </p>
          {Array.from({ length: stage.cards }, (_, card) => {
            const dragged = column === DRAGGED_CARD.column && card === DRAGGED_CARD.card;
            return (
              <div
                key={card}
                className={cn(
                  "flex flex-col gap-[1.1cqw] rounded-[1.4cqw] p-[1.6cqw]",
                  dragged
                    ? "translate-x-[-1.5cqw] translate-y-[1cqw] -rotate-3 bg-accent shadow-xl"
                    : "border border-line bg-surface",
                )}
              >
                <span
                  className={cn(bar, "w-3/4", dragged ? "bg-faded-black/70" : "bg-line-strong")}
                />
                <span className={cn(bar, "w-1/2", dragged ? "bg-faded-black/40" : "bg-line")} />
                <span className="mt-[0.4cqw] flex items-center justify-between">
                  <span
                    className={cn(
                      "size-[2.2cqw] rounded-full",
                      dragged ? "bg-faded-black/70" : "bg-line-strong",
                    )}
                  />
                  <span
                    className={cn(
                      "h-[1.5cqw] w-[5cqw] rounded-full",
                      dragged ? "bg-faded-black/40" : "bg-line",
                    )}
                  />
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function ChatArt() {
  return (
    <div className="flex flex-1 flex-col gap-[2cqw] p-[3cqw] text-[clamp(0.5625rem,2cqw,1.0625rem)] leading-snug">
      <p className={cn(bubble, "max-w-[72%] self-start rounded-bl-none bg-surface")}>
        Hi! Ask me anything about our plans.
      </p>
      <p
        className={cn(
          bubble,
          "max-w-[72%] self-end rounded-br-none bg-accent font-medium text-faded-black",
        )}
      >
        What does the Pro plan include?
      </p>
      <div
        className={cn(
          bubble,
          "flex w-[78%] flex-col gap-[1.5cqw] self-start rounded-bl-none bg-surface",
        )}
      >
        <span className={cn(bar, "w-full bg-line-strong")} />
        <span className={cn(bar, "w-5/6 bg-line-strong")} />
        <span className={cn(bar, "w-2/3 bg-line")} />
        <span className="flex flex-wrap gap-[1cqw] pt-[0.6cqw] font-display text-[0.8em] font-medium tracking-wide text-muted uppercase">
          {SOURCES.map((source) => (
            <span
              key={source}
              className="rounded-full border border-line-strong px-[1.5cqw] py-[0.3cqw]"
            >
              {source}
            </span>
          ))}
        </span>
      </div>
      <span className={cn(bubble, "flex gap-[0.9cqw] self-start rounded-bl-none bg-surface")}>
        <span className="size-[1.1cqw] rounded-full bg-line-strong" />
        <span className="size-[1.1cqw] rounded-full bg-line-strong" />
        <span className="size-[1.1cqw] rounded-full bg-line" />
      </span>
    </div>
  );
}

const ledgerRow = "grid grid-cols-[1fr_24%_24%] items-center gap-[2cqw]";

function LedgerArt() {
  return (
    <div className="flex flex-1 flex-col p-[3cqw] text-[clamp(0.5rem,1.7cqw,0.875rem)] leading-snug">
      <p
        className={cn(
          ledgerRow,
          "pb-[1.3cqw] font-display font-medium tracking-wide text-muted uppercase",
        )}
      >
        <span>Account</span>
        <span className="text-right">Debit</span>
        <span className="text-right">Credit</span>
      </p>
      {LEDGER_LINES.map((line, i) => (
        <p key={i} className={cn(ledgerRow, "border-t border-line py-[1.3cqw] tabular-nums")}>
          <span className="flex min-w-0 items-center gap-[1.2cqw]">
            <span
              className={cn("size-[1cqw] shrink-0", line.debit ? "bg-accent" : "bg-line-strong")}
            />
            <span className="truncate">{line.account}</span>
          </span>
          <span className="text-right">{line.debit}</span>
          <span className="text-right text-muted">{line.credit}</span>
        </p>
      ))}
      <p
        className={cn(
          ledgerRow,
          "mt-[1cqw] rounded-[1.4cqw] bg-accent px-[1.6cqw] py-[1.3cqw] font-medium text-faded-black tabular-nums shadow-xl",
        )}
      >
        <span className="font-display tracking-wide uppercase">Balanced</span>
        <span className="text-right">{LEDGER_TOTAL}</span>
        <span className="text-right">{LEDGER_TOTAL}</span>
      </p>
    </div>
  );
}

function ParkingArt() {
  return (
    <div className="flex flex-1 flex-col gap-[2.2cqw] p-[3cqw] text-[clamp(0.5rem,1.7cqw,0.875rem)] leading-snug">
      <p className="flex items-center justify-between gap-[2cqw] font-display font-medium tracking-wide uppercase">
        <span className="flex min-w-0 items-center gap-[1cqw]">
          <span className="size-[1cqw] shrink-0 bg-accent" />
          <span className="truncate">Terminal lot</span>
        </span>
        <span className="shrink-0 text-muted tabular-nums">
          {BAY_COUNT - TAKEN_BAYS.length - 1} of {BAY_COUNT} free
        </span>
      </p>
      <div className="grid grid-cols-8 gap-[1.4cqw]">
        {Array.from({ length: BAY_COUNT }, (_, bay) => {
          const reserved = bay === RESERVED_BAY;
          const taken = TAKEN_BAYS.includes(bay);
          return (
            <span
              key={bay}
              className={cn(
                "flex aspect-3/4 items-center justify-center rounded-[1.2cqw] border",
                reserved && "translate-y-[-0.8cqw] -rotate-3 border-accent bg-accent shadow-xl",
                taken && "border-line bg-surface",
                !reserved && !taken && "border-dashed border-line-strong",
              )}
            >
              {(reserved || taken) && (
                <span
                  className={cn(
                    "h-3/5 w-1/2 rounded-[0.9cqw]",
                    reserved ? "bg-faded-black/70" : "bg-line-strong",
                  )}
                />
              )}
            </span>
          );
        })}
      </div>
      <p className="flex items-center justify-between gap-[2cqw] rounded-[1.4cqw] border border-line bg-surface px-[2cqw] py-[1.4cqw] tabular-nums">
        <span className="truncate text-muted">4 days, deposit paid online</span>
        <span className="shrink-0 font-medium">$58.00</span>
      </p>
    </div>
  );
}

const art = {
  pipeline: PipelineArt,
  chat: ChatArt,
  ledger: LedgerArt,
  parking: ParkingArt,
} as const;

type CaseStudyCoverProps = {
  study: CaseStudy;
  className?: string;
};

export function CaseStudyCover({ study, className }: CaseStudyCoverProps) {
  const Art = art[study.art];

  return (
    <div
      aria-hidden="true"
      className={cn(
        "@container relative aspect-16/10 overflow-hidden rounded-2xl corner-squircle",
        tints[study.tint],
        className,
      )}
    >
      <div className="absolute inset-y-0 -left-1/4 flex w-3/2 items-center justify-center">
        <span className="font-display text-[28cqw] leading-none font-semibold whitespace-nowrap uppercase opacity-15">
          {study.title}
        </span>
      </div>

      <div className="absolute inset-x-[8%] top-[14%] bottom-0 flex flex-col overflow-hidden rounded-t-xl bg-manila-light text-faded-black shadow-2xl transition-transform duration-700 ease-out-expo motion-reduce:transition-none dark:bg-faded-black dark:text-manila-light group-intent:translate-y-[-1.5cqw]">
        <div className="flex items-center gap-[clamp(0.25rem,1cqw,0.5rem)] border-b border-line px-[clamp(0.625rem,2.4cqw,1rem)] py-[clamp(0.5rem,1.8cqw,0.75rem)]">
          <span className="size-[clamp(0.375rem,1.4cqw,0.625rem)] rounded-full bg-red" />
          <span className="size-[clamp(0.375rem,1.4cqw,0.625rem)] rounded-full bg-gold" />
          <span className="size-[clamp(0.375rem,1.4cqw,0.625rem)] rounded-full bg-manila-dark" />
          <span className="ml-[1cqw] truncate rounded-full bg-surface px-[clamp(0.5rem,1.8cqw,0.75rem)] py-0.5 text-[clamp(0.5625rem,1.6cqw,0.75rem)] text-muted">
            {WINDOW_LABELS[study.art]}
          </span>
        </div>
        <Art />
      </div>
    </div>
  );
}
