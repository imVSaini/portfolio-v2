import type { ReactNode } from "react";

import { Label } from "@/components/article/ArtParts";
import { DiagramCanvas, Graph, Sub, type NodeSpec } from "@/components/article/DiagramParts";
import type { CaseStudyDiagramName } from "@/data/caseStudies";

function LaterKey() {
  return (
    <g data-d="fade">
      <path d="M16 207.5 H41" strokeWidth={1.5} strokeDasharray="5 5" />
      <Sub x={49} y={211}>
        Runs later
      </Sub>
    </g>
  );
}

const CHAIN: Pick<NodeSpec, "id" | "label" | "icon" | "accent">[] = [
  { id: "jwt", label: "JWT", icon: "key" },
  { id: "membership", label: "Membership", icon: "shield" },
  { id: "session", label: "Session", icon: "db", accent: true },
  { id: "permission", label: "Permission", icon: "list" },
  { id: "handler", label: "Handler", icon: "server" },
];

const TENANT_NODES: NodeSpec[] = [
  ...CHAIN.map((node, i) => ({
    ...node,
    x: 16 + i * 143,
    y: 16,
    w: 116,
    h: 84,
    stack: true,
  })),
  {
    id: "public",
    x: 16,
    y: 152,
    w: 208,
    label: "public",
    sub: "Users and memberships",
    icon: "db",
  },
  {
    id: "acme",
    x: 256,
    y: 152,
    w: 208,
    label: "tenant_acme",
    sub: "Leads, stages, roles",
    icon: "db",
    accent: true,
  },
  {
    id: "globex",
    x: 496,
    y: 152,
    w: 208,
    label: "tenant_globex",
    sub: "Out of reach",
    icon: "db",
  },
];

function TenantRequest() {
  return (
    <>
      <Graph
        nodes={TENANT_NODES}
        links={[
          { from: "jwt", to: "membership" },
          { from: "membership", to: "session" },
          { from: "session", to: "permission" },
          { from: "permission", to: "handler" },
          { from: "membership", to: "public" },
          { from: "session", to: "acme" },
        ]}
      />
      <path data-d="fade" d="M474 174 l12 12 M486 174 l-12 12" className="stroke-red" />
      <g data-d="fade">
        <Label x={360} y={235} anchor="middle" size={10}>
          Every table name resolves inside one schema
        </Label>
      </g>
    </>
  );
}

const ANSWER_NODES: NodeSpec[] = [
  {
    id: "widget",
    x: 16,
    y: 16,
    w: 208,
    label: "Widget",
    sub: "On the customer’s site",
    icon: "monitor",
  },
  {
    id: "gate",
    x: 256,
    y: 16,
    w: 208,
    label: "Origin gate",
    sub: "Key, bot, allow-list",
    icon: "shield",
    accent: true,
  },
  {
    id: "rewrite",
    x: 496,
    y: 16,
    w: 208,
    label: "Rewrite",
    sub: "Lead capture or query",
    icon: "refresh",
  },
  {
    id: "retrieve",
    x: 16,
    y: 128,
    w: 208,
    label: "pgvector",
    sub: "15 chunks, one tenant",
    icon: "db",
    accent: true,
  },
  {
    id: "model",
    x: 256,
    y: 128,
    w: 208,
    label: "Model",
    sub: "Chunks + last 3 turns",
    icon: "bolt",
  },
  {
    id: "cost",
    x: 496,
    y: 128,
    w: 208,
    label: "Cost record",
    sub: "Per tenant, bot, chat",
    icon: "chart",
  },
];

function AnswerPath() {
  return (
    <>
      <Graph
        nodes={ANSWER_NODES}
        links={[
          { from: "widget", to: "gate" },
          { from: "gate", to: "rewrite" },
          { from: "rewrite", to: "retrieve" },
          { from: "retrieve", to: "model" },
          { from: "model", to: "cost" },
        ]}
      />
      <g data-d="fade">
        <Label x={360} y={211} anchor="middle" size={10}>
          One frame returns once the cost is written
        </Label>
      </g>
    </>
  );
}

