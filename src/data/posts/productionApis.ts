import { code, diagram, h2, p, ul, type PostSource } from "@/data/posts/schema";

export const productionApis: PostSource = {
  slug: "apis-that-survive-production-traffic",
  title: "Building backend APIs that survive real production traffic",
  excerpt:
    "An API that passes its tests has only met polite clients. Production sends retries, duplicate submissions, unbounded lists and callers that ignore your documentation. The defaults I build in from the first endpoint: bounded pagination, idempotency keys, layered rate limits and errors a client can act on.",
  topic: "Backend",
  date: "2026-11-05",
  tint: "magenta",
  art: "gates",
  body: [
    p(
      "Every API works in development. There is one client, it sends well-formed requests one at a time, and the database has two hundred rows. Production is where an endpoint meets retries, double clicks, scripts in a loop and a table that grew a thousand times larger than the fixture.",
    ),
    h2("What production actually sends"),
    ul(
      "The same POST twice, because a mobile network dropped the response and the client retried.",
      "A list request with no limit against a table that now has millions of rows.",
      "A burst from one customer’s integration that starves everyone else.",
      "A token that expired halfway through a multi-step flow.",
    ),
    h2("Why the happy path is not enough"),
    p(
      "None of these are bugs in the usual sense. The code does exactly what it was written to do. The failure is that the endpoint was designed as a function call, when it is really a contract with callers you do not control, over a network that loses messages.",
    ),
    h2("Defaults I build in from the first endpoint"),
    ul(
      "Pagination with a hard maximum. Cursor-based for anything that grows without bound, because `OFFSET 200000` reads and discards 200,000 rows.",
      "Idempotency keys on every write that creates something or moves money.",
      "Rate limits in layers: per IP at the edge, per API key and per tenant in the application.",
      "Timeouts on every outbound call, shorter than the timeout of whoever is calling you.",
      "One error shape, with a stable machine-readable code next to the human message.",
      "Authorisation checked against the resource, not just the route.",
    ),
    p("Idempotency is the one teams skip, and it is a small amount of code:"),
    code(
      "python",
      `
@router.post("/deals", status_code=201)
async def create_deal(
    payload: DealIn,
    idempotency_key: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> DealOut:
    stored = await find_response(db, idempotency_key)
    if stored:
        return stored
    deal = await deals.create(db, payload)
    await save_response(db, idempotency_key, deal)
    return deal
`,
    ),
    p(
      "The key and the stored response are written in the same transaction as the deal, with a unique constraint on the key. A retry then returns the first result instead of creating a second record.",
    ),
    diagram(
      "gates",
      "Every request passes the same gates in the same order, cheapest check first.",
      "A request flows from the client through a rate limit, authentication and an idempotency check to the handler. A dashed arrow loops from the idempotency check back to the client: a retry gets the stored response.",
    ),
    h2("The trade-offs"),
    ul(
      "Cursor pagination cannot jump to page 40. Most products do not need to, but check before you promise it.",
      "Idempotency storage is another table to expire and another write per request.",
      "Strict rate limits will throttle a legitimate customer during their busiest hour. Return `Retry-After` and make the limit configurable per tenant.",
      "Short timeouts turn slow successes into fast failures. That is the right trade for the system and occasionally the wrong one for a single request.",
    ),
    h2("A real example"),
    p(
      "Our embeddable chatbot is called from other people’s websites, so every request is untrusted by definition. Each one passes three gates before it reaches a model: the API key must match a domain on the tenant’s allow-list, a Redis counter enforces the rate limit, and LLM spend is tracked per tenant so one noisy site cannot run up everybody’s bill. The limits live in Redis because every API worker has to agree on the count.",
    ),
    h2("Lessons learned"),
    ul(
      "Design the failure response before the success response. Clients write more code against your errors than against your data.",
      "Treat every write as something that will be retried, because it will.",
      "Load-test with production-sized data. At Assent Global I profiled and load-tested services for this reason: to find where the time actually went, and not where we assumed.",
      "Put a limit on everything a caller can make larger: page size, payload size, batch size, query depth.",
    ),
  ],
};
