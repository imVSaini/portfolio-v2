import { code, h2, p, quote, ul } from "@/data/article";
import { diagram, type PostSource } from "@/data/posts/schema";

export const gracefulDegradation: PostSource = {
  slug: "graceful-degradation-under-load",
  title: "High availability is a budget: SLOs, load shedding and graceful degradation",
  excerpt:
    "Systems rarely go down because something broke. They go down because something slowed, retries multiplied the load, queues filled and every request timed out together. The services that stay up are the ones designed to fail partially: retry budgets instead of retry counts, load shed early and cheaply, and degradation levels chosen in advance rather than discovered during the incident.",
  metaTitle: "Load shedding and graceful degradation",
  metaDescription:
    "Outages are usually overload, not breakage. Retry budgets, early load shedding and planned degradation levels that keep the core working when parts can’t.",
  topic: "Architecture",
  date: "2026-09-02",
  tint: "magenta",
  art: "shedding",
  body: [
    p(
      "The most common kind of outage does not start with a crash. It starts with a dependency getting slower. Requests wait longer, threads and connections stay busy, timeouts fire, clients retry, and the extra load slows the dependency further. Ten minutes later everything is down, and nothing is actually broken.",
    ),
    p(
      "High availability is less about preventing failure than about choosing how you fail. A system that can drop its least important work on purpose keeps its most important work running.",
    ),
    h2("SLOs are budgets"),
    p(
      "A 99.9% monthly availability target allows about 43 minutes of failure a month. That number is not a goal to hit as closely as possible; it is a budget to spend. Deploys, experiments, migrations and incidents all draw from it.",
    ),
    ul(
      "Measure it where users feel it: successful requests at the edge, per critical journey, not CPU on a host.",
      "Write down what happens when the budget runs out: feature work pauses and reliability work takes priority until it recovers.",
      "Use burn rate for alerts. Alert when the budget is being spent fast enough to run out, not when one metric crosses a line for a minute.",
      "Choose different targets for different journeys. Checkout and sign-in deserve more nines than an export.",
    ),
    h2("How healthy systems fall over"),
    p(
      "Retries are the accelerant. A client retries three times, the API behind it retries three times, and the service behind that retries three times. One user action can become 27 calls against the dependency that is already struggling. The system feeds its own outage.",
    ),
    diagram(
      "retryBudget",
      "Without a budget, retries push load past capacity exactly when a dependency slows. With a 10% budget, the extra load stays small.",
      "Two bar charts of load over time against a dashed capacity line. On the left, without a retry budget, red retry segments stack on top of normal load after the dependency slows and push every bar above capacity. On the right, with a retry budget, only a thin accent segment of retries is added and every bar stays under capacity.",
    ),
    h2("Retry budgets"),
    p(
      "A retry count limits retries per request. A retry budget limits retries per client as a share of its traffic, so when everything starts failing at once, the retries stop instead of multiplying.",
    ),
    code(
      "python",
      `
class RetryBudget:
    """Allows retries up to a fraction of recent requests."""

    def __init__(self, ratio: float = 0.1, floor: int = 10) -> None:
        self._ratio = ratio
        self._floor = floor  # a few retries are always allowed at low traffic
        self._requests = SlidingCounter(seconds=10)
        self._retries = SlidingCounter(seconds=10)

    def record_request(self) -> None:
        self._requests.add()

    def try_spend(self) -> bool:
        allowed = max(self._floor, self._requests.total() * self._ratio)
        if self._retries.total() >= allowed:
            return False
        self._retries.add()
        return True


async def call(fn, budget: RetryBudget, attempts: int = 3):
    budget.record_request()
    for attempt in range(attempts):
        try:
            return await fn()
        except (Timeout, Unavailable):
            if attempt == attempts - 1 or not budget.try_spend():
                raise
            # Full jitter spreads retries out instead of synchronising them.
            await asyncio.sleep(random.uniform(0, 0.1 * 2**attempt))
`,
    ),
    p("Three rules go with it:"),
    ul(
      "Retry at one layer, usually the one closest to the user. Every other layer fails fast.",
      "Only retry what is safe to repeat: reads, and writes that carry an idempotency key.",
      "Never retry an error that will not change, such as a 400 or a 403.",
    ),
    h2("Shed load early and cheaply"),
    p(
      "When demand exceeds capacity, some requests will fail. The only choice is which ones, and how expensively. A request rejected at the edge in a millisecond costs almost nothing. A request that waits 30 seconds in a queue, takes a database connection and then times out costs a great deal and helps no one.",
    ),
    ul(
      "Limit concurrency per instance, and reject above it with 503 and `Retry-After`. Adaptive limits that shrink as latency rises are better than a fixed number.",
      "Drop requests that have already waited longer than the client’s timeout. The caller has given up; finishing the work is pure waste.",
      "Classify traffic. Sign-in and checkout are critical; recommendations, prefetches and exports are sheddable. Shed sheddable work first.",
      "Make background work yield to foreground work, not the other way round.",
    ),
    code(
      "python",
      `
CRITICAL = {"/auth/login", "/checkout"}
inflight = asyncio.Semaphore(200)


@app.middleware("http")
async def shed_load(request: Request, call_next):
    if inflight.locked() and request.url.path not in CRITICAL:
        return JSONResponse(
            {"code": "overloaded", "message": "Try again shortly."},
            status_code=503,
            headers={"Retry-After": "2"},
        )
    async with inflight:
        return await call_next(request)
`,
    ),
    h2("Planned degradation levels"),
    p(
      "During an incident nobody makes good product decisions. Decide beforehand what the product looks like at each level of pressure, build each level as a switch, and test the switches on a quiet afternoon.",
    ),
    diagram(
      "degradeLadder",
      "Four levels, each a switch. Every step down keeps the core journeys working by turning off something less important.",
      "A table of four degradation levels with an arrow showing pressure rising downwards. Level 0, normal, serves everything. Level 1, shed extras, turns off recommendations, exports and previews. Level 2, serve stale, reads from cache and queues writes. Level 3, core only, keeps sign-in, checkout and the status page and returns 503 with Retry-After for everything else.",
    ),
    quote(
      "A fallback that has never run in production is not a fallback. It is a second outage waiting for its first test.",
    ),
    h2("Deadlines, not just timeouts"),
    p(
      "Timeouts are usually set per hop and never add up. The edge waits 10 seconds, the API waits 10 seconds for a service, and that service waits 10 seconds for the database. Pass a deadline down instead: the time left for the whole request. Each hop subtracts what it used and gives up when nothing is left, so no work continues after the user has stopped waiting.",
    ),
    h2("Circuit breakers, with care"),
    p(
      "A circuit breaker stops calling a dependency that keeps failing, which protects both sides. Two cautions. Breakers that trip per instance flap independently and produce confusing partial behaviour, so pair them with the budgets and limits above rather than relying on them alone. And the fallback the breaker switches to must be exercised regularly, because rarely run code is where the second incident hides.",
    ),
    h2("The trade-offs"),
    ul(
      "Shedding fails some users on purpose. That is the point, and it still needs product agreement before the incident, not during it.",
      "Degradation levels are product work: designs for a stale page, copy for a disabled feature, tests for each path.",
      "Retry budgets can fail a request that one more retry would have saved. Across the system they save far more than they cost.",
      "Adaptive limits need tuning and good latency metrics to work from.",
    ),
    h2("Lessons"),
    ul(
      "Treat availability as a budget with a written policy for when it runs out.",
      "Budget retries per client, retry at one layer and always with jitter.",
      "Reject early and cheaply, and drop work whose caller has already gone.",
      "Decide degradation levels in advance, build them as switches and rehearse them.",
      "Propagate deadlines so the system stops working the moment the user stops waiting.",
    ),
  ],
};