const META_NODES: NodeSpec[] = [
  {
    id: "webhook",
    x: 16,
    y: 16,
    w: 208,
    label: "Webhook",
    sub: "Signed, answered at once",
    icon: "shield",
  },
  {
    id: "sweep",
    x: 256,
    y: 16,
    w: 208,
    label: "Sweep",
    sub: "Every 5 min, each Page",
    icon: "refresh",
  },
  {
    id: "mapping",
    x: 496,
    y: 16,
    w: 208,
    label: "Form mapping",
    sub: "Product, owner, stage",
    icon: "list",
  },
  {
    id: "claim",
    x: 16,
    y: 128,
    w: 208,
    label: "Event claim",
    sub: "Unique on the lead id",
    icon: "key",
    accent: true,
  },
  {
    id: "fetch",
    x: 256,
    y: 128,
    w: 208,
    label: "Graph API",
    sub: "Fetch lead, with retries",
    icon: "globe",
  },
  {
    id: "lead",
    x: 496,
    y: 128,
    w: 208,
    label: "Lead",
    sub: "In the tenant’s schema",
    icon: "db",
    accent: true,
  },
];

function MetaLeads() {
  return (
    <>
      <Graph
        nodes={META_NODES}
        links={[
          { from: "webhook", to: "claim", dashed: true, fromX: 88, toX: 88 },
          { from: "sweep", to: "claim", toX: 160 },
          { from: "claim", to: "fetch" },
          { from: "fetch", to: "lead" },
          { from: "mapping", to: "lead" },
        ]}
      />
      <g data-d="fade">
        <Label x={360} y={211} anchor="middle" size={10}>
          A lead id that is already claimed stops there
        </Label>
      </g>
      <LaterKey />
    </>
  );
}

const CAPTURE_NODES: NodeSpec[] = [
  {
    id: "form",
    x: 16,
    y: 16,
    w: 208,
    label: "Website form",
    sub: "Posts with the API key",
    icon: "monitor",
  },
  {
    id: "gate",
    x: 256,
    y: 16,
    w: 208,
    label: "Key gate",
    sub: "Hash match, origin list",
    icon: "shield",
    accent: true,
  },
  {
    id: "workspace",
    x: 496,
    y: 16,
    w: 208,
    label: "Workspace",
    sub: "Chosen by the key",
    icon: "key",
  },
  {
    id: "validate",
    x: 16,
    y: 128,
    w: 208,
    label: "Validate",
    sub: "Email, owner, product",
    icon: "list",
  },
  {
    id: "duplicates",
    x: 256,
    y: 128,
    w: 208,
    label: "Duplicates",
    sub: "Email or phone, flagged",
    icon: "layers",
  },
  {
    id: "lead",
    x: 496,
    y: 128,
    w: 208,
    label: "Lead",
    sub: "Audited as an API write",
    icon: "db",
    accent: true,
  },
];

function LeadCapture() {
  return (
    <>
      <Graph
        nodes={CAPTURE_NODES}
        links={[
          { from: "form", to: "gate" },
          { from: "gate", to: "workspace" },
          { from: "workspace", to: "validate" },
          { from: "validate", to: "duplicates" },
          { from: "duplicates", to: "lead" },
        ]}
      />
      <g data-d="fade">
        <Label x={360} y={211} anchor="middle" size={10}>
          Nothing in the request body can name a workspace
        </Label>
      </g>
    </>
  );
}

const KNOWLEDGE_NODES: NodeSpec[] = [
  {
    id: "upload",
    x: 16,
    y: 16,
    w: 208,
    label: "Upload",
    sub: "PDF, DOCX or text",
    icon: "box",
  },
  {
    id: "scrape",
    x: 256,
    y: 16,
    w: 208,
    label: "Scrape",
    sub: "Homepage and menu pages",
    icon: "globe",
  },
  {
    id: "markdown",
    x: 496,
    y: 16,
    w: 208,
    label: "Markdown",
    sub: "Edited, then synced",
    icon: "layout",
    accent: true,
  },
  {
    id: "split",
    x: 16,
    y: 128,
    w: 208,
    label: "Split",
    sub: "1,500 chars, 250 overlap",
    icon: "layers",
  },
  {
    id: "embed",
    x: 256,
    y: 128,
    w: 208,
    label: "Embed",
    sub: "One batched call",
    icon: "bolt",
  },
  {
    id: "store",
    x: 496,
    y: 128,
    w: 208,
    label: "pgvector",
    sub: "Chunk beside its vector",
    icon: "db",
    accent: true,
  },
];

