import type { CaseStudy } from "@/data/caseStudies/schema";

export const supportAssistant: CaseStudy = {
  slug: "ai-support-assistant",
  title: "AI Support Assistant",
  category: "AI chatbot",
  headline:
    "An embeddable AI support chatbot that answers from each business’s own documents, captures leads mid-conversation and accounts for every token it spends.",
  summary:
    "A multi-tenant RAG support chatbot on FastAPI, pgvector and WebSockets: a domain allow-list, per-call cost accounting and the limits I would lift next.",
  date: "2026-11-12",
  tint: "magenta",
  art: "chat",
  facts: [
    { label: "Role", value: "Lead engineer: architecture, review, dashboards" },
    { label: "Timeline", value: "January to October 2026" },
    { label: "Platform", value: "Embeddable widget, two dashboards, API" },
    { label: "Status", value: "In production" },
  ],
  metrics: [
    { value: "54", label: "API endpoints, one of them a WebSocket" },
    { value: "15", label: "Chunks retrieved for every question" },
    { value: "4", label: "Languages a reply can be translated into" },
    { value: "3", label: "Message types in the whole socket protocol" },
  ],
  stack: [
    "Python 3.11",
    "FastAPI",
    "SQLAlchemy 2",
    "PostgreSQL",
    "pgvector",
    "Redis 7",
    "WebSockets",
    "OpenAI API",
    "Langfuse",
    "React 19",
    "Vite",
    "TanStack Query",
    "Tailwind CSS 4",
    "Docker Compose",
  ],
  decisions: [
    {
      title: "The vectors live in Postgres",
      context:
        "A dedicated vector database is the default advice. It is also a second system to deploy, secure, back up and keep consistent with the rows it indexes.",
      chose:
        "pgvector in the same PostgreSQL database. Chunks sit next to their documents, and tenant isolation is the same `WHERE` clause as everywhere else.",
      cost: "There is no approximate index yet, so every search is an exact scan of the bot’s chunks. That is accurate while each corpus is small and will need an HNSW index as tenants grow.",
    },
    {
      title: "Deny by default on domains, because the key is public",
      context:
        "The widget’s key ships in page source. Anyone can copy it and run up a bill from their own site.",
      chose:
        "Each bot has an allow-list of domains checked against the `Origin` header, and the wildcard was removed outright. The shared platform key is refused until a domain has been verified. A tenant can bring its own OpenAI key instead, which is stored encrypted.",
      cost: "Tightening it was a breaking change: a bot that relied on the wildcard stopped answering until its domains were listed. An origin check also stops other websites, not scripts, so rate limits still have to do their share.",
    },
    {
      title: "Never hold a database connection for an open socket",
      context:
        "A chat socket stays open for minutes and is idle for nearly all of them. A pool sized for requests runs dry quickly if every socket keeps a session.",
      chose:
        "One short session to authenticate the socket, then a fresh session for each message. Every connection has its own message rate, message size and idle limits, and every tenant a cap on concurrent connections.",
      cost: "The limits live in process memory, so they are only correct on a single worker. Scaling out means moving them to Redis first.",
    },
    {
      title: "Cost is a first-class record",
      context:
        "On a shared key, a tenant’s usage is invisible unless you record it yourself at the moment it happens.",
      chose:
        "Every chat, embedding and translation call writes a row with its token counts and a decimal USD cost from a pricing table, tied to the tenant, the bot and the conversation. Both dashboards read from it.",
      cost: "The pricing table is configuration that has to follow the provider’s price list by hand, and the write sits on the reply path.",
    },
    {
      title: "Rewrite the question before searching",
      context:
        "Visitors answer a bot’s question with “yes” or “the second one”. Embedding that retrieves nothing useful.",
      chose:
        "Short follow-ups are rewritten with keywords from the bot’s previous answer, and domain terms are expanded before the query is embedded.",
      cost: "The expansion rules are heuristics written for the first customers’ vocabulary. They help there, and they need to become per-tenant configuration or a model call before they generalise.",
    },
  ],
};
