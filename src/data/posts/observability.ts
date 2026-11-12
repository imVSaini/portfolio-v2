import { code, h2, p, quote, ul } from "@/data/article";
import { diagram, type PostSource } from "@/data/posts/schema";

export const observability: PostSource = {
  slug: "logs-metrics-traces-are-not-optional",
  title: "Production debugging: logs, metrics and distributed tracing are not optional",
  excerpt:
    "You cannot attach a debugger to production, and you cannot reproduce most incidents on a laptop. What you can do is make the system explain itself. What each of the three signals is for, how a request ID ties them together, and how to alert on symptoms users feel instead of causes you guessed.",
  topic: "DevOps",
  date: "2026-09-24",
  tint: "soot",
  art: "signals",
  body: [
    p(
      "The hardest production bugs are rarely complicated. They are invisible. A request is slow for one tenant, on some days, and nothing recorded why. The fix takes an hour once you can see the problem. Seeing it is what takes the week.",
    ),
    h2("“It works on my machine” at three in the morning"),
    p(
      "Production differs from development in exactly the ways that cause incidents: real data volume, real concurrency, real network failures, and other people’s systems on the far end of every integration. You cannot reproduce those on demand. The system has to have been recording what it did.",
    ),
    h2("Why adding log lines is not enough"),
    ul(
      "Unstructured text cannot be filtered by tenant, user or request.",
      "Without a shared ID, the lines for one request are scattered among thousands of others.",
      "Logs describe single events. They cannot tell you that the error rate doubled an hour ago.",
      "Nothing in a log line says which of five downstream calls took the time.",
    ),
    h2("Three signals, three questions"),
    ul(
      "Metrics answer “is something wrong, and since when?” They are cheap, aggregated and the right thing to alert on.",
      "Traces answer “where did the time go?” One request, every hop, with durations.",
      "Logs answer “what exactly happened?” The detail, once the other two have told you where to look.",
    ),
    diagram(
      "signals",
      "One request ID links all three signals, so each can hand over to the next.",
      "A request carrying a UUID as its request ID feeds three signals. Metrics answer whether something is wrong. Traces answer where the time went. Logs answer what exactly happened.",
    ),
    p(
      "They become one tool when every signal carries the same identifiers. Generate a request ID at the edge, pass it on every outbound call and into every background job, and attach it to each log line and span:",
    ),
    code(
      "python",
      `
@app.middleware("http")
async def bind_request_context(request: Request, call_next):
    request_id = request.headers.get("x-request-id") or str(uuid4())
    structlog.contextvars.bind_contextvars(
        request_id=request_id,
        tenant_id=getattr(request.state, "tenant_id", None),
        route=request.url.path,
    )
    response = await call_next(request)
    response.headers["x-request-id"] = request_id
    return response
`,
    ),
    p(
      "With that in place, a support ticket that quotes a request ID leads straight to every log line, the trace and the job it enqueued. OpenTelemetry is the sensible way to produce the traces and metrics, because it keeps the instrumentation independent of whichever backend stores them. Prometheus and Grafana cover metrics and dashboards well.",
    ),
    h2("The trade-offs"),
    ul(
      "Telemetry costs money and it grows with traffic. Sample traces, and keep the slow and failed ones.",
      "High-cardinality labels, such as a user ID on a metric, can take a metrics system down. Put those in logs and traces.",
      "Logs are a place personal data leaks to. Decide what must never be logged and enforce it in code.",
      "Every alert that fires without needing action teaches people to ignore the next one.",
    ),
    h2("A real example"),
    p(
      "The CRM I lead keeps a complete audit trail: who changed what, when, and through which actor, whether a user, an API key or the AI assistant. It was built as a product feature for customers, and it turned out to be an operational one too. When a record looks wrong, the first question is always “what changed it?”, and the trail answers that without anyone reading server logs.",
    ),
    p(
      "The same thinking applies to work that leaves the request. Changes bound for a vendor CRM go through an outbox, so a vendor outage shows up as a queue that is not draining, and not as silently missing data.",
    ),
    quote(
      "Alert on what the user feels: errors, latency, a queue that is not draining. Use everything else to explain the alert.",
    ),
    h2("Lessons learned"),
    ul(
      "Add the request ID and structured logging before the first incident. Retrofitting them during one is miserable.",
      "Give every background job the ID of the request that created it.",
      "Build the dashboard you wished you had during the last incident, then delete the ones nobody opens.",
      "After each incident ask what signal would have shortened it, and add that one thing.",
    ),
  ],
};