function KnowledgeBase() {
  return (
    <>
      <Graph
        nodes={KNOWLEDGE_NODES}
        links={[
          { from: "upload", to: "split", fromX: 88, toX: 88 },
          { from: "scrape", to: "markdown" },
          { from: "markdown", to: "split", dashed: true, toX: 160 },
          { from: "split", to: "embed" },
          { from: "embed", to: "store" },
        ]}
      />
      <g data-d="fade">
        <Label x={360} y={211} anchor="middle" size={10}>
          A sync replaces every chunk of the document
        </Label>
      </g>
      <LaterKey />
    </>
  );
}

const BOOKING_NODES: NodeSpec[] = [
  {
    id: "reprice",
    x: 16,
    y: 16,
    w: 208,
    label: "Reprice",
    sub: "Server-side, from rates",
    icon: "list",
  },
  {
    id: "lock",
    x: 256,
    y: 16,
    w: 208,
    label: "Lot lock",
    sub: "FOR UPDATE on the lot row",
    icon: "key",
    accent: true,
  },
  {
    id: "count",
    x: 496,
    y: 16,
    w: 208,
    label: "Overlap count",
    sub: "Paid, parked or held",
    icon: "layers",
  },
  {
    id: "hold",
    x: 16,
    y: 128,
    w: 208,
    label: "Reservation",
    sub: "Pending, 10-minute hold",
    icon: "db",
    accent: true,
  },
  {
    id: "intent",
    x: 256,
    y: 128,
    w: 208,
    label: "PaymentIntent",
    sub: "Created after commit",
    icon: "card",
  },
  {
    id: "expiry",
    x: 496,
    y: 128,
    w: 208,
    label: "Expiry job",
    sub: "Delayed by 10 minutes",
    icon: "refresh",
  },
];

function BookingHold() {
  return (
    <>
      <Graph
        nodes={BOOKING_NODES}
        links={[
          { from: "reprice", to: "lock" },
          { from: "lock", to: "count" },
          { from: "count", to: "hold" },
          { from: "hold", to: "intent" },
          { from: "intent", to: "expiry", dashed: true },
        ]}
      />
      <g data-d="fade">
        <Label x={360} y={211} anchor="middle" size={10}>
          Stripe is never called while the lot is locked
        </Label>
      </g>
      <LaterKey />
    </>
  );
}

const PAYMENT_NODES: NodeSpec[] = [
  {
    id: "expiry",
    x: 16,
    y: 16,
    w: 208,
    label: "Expiry job",
    sub: "When the hold ends",
    icon: "refresh",
  },
  {
    id: "sweep",
    x: 256,
    y: 16,
    w: 208,
    label: "Sweep",
    sub: "Every 6 hours",
    icon: "list",
  },
  {
    id: "webhook",
    x: 496,
    y: 16,
    w: 208,
    label: "Webhook",
    sub: "Signed, deduped by id",
    icon: "shield",
  },
  {
    id: "stripe",
    x: 16,
    y: 128,
    w: 208,
    label: "Stripe",
    sub: "Asked before cancelling",
    icon: "globe",
  },
  {
    id: "reservation",
    x: 256,
    y: 128,
    w: 208,
    label: "Reservation",
    sub: "Confirmed or cancelled",
    icon: "db",
    accent: true,
  },
  {
    id: "refund",
    x: 496,
    y: 128,
    w: 208,
    label: "Refund",
    sub: "Paid after the hold",
    icon: "card",
  },
];

function PaymentPaths() {
  return (
    <>
      <Graph
        nodes={PAYMENT_NODES}
        links={[
          { from: "expiry", to: "stripe", fromX: 88, toX: 88 },
          { from: "sweep", to: "stripe", fromX: 320, toX: 160 },
          { from: "stripe", to: "reservation" },
          { from: "webhook", to: "reservation", toX: 400 },
          { from: "reservation", to: "refund" },
        ]}
      />
      <g data-d="fade">
        <Label x={360} y={211} anchor="middle" size={10}>
          Whichever signal arrives first does the work
        </Label>
      </g>
    </>
  );
}

