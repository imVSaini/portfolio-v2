import { code, diagram, h2, p, quote, ul, type PostSource } from "@/data/posts/schema";

export const systemDesignTradeoffs: PostSource = {
  slug: "system-design-is-trade-offs",
  title: "System design is about trade-offs, not technology",
  excerpt:
    "Monoliths, microservices and event-driven systems are not better or worse than each other. Each one buys something and charges for it. How I choose between them from the constraints of the team and the product, and why “it depends” is only an answer once you say what it depends on.",
  topic: "System Design",
  date: "2026-11-12",
  tint: "soot",
  art: "tradeoffs",
  body: [
    p(
      "Most architecture arguments I have sat in were really arguments about technology. Should this be a microservice? Should we add Kafka? Those questions have no answer on their own, because the same design is right for one team and expensive for another.",
    ),
    h2("The same question, three right answers"),
    p(
      "A team asks whether to split the monolith. For twelve engineers shipping one product, the honest answer is usually no. For six teams who block each other on every release, it is probably yes. For a team whose only pain is one slow report, the answer is neither: move the report off the request path and leave the structure alone.",
    ),
    p("Nothing about the technology changed between those three answers. The constraints did."),
    h2("Why copying an architecture fails"),
    p(
      "A diagram from a large company is the solution to that company’s problem: hundreds of engineers, independent deploys, traffic that differs by orders of magnitude between features. Copy the diagram without the problem and you pay the whole price for none of the benefit.",
    ),
    ul(
      "A function call becomes a network call that can time out, retry and arrive twice.",
      "One database transaction becomes a saga with compensation steps.",
      "One deploy becomes a version matrix, and one on-call rota becomes several.",
    ),
    h2("Decide from constraints"),
    p("Before naming a pattern, I write down the answers to a short list of questions:"),
    ul(
      "How many teams need to deploy without waiting for each other?",
      "Which changes must succeed or fail together in one transaction?",
      "What does the load look like: steady, read-heavy, or bursty from the outside world?",
      "What does an hour of downtime cost, and for which feature?",
      "What does shipping a quarter later cost the business, and is this design worth that delay?",
      "What can this team operate at three in the morning?",
    ),
    p(
      "The answers usually point at a boring default: one well-structured application with clear module boundaries, plus background workers for anything the caller does not have to wait for. A module earns its own service when it has a different scaling, deployment or failure profile from the rest, and not before.",
    ),
    diagram(
      "spectrum",
      "Move right only when a constraint pushes you there. Each step buys independence and costs operations.",
      "Three stages left to right: a modular monolith with one deploy, a monolith with background workers, then separate services with independent deploys. An axis below runs from few teams with one load profile to many teams with different profiles.",
    ),
    p(
      "Keeping the next step cheap is mostly a matter of how modules talk to each other. If billing is reached through an interface, the call site does not change on the day billing needs its own service:",
    ),
    code(
      "python",
      `
class Billing(Protocol):
    async def charge(self, account_id: UUID, amount: Money) -> Receipt: ...


class LocalBilling:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def charge(self, account_id: UUID, amount: Money) -> Receipt:
        return await ledger.record_charge(self.db, account_id, amount)


billing: Billing = LocalBilling(db)
`,
    ),
    p(
      "Today `LocalBilling` is a module in the same process and the same transaction. An HTTP client with the same shape can replace it later. The decision to split is postponed until there is a reason, and it stays affordable in the meantime.",
    ),
    h2("The trade-offs"),
    ul(
      "Monolith: one deploy, one transaction, easy to debug. You pay with a shared release train and a wider blast radius.",
      "Microservices: teams and workloads scale independently. You pay in network failures, data consistency and operational surface.",
      "Event-driven: producers and consumers stop waiting on each other and bursts get absorbed. You pay with eventual consistency and a harder question when someone asks “where did this message go?”",
    ),
    quote(
      "“It depends” is a lazy answer until you say what it depends on. After that it is the design.",
    ),
    h2("A real example"),
    p(
      "The CRM I lead is a FastAPI application on PostgreSQL with a schema per tenant. Only three kinds of work live outside the request, and each has a stated reason. The heaviest dashboard query is recomputed by Celery Beat every 60 seconds, because nobody should wait for it. The sync to a vendor CRM goes through an outbox, because the vendor’s uptime is not ours. And the embeddable chatbot is a separate product, because public, bursty WebSocket traffic has nothing in common with authenticated CRM requests.",
    ),
    p(
      "Each of those was added when a specific constraint appeared. None of them was on the first diagram.",
    ),
    h2("Lessons learned"),
    ul(
      "Write the constraint next to the decision. When the constraint changes, you will know the decision is up for review.",
      "Prefer the option that is cheapest to reverse. A module boundary can become a service later; merging services back is rare and painful.",
      "Count the operational cost in people, not servers.",
      "Be suspicious of any design whose main justification is that a larger company uses it.",
    ),
  ],
};
