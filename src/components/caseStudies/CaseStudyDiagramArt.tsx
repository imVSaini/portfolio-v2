import type { ReactNode } from "react";

import { Label } from "@/components/article/ArtParts";
import { DiagramCanvas, Graph, type NodeSpec } from "@/components/article/DiagramParts";
import type { CaseStudyDiagramName } from "@/data/caseStudies";

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
          { from: "membership", to: "public", dashed: true },
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
          { from: "webhook", to: "claim", fromX: 88, toX: 88 },
          { from: "sweep", to: "claim", toX: 160 },
          { from: "claim", to: "fetch" },
          { from: "fetch", to: "lead" },
          { from: "mapping", to: "lead", dashed: true },
        ]}
      />
      <g data-d="fade">
        <Label x={360} y={211} anchor="middle" size={10}>
          A lead id that is already claimed stops there
        </Label>
      </g>
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
    </>
  );
}

const diagrams: Record<CaseStudyDiagramName, { height: number; Art: () => ReactNode }> = {
  tenantRequest: { height: 250, Art: TenantRequest },
  answerPath: { height: 226, Art: AnswerPath },
  metaLeads: { height: 226, Art: MetaLeads },
  leadCapture: { height: 226, Art: LeadCapture },
  knowledgeBase: { height: 226, Art: KnowledgeBase },
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