const PRICE_NODES: NodeSpec[] = [
  {
    id: "period",
    x: 16,
    y: 16,
    w: 208,
    label: "Rate period",
    sub: "Chosen by arrival date",
    icon: "list",
  },
  {
    id: "tier",
    x: 256,
    y: 16,
    w: 208,
    label: "Length tier",
    sub: "Daily, weekly, monthly",
    icon: "layers",
  },
  {
    id: "taxes",
    x: 496,
    y: 16,
    w: 208,
    label: "Taxes",
    sub: "Per component, compound",
    icon: "chart",
  },
  {
    id: "deposit",
    x: 16,
    y: 128,
    w: 208,
    label: "Deposit",
    sub: "Total × commission rate",
    icon: "card",
    accent: true,
  },
  {
    id: "coupon",
    x: 256,
    y: 128,
    w: 208,
    label: "Coupon",
    sub: "Off the total or deposit",
    icon: "bolt",
  },
  {
    id: "snapshot",
    x: 496,
    y: 128,
    w: 208,
    label: "Snapshot",
    sub: "Stored on the reservation",
    icon: "db",
    accent: true,
  },
];

function PriceBuild() {
  return (
    <>
      <Graph
        nodes={PRICE_NODES}
        links={[
          { from: "period", to: "tier" },
          { from: "tier", to: "taxes" },
          { from: "taxes", to: "deposit" },
          { from: "deposit", to: "coupon" },
          { from: "coupon", to: "snapshot" },
        ]}
      />
      <g data-d="fade">
        <Label x={360} y={211} anchor="middle" size={10}>
          The client sends dates and choices, never amounts
        </Label>
      </g>
    </>
  );
}

const STATEMENT_NODES: NodeSpec[] = [
  {
    id: "statement",
    x: 16,
    y: 16,
    w: 208,
    label: "Statement",
    sub: "CSV or spreadsheet",
    icon: "box",
  },
  {
    id: "fingerprint",
    x: 256,
    y: 16,
    w: 208,
    label: "Fingerprint",
    sub: "SHA-256, unique index",
    icon: "key",
    accent: true,
  },
  {
    id: "drafts",
    x: 496,
    y: 16,
    w: 208,
    label: "Drafts",
    sub: "Batches of 100",
    icon: "layers",
  },
  {
    id: "rules",
    x: 16,
    y: 128,
    w: 208,
    label: "Rules",
    sub: "Run in priority order",
    icon: "list",
  },
  {
    id: "model",
    x: 256,
    y: 128,
    w: 208,
    label: "Model",
    sub: "Suggests a known account",
    icon: "bolt",
  },
  {
    id: "journal",
    x: 496,
    y: 128,
    w: 208,
    label: "Journal entry",
    sub: "Written on posting",
    icon: "db",
    accent: true,
  },
];

function StatementImport() {
  return (
    <>
      <Graph
        nodes={STATEMENT_NODES}
        links={[
          { from: "statement", to: "fingerprint", dashed: true },
          { from: "fingerprint", to: "drafts" },
          { from: "drafts", to: "rules" },
          { from: "rules", to: "model", dashed: true },
          { from: "model", to: "journal", dashed: true },
        ]}
      />
      <g data-d="fade">
        <Label x={360} y={211} anchor="middle" size={10}>
          A row seen before is skipped, not imported twice
        </Label>
      </g>
      <LaterKey />
    </>
  );
}

