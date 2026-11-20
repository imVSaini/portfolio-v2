import { code, h2, p, quote, ul } from "@/data/article";
import { diagram, type PostSource } from "@/data/posts/schema";

export const llmFeatures: PostSource = {
  slug: "llm-features-in-production-backends",
  title: "Shipping LLM features in a production backend: retrieval, tools, evals and cost",
  excerpt:
    "The model call is one line of code. Everything around it is backend engineering: what context the model sees, what it is allowed to do, how you know an answer is right before customers do, and what each conversation costs. Lessons from shipping a retrieval-based support assistant and a tool-using task assistant into multi-tenant SaaS.",
  metaTitle: "LLM features in a production backend",
  metaDescription:
    "The model call is one line. Retrieval, typed tools with confirmation, prompt injection, evals in CI and per-tenant cost decide whether LLM features work.",
  topic: "Backend",
  date: "2026-11-11",
  tint: "magenta",
  art: "retrieval",
  body: [
    p(
      "I have shipped two kinds of LLM feature into multi-tenant products. One is an embeddable support assistant that answers questions from each business’s own documents. The other is an assistant inside a work-management app that creates and updates tasks through typed tools, with a person confirming every change. The model was the easy part of both.",
    ),
    p(
      "What took the time was everything a backend engineer already knows how to do, applied to a dependency that is slow, expensive, non-deterministic and happy to follow instructions from anyone.",
    ),
    h2("Untrusted and expensive"),
    ul(
      "It is slow. Seconds, not milliseconds, so stream the answer and never call it while holding a database transaction or a lock.",
      "It is expensive. Every call has a price in tokens, so budget it per tenant like any metered resource.",
      "It is non-deterministic. The same input can produce different output, so correctness is measured statistically, with evals, not with a single assertion.",
      "Its output is user input. Anything it returns, including tool arguments, gets validated exactly like a form submission from the internet.",
    ),
    h2("Retrieval comes first"),
    p(
      "Most wrong answers are retrieval failures, not model failures: the right passage was never in the prompt. So the retrieval pipeline deserves most of the engineering.",
    ),
    diagram(
      "ragPipeline",
      "Ingest runs when a document changes; answering runs on every question. Both carry the tenant through every step.",
      "Two rows. Ingest: documents are chunked, embedded and stored in pgvector. Answer: a question goes through hybrid search over the stored chunks, a reranker, a prompt with sources and rules, and the model. A note says the keyword index and vectors share one tenant filter, every chunk keeps its tenant ID and source, and answers cite the chunks they used.",
    ),
    ul(
      "Chunk by structure, not by character count. Split on headings and keep the heading path with each chunk, so “Refunds › Annual plans” travels with the text.",
      "Search two ways. Embeddings find paraphrases; keywords find product names, error codes and SKUs that embeddings blur. Fuse the two rankings.",
      "Rerank the top candidates with a cross-encoder or a small model before the prompt. Fifty candidates in, a dozen out.",
      "Filter by tenant inside the query, before ranking. Never retrieve across tenants and filter afterwards.",
      "Refuse when retrieval is weak. If the best score is below a threshold, say you do not know and offer a human. A confident wrong answer costs more than an honest handoff.",
    ),
    p(
      "The support assistant I shipped started simpler: the 15 nearest chunks by cosine distance, with short follow-up questions rewritten before they are embedded. Hybrid search is the next step I would take, because exact terms such as product names and error codes are where pure vector search is weakest, and in Postgres it is one more CTE:",
    ),
    code(
      "sql",
      `
-- Hybrid retrieval in one query: vector and keyword rankings,
-- fused with reciprocal rank fusion, scoped to one tenant.
WITH semantic AS (
    SELECT id, row_number() OVER (ORDER BY embedding <=> $2) AS rank
    FROM chunks
    WHERE tenant_id = $1
    ORDER BY embedding <=> $2
    LIMIT 40
),
keyword AS (
    SELECT id, row_number() OVER (ORDER BY ts_rank(search, query) DESC) AS rank
    FROM chunks, websearch_to_tsquery('english', $3) AS query
    WHERE tenant_id = $1 AND search @@ query
    ORDER BY ts_rank(search, query) DESC
    LIMIT 40
)
SELECT id, sum(1.0 / (60 + rank)) AS score
FROM (SELECT * FROM semantic UNION ALL SELECT * FROM keyword) AS hits
GROUP BY id
ORDER BY score DESC
LIMIT 15;
`,
    ),
    h2("The model proposes, you decide"),
    p(
      "Tool calling lets a model ask your backend to do things. The safe framing is that the model only ever proposes a call. Your code validates it, checks it against the permissions of the person in the conversation, asks that person to confirm anything that writes, and only then executes it.",
    ),
    diagram(
      "toolLoop",
      "The model proposes a call; the backend validates, authorises and, for writes, asks the user before executing. Results and errors go back to the model as data.",
      "A user asks the model, which proposes a tool call. The call is validated against its schema, the tenant and the user’s role, then confirmed by the user for writes, then executed as a typed function. The result returns to the model as data, and invalid calls return as errors along a dashed path. The loop stops at an answer, a refusal or six steps, and every call is logged with tenant, arguments, result, latency and cost.",
    ),
    code(
      "python",
      `
class CreateTask(BaseModel):
    """Create a task in the current workspace."""

    title: str = Field(min_length=1, max_length=200)
    due_on: date | None = None
    assignee_email: EmailStr | None = None


TOOLS = {"create_task": Tool(CreateTask, tasks.create, effect=Effect.WRITE)}


async def run_tool(call: ToolCall, user: User) -> ToolResult:
    tool = TOOLS.get(call.name)
    if tool is None:
        return ToolResult.error(f"Unknown tool: {call.name}")
    try:
        args = tool.schema.model_validate_json(call.arguments)
    except ValidationError as exc:
        return ToolResult.error(exc.errors())  # the model can correct itself
    if not user.can(call.name):
        return ToolResult.error("You do not have permission to do that.")
    if tool.effect is Effect.WRITE and not await confirm(user, call.name, args):
        return ToolResult.error("The user declined.")
    result = await tool.handler(user, args)  # runs with the user's permissions
    return ToolResult.ok(result)
`,
    ),
    p(
      "Note what runs the handler: the user, not a service account. The model never gets more access than the person talking to it. If you expose tools to agents outside your own app, the Model Context Protocol is now the standard way, and its 2026-07-28 revision dropped protocol sessions, which makes MCP servers ordinary stateless services behind a load balancer.",
    ),
    h2("Containing prompt injection"),
    p(
      "A retrieved document, an email or a web page can contain text that reads like instructions. You cannot reliably filter that out, and a better system prompt will not save you. What you can do is make sure that obeying the injected text cannot do much harm.",
    ),
    ul(
      "Scope tools to the current user’s permissions, so the model cannot do anything the user could not.",
      "Avoid tools that send data somewhere arbitrary, such as fetching a URL the model chose or emailing an address it composed.",
      "Require a person to confirm side effects, and show them exactly what will happen.",
      "Keep tenants apart at the data layer, so no prompt can reach another tenant’s documents.",
    ),
    quote(
      "Assume the model will eventually do whatever the most hostile text in its context tells it to. Design so that this is merely annoying.",
    ),
    h2("Evals are the test suite"),
    p(
      "Without evals, every prompt tweak, model upgrade or chunking change is a guess shipped to customers. With them, it is a pull request with a score.",
    ),
    ul(
      "Build a golden set from real questions, with the facts a correct answer must contain and the sources it should cite. Start with fifty; grow it from every bad answer reported.",
      "Score retrieval and generation separately. Did the right chunk come back? Given the right chunk, was the answer faithful to it?",
      "Use a model as a judge with a written rubric, and spot-check its verdicts by hand every week.",
      "Run the suite in CI on any change to prompts, models, chunking or retrieval, and block merges that regress.",
      "In production, track the escalation rate, thumbs-down rate and a weekly sample reviewed by a person.",
    ),
    h2("Cost and latency"),
    ul(
      "Stream tokens to the client over SSE or WebSockets. Time to first token matters more than total time.",
      "Log input and output tokens, model and cost on every call, tagged by tenant and feature.",
      "Enforce per-tenant budgets in the backend, so one heavy customer cannot run up everyone’s bill.",
      "Put stable content first in the prompt, system rules and tool definitions, so provider prompt caching can reuse it.",
      "Route simple requests to a smaller, cheaper model and reserve the largest one for the questions that need it.",
    ),
    h2("The trade-offs"),
    ul(
      "Confirmation steps slow users down. They are still cheaper than undoing a wrong bulk update.",
      "Hybrid search and reranking add latency and moving parts compared with plain vector search, and they win on accuracy almost every time.",
      "Evals take real effort to build and maintain, and they are the only way to change anything with confidence.",
      "Refusing on weak retrieval lowers the answer rate. Users trust the answers they do get far more.",
    ),
    h2("Lessons"),
    ul(
      "Spend most of the effort on retrieval; most bad answers are missing context.",
      "Let the model propose and the backend decide, with the user’s own permissions.",
      "Treat prompt injection as inevitable and limit what it can reach.",
      "Make evals part of CI before the second prompt change.",
      "Meter tokens per tenant from the first day, not after the first surprising invoice.",
    ),
  ],
};
