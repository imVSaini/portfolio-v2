import { h2, p, ul } from "@/data/article";
import { diagram, type CaseStudy } from "@/data/caseStudies/schema";

export const supportAssistant: CaseStudy = {
  slug: "ai-support-assistant",
  title: "AI Support Assistant",
  category: "AI product",
  headline:
    "An embeddable AI support chatbot that answers from each business’s own documents, captures leads mid-conversation and accounts for every token it spends.",
  summary:
    "Building an AI support assistant, a multi-tenant RAG chatbot on FastAPI, pgvector and WebSockets: a deny-by-default domain allow-list, per-call cost accounting, and the limits I would lift next.",
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
  overview: [
    h2("The problem"),
    p(
      "The assistant is a support chatbot that a business embeds on its own website. An admin creates the tenant, the tenant uploads documents or points the scraper at its site, and visitors get answers drawn from that material rather than from the model’s general knowledge. It is not a messaging app: there is one human in every conversation.",
    ),
    p(
      "Three things made it more than a wrapper around a completion endpoint. The widget runs on domains we do not control. Every answer costs money, and by default it is the platform’s money. And the business wants a lead out of the conversation, not only a satisfied visitor.",
    ),
    h2("Constraints"),
    ul(
      "The widget is a script tag on someone else’s site, so its key is public by design.",
      "Tenants share one database and one deployment, and a bot must only ever retrieve its own tenant’s documents.",
      "Model spend has to be attributable to a tenant, a bot and a conversation.",
      "It had to run on a single server, without a job queue or a separate vector store.",
    ),
    h2("Architecture"),
    p(
      "Four apps live in one repository: a FastAPI backend, a widget in plain TypeScript, a tenant dashboard and a super-admin dashboard, both on React 19 and Vite. PostgreSQL holds everything, vectors included. Document chunks sit in a 1,536-dimension pgvector column beside the documents that own them, so retrieval is a SQL query with a tenant filter and not a call to a second system.",
    ),
    p(
      "A message takes a short path. The widget opens a WebSocket with its bot’s key. The server checks the key, that the bot is active and that the `Origin` is on the bot’s allow-list. For each message it saves the visitor’s text, runs lead capture or rewrites the query, embeds it, takes the 15 nearest chunks by cosine distance, adds the last three turns, calls the model, records the cost and sends one frame back.",
    ),
    diagram(
      "answerPath",
      "The path of one visitor message, from the widget to the stored cost.",
      "The widget connects through an origin gate that checks the key, the bot and the allow-list. Each message is rewritten, matched against the tenant’s 15 nearest chunks in Postgres, answered by the model with the last three turns, and its cost recorded before one frame returns.",
    ),
    p(
      "Lead capture happens inside the chat: the bot asks for each required field in turn and validates email and phone before it carries on.",
    ),
    h2("The knowledge base"),
    p(
      "A bot knows only what its tenant has given it, and there are two ways to give it something. An upload (PDF, DOCX or plain text) is read in memory, split and embedded inside the upload request, and the file itself is not kept. A scrape fetches the homepage and the pages its navigation links to on the same domain, strips scripts, navigation, forms and footers, and converts what is left to Markdown. The scraper refuses private and internal addresses, because a field that fetches a URL on the server’s behalf is otherwise a way into the network.",
    ),
    p(
      "Scraped pages are drafts. The tenant previews them, saves the ones worth keeping and edits the Markdown, and nothing reaches the bot until they sync the document. An edit marks the document as out of sync, and the bot keeps answering from the last indexed version until the next sync, which deletes the document’s chunks and builds them again.",
    ),
    p(
      "Both paths index the same way. Text is split recursively into chunks of about 1,500 characters with a 250-character overlap, breaking at paragraphs first, then lines, then sentences, so a chunk rarely ends mid-thought. One batched call embeds the whole document with `text-embedding-3-small`. Each chunk is stored beside its vector with its position and the file it came from, and the embedding call lands in the cost ledger like every other model call.",
    ),
    diagram(
      "knowledgeBase",
      "Uploads are indexed at once. Scraped pages wait as Markdown until the tenant syncs them.",
      "An upload goes straight to splitting. A scrape becomes Markdown that the tenant edits and syncs by hand. Both are split into chunks of 1,500 characters with a 250-character overlap, embedded in one batched call and stored in pgvector beside their vectors.",
    ),
    p(
      "The design has two costs. Indexing runs inside the request, so a long PDF is a slow upload. And because an upload keeps no original, a change to the chunking can be replayed over Markdown documents but not over uploaded files.",
    ),
    p(
      "The conversations feed back into it. From any transcript the tenant can ask the model what the knowledge base was missing, and gets back suggestions sorted by kind: missing information, gaps in an answer, recurring questions. They are suggestions, not edits. A person still writes the Markdown.",
    ),
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
  outcome: [
    h2("Where it stands"),
    p(
      "The product runs in production on Docker Compose behind nginx: 54 endpoints over nine tables, with optional Langfuse tracing on the model calls. Tenants manage bots, knowledge, conversations, leads and spend from their dashboard. Platform admins manage tenants and see spend across all of them.",
    ),
    p(
      "My own commits are concentrated in the tenant dashboard, the admin dashboard, and the rule that an inactive bot refuses sockets and API calls alike.",
    ),
    h2("What I would change"),
    ul(
      "Stream the reply over the existing socket with an async client. Today the answer arrives as one frame once the model has finished, which is the longest wait in the product.",
      "Move the connection limits to Redis and add an HNSW index before either is urgent. Both are known ceilings, and both are cheaper to lift early.",
      "Put tests around retrieval and lead capture first. Those are the two places where a quiet regression costs a customer something.",
      "Turn query expansion into per-tenant configuration, so a new customer’s vocabulary is data and not a code change.",
    ),
    h2("What I took from it"),
    p(
      "The model was the easy part. What made this a product was everything around the call: who is allowed to trigger it, whose money it spends, what it is allowed to read and what gets written down afterwards. I now design the accounting and the allow-list before the prompt.",
    ),
  ],
};
