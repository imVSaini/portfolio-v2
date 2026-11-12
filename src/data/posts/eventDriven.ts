import { code, h2, p, ul } from "@/data/article";
import { diagram, type PostSource } from "@/data/posts/schema";

export const eventDriven: PostSource = {
  slug: "kafka-rabbitmq-or-rest",
  title: "Event-driven architecture: when to use Kafka, RabbitMQ or a REST call",
  excerpt:
    "The choice is not really between three products. It is between waiting for an answer and not waiting, and between a queue of jobs and a log of facts. A decision path that starts from what the caller needs, with the costs asynchronous messaging brings: duplicates, ordering and eventual consistency.",
  topic: "Architecture",
  date: "2026-09-17",
  tint: "red",
  art: "events",
  body: [
    p(
      "“Should this be an event?” usually gets answered by habit. Teams that know REST add another endpoint, and teams that have just adopted a broker publish everything. Both skip the question that decides it: does the caller need the answer in order to continue?",
    ),
    h2("One request, five downstream calls"),
    p(
      "A user closes a deal. The application saves it, then calls billing, sends an email, updates a vendor CRM, recalculates a dashboard and notifies a channel. All five are synchronous calls inside the request. The user waits for the slowest of them, and the deal fails to close when the email provider has a bad minute.",
    ),
    h2("Where synchronous chains break"),
    ul(
      "Latency adds up, and availability multiplies down. Five dependencies at 99.9% each give you about 99.5% together.",
      "A retry of the whole request repeats the calls that had already succeeded.",
      "The slowest consumer sets the speed of the producer.",
      "Every new consumer means changing the code that closes a deal.",
    ),
    h2("Choose by what the caller needs"),
    ul(
      "The caller needs the result now, such as a price, a permission check or a validation: make a synchronous call, with a timeout and a fallback.",
      "The work must happen, but not before the response: put a job on a queue. RabbitMQ, or a task queue such as Celery on top of a broker, gives you routing, acknowledgements, retries and dead-letter queues.",
      "Several independent consumers care that something happened, or you need to replay history: publish to a log. Kafka keeps an ordered, durable record per partition that many consumer groups read at their own pace.",
    ),
    p(
      "Put shortly, a queue hands out work and a log records facts. If you find yourself wanting to replay a queue or route individual messages in a log, you have probably picked the wrong one.",
    ),
    p(
      "Whichever you choose, delivery is at least once, so consumers must be idempotent. And the publish has to be atomic with the database write, which is what the outbox pattern is for:",
    ),
    code(
      "python",
      `
async with db.begin():
    deal = await deals.close(db, deal_id)
    db.add(
        Outbox(
            topic="deal.closed",
            key=str(deal.id),
            payload=deal.to_event(),
        )
    )
`,
    ),
    p(
      "The event is a row in the same transaction as the change. A separate worker reads the table and delivers each row, retrying until it is acknowledged. Either both the deal and the event exist, or neither does.",
    ),
    diagram(
      "outboxFlow",
      "Top: the request waits on every downstream call. Bottom: the request commits once, and delivery happens afterwards.",
      "Two flows. In the synchronous one, a request calls billing, then email, then the vendor, and the user waits for all three. In the outbox one, the request writes the deal and an outbox row in one transaction, then a worker delivers to the vendor and retries until acknowledged.",
    ),
    h2("The trade-offs"),
    ul(
      "Eventual consistency reaches the interface. The screen has to say “syncing” somewhere, and product has to agree to that.",
      "Ordering is only guaranteed within a partition or a single queue, so choose the key with care.",
      "Debugging spans processes and time. Without correlation IDs, a lost message is a mystery.",
      "A broker is infrastructure to run, monitor and upgrade. Kafka in particular is a commitment.",
      "Dead-letter queues need an owner. Otherwise they are where data goes to be forgotten.",
    ),
    h2("A real example"),
    p(
      "A real-estate channel-partner portal I built has to stay in step with Zoho CRM. Calling the vendor inside the request would have tied our availability to theirs. So each change is written to an outbox, and a worker delivers it with retries. When the vendor is down, the portal keeps working and the outbox grows. When they return, it drains. No Kafka was involved: there is one consumer and no need to replay, so a table and a worker were the whole solution.",
    ),
    p(
      "Earlier, at Assent Global, moving reports and notifications onto Celery workers was the same decision in a simpler form. Nobody needed the report before the response.",
    ),
    h2("Lessons learned"),
    ul(
      "Start from the caller’s need and not from the broker’s feature list.",
      "Make consumers idempotent first. Every other guarantee depends on it.",
      "Use the smallest tool that fits: a database table, then a queue, then a log.",
      "Name events as facts in the past tense, such as `deal.closed`. A command dressed up as an event still couples the two sides.",
    ),
  ],
};