const DOCUMENT_NODES: NodeSpec[] = [
  {
    id: "document",
    x: 16,
    y: 16,
    w: 208,
    label: "Document",
    sub: "PDF or photo, queued",
    icon: "box",
  },
  {
    id: "ocr",
    x: 256,
    y: 16,
    w: 208,
    label: "OCR",
    sub: "Several Tesseract passes",
    icon: "layers",
  },
  {
    id: "extract",
    x: 496,
    y: 16,
    w: 208,
    label: "Extract",
    sub: "Label and pattern rules",
    icon: "list",
  },
  {
    id: "supplier",
    x: 16,
    y: 128,
    w: 208,
    label: "Supplier",
    sub: "Matched by name",
    icon: "route",
  },
  {
    id: "review",
    x: 256,
    y: 128,
    w: 208,
    label: "Review",
    sub: "A person approves",
    icon: "monitor",
    accent: true,
  },
  {
    id: "bill",
    x: 496,
    y: 128,
    w: 208,
    label: "Bill",
    sub: "Dr expense, Cr payables",
    icon: "db",
    accent: true,
  },
];

function DocumentBill() {
  return (
    <>
      <Graph
        nodes={DOCUMENT_NODES}
        links={[
          { from: "document", to: "ocr", dashed: true },
          { from: "ocr", to: "extract" },
          { from: "extract", to: "supplier" },
          { from: "supplier", to: "review", dashed: true },
          { from: "review", to: "bill" },
        ]}
      />
      <g data-d="fade">
        <Label x={360} y={211} anchor="middle" size={10}>
          Nothing is posted until someone approves it
        </Label>
      </g>
      <LaterKey />
    </>
  );
}

const MAGIC_LINK_NODES: NodeSpec[] = [
  {
    id: "request",
    x: 16,
    y: 16,
    w: 208,
    label: "Request",
    sub: "Same reply either way",
    icon: "mail",
  },
  {
    id: "token",
    x: 256,
    y: 16,
    w: 208,
    label: "Token",
    sub: "Signed, purpose and id",
    icon: "key",
  },
  {
    id: "hash",
    x: 496,
    y: 16,
    w: 208,
    label: "Stored hash",
    sub: "SHA-256 of the id only",
    icon: "layers",
  },
  {
    id: "verify",
    x: 16,
    y: 128,
    w: 208,
    label: "Verify",
    sub: "Signature and purpose",
    icon: "shield",
  },
  {
    id: "claim",
    x: 256,
    y: 128,
    w: 208,
    label: "Claim",
    sub: "Row lock, marked used",
    icon: "db",
    accent: true,
  },
  {
    id: "session",
    x: 496,
    y: 128,
    w: 208,
    label: "Session",
    sub: "Tokens for one tenant",
    icon: "monitor",
  },
];

function MagicLink() {
  return (
    <>
      <Graph
        nodes={MAGIC_LINK_NODES}
        links={[
          { from: "request", to: "token" },
          { from: "token", to: "hash" },
          { from: "hash", to: "verify", dashed: true },
          { from: "verify", to: "claim" },
          { from: "claim", to: "session" },
        ]}
      />
      <g data-d="fade">
        <Label x={360} y={211} anchor="middle" size={10}>
          A second click finds no unused row
        </Label>
      </g>
      <LaterKey />
    </>
  );
}

const diagrams: Record<CaseStudyDiagramName, { height: number; Art: () => ReactNode }> = {
  tenantRequest: { height: 250, Art: TenantRequest },
  answerPath: { height: 226, Art: AnswerPath },
  metaLeads: { height: 226, Art: MetaLeads },
  leadCapture: { height: 226, Art: LeadCapture },
  knowledgeBase: { height: 226, Art: KnowledgeBase },
  bookingHold: { height: 226, Art: BookingHold },
  paymentPaths: { height: 226, Art: PaymentPaths },
  priceBuild: { height: 226, Art: PriceBuild },
  statementImport: { height: 226, Art: StatementImport },
  documentBill: { height: 226, Art: DocumentBill },
  magicLink: { height: 226, Art: MagicLink },
};

type CaseStudyDiagramArtProps = {
  name: CaseStudyDiagramName;
  /** Says what the drawing shows, for readers who cannot see it. */
  alt: string;
  className?: string;
};

export function CaseStudyDiagramArt({ name, alt, className }: CaseStudyDiagramArtProps) {
  const { height, Art } = diagrams[name];

  return (
    <DiagramCanvas height={height} alt={alt} {...(className && { className })}>
      <Art />
    </DiagramCanvas>
  );
}
