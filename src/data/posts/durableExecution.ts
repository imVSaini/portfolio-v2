import { code, h2, p, quote, ul } from "@/data/article";
import { diagram, type PostSource } from "@/data/posts/schema";

export const durableExecution: PostSource = {
  slug: "durable-execution-over-sagas",
  title: "Durable execution: retiring hand-rolled sagas, retry queues and cron reconcilers",
  excerpt:
    "Every product has processes that outlive a request: onboarding a tenant, charging and shipping an order, a payout that waits three days. We usually build them from a queue, a status column, a cron job and hope. Durable execution engines record each step’s result and replay the code after a crash, so a multi-step process reads like one function and survives like a database.",
  metaTitle: "Durable execution instead of sagas",
  metaDescription:
    "Queues, status columns and cron jobs turn one business process into five parts. How durable execution journals each step, and the rules the code must obey.",
  topic: "Architecture",
  date: "2026-10-07",
  tint: "magenta",
  art: "journal",
  body: [
    p(
      "A customer places an order. We reserve stock, charge the card, create a shipment with a carrier, email a receipt and, three days later, ask for a review. Five steps, two external APIs, one wait measured in days. None of it fits inside an HTTP request, and every step can fail independently.",
    ),
    p(
      "Most teams, mine included, build the hand-rolled version first: Celery workers, a status column and a reconciler on a schedule. It works. It also turns one business process into several moving parts that each know a fragment of the flow, and the bugs live in the gaps between them.",
    ),
    h2("The hand-rolled version"),
    diagram(
      "workflowSprawl",
      "One order, five moving parts. The process exists only as the sum of their behaviour.",
      "The API puts a message on a queue. A worker takes it and calls a payment API, then writes to a status table. A cron job scans the status table for stuck rows, failed messages go to a dead-letter queue, a compensator undoes half-finished orders, and dead letters end with an on-call engineer reading a runbook.",
    ),
    p("Each part is reasonable. Together they create questions nobody can answer quickly:"),
    ul(
      "The worker charged the card, then died before writing `charged` to the status table. The retry charges again. Was the payment idempotent?",
      "The cron job finds an order stuck in `pending` for twenty minutes. Is the worker slow, dead, or waiting on a carrier that is down?",
      "Compensation lives in a different file from the forward path, so the two drift apart with every change.",
      "The real state machine is spread across code, a database enum and an operations runbook.",
    ),
    h2("What durable execution is"),
    p(
      "A durable execution engine lets you write the process as ordinary code: one function that calls each step in order. The engine records the result of every completed step in a journal. If the process crashes, the function runs again from the top, and every step that already finished returns its recorded result instead of executing. The code continues from the first step without a result.",
    ),
    diagram(
      "journalReplay",
      "The first run dies during step 3. On restart, steps 1 and 2 return their journalled results and only step 3 onwards runs.",
      "Three panels. The first run completes reserve stock and charge card, then crashes on create shipment. The journal in the middle holds results for steps 1 and 2. After restart, steps 1 and 2 are replayed from the journal without running again, create shipment runs now, and email receipt runs next.",
    ),
    quote(
      "The function is the state machine. Its local variables, its try blocks and its position in the code are all durable.",
    ),
    p(
      "That one idea removes most of the moving parts. The status table becomes the journal. The cron reconciler becomes the engine’s recovery. Waiting three days is a durable sleep, not a scheduled job that has to find the order again.",
    ),
    h2("What it looks like"),
    p(
      "Here is the order flow with DBOS, a library that keeps its journal in the PostgreSQL database you already run. Temporal and Restate express the same idea with their own APIs.",
    ),
    code(
      "python",
      `
from dbos import DBOS, SetWorkflowID


@DBOS.step()
def charge_card(order_id: str, amount: int) -> str:
    # The order ID doubles as the provider's idempotency key, so a
    # re-run after a crash cannot charge twice.
    return payments.charge(amount, idempotency_key=f"charge-{order_id}")


@DBOS.workflow()
def fulfil_order(order_id: str, amount: int) -> None:
    reserve_stock(order_id)
    charge_id = charge_card(order_id, amount)
    try:
        create_shipment(order_id)
    except ShipmentRejected:
        refund(charge_id)
        release_stock(order_id)
        raise
    send_receipt(order_id)
    DBOS.sleep(3 * 24 * 60 * 60)  # durable: survives restarts and deploys
    request_review(order_id)


def place_order(order_id: str, amount: int) -> None:
    # Starting twice with the same workflow ID returns the existing run.
    with SetWorkflowID(f"order-{order_id}"):
        DBOS.start_workflow(fulfil_order, order_id, amount)
`,
    ),
    p(
      "Three things replaced three systems. The workflow ID is the idempotency key for the whole process, so a double-clicked button cannot start two fulfilments. The compensation sits next to the step it undoes. The three-day wait is one line, not a cron job and a column called `review_requested_at`.",
    ),
    h2("The rules the code must follow"),
    p(
      "Replay only works if running the function again takes the same path. That puts a few hard rules on workflow code, and every engine enforces some version of them.",
    ),
    ul(
      "Workflow code must be deterministic. No reading the clock, generating random IDs or calling the network directly. Anything non-deterministic goes inside a step, whose result is recorded.",
      "Steps run at least once. The engine journals a result after the step returns, so a crash between the side effect and the journal write runs the step again. Every external call needs an idempotency key.",
      "Changing a workflow that has runs in flight is a migration. Old runs replay against the new code. Add new steps behind a version check, or let old runs drain before changing the path.",
      "Keep payloads small. Journal IDs and references, not 20 MB documents.",
    ),
    p(
      "The second rule surprises people most. Durable execution gives you exactly-once workflow progress, not exactly-once side effects. The outside world still needs idempotency keys, just as it did with a queue.",
    ),
    h2("Choosing an engine in 2026"),
    p("The category has matured, and the options differ mostly in what you have to operate."),
    ul(
      "Temporal: a separate server cluster with its own persistence, SDKs in many languages and the longest production record. The right choice when many teams and services share workflows at high volume.",
      "Restate: a lighter runtime that sits in front of your services and keeps the journal in its own log. Less to run than Temporal, with the same replay model.",
      "DBOS: a library inside your application that journals to your existing Postgres. Nothing new to deploy, which suits a single product with moderate volume.",
      "Managed workflow services from cloud providers and hosted platforms such as Inngest: no infrastructure at all, in exchange for a vendor’s pricing and limits.",
    ),
    p(
      "My default for a product team already on PostgreSQL is the library approach, and moving to a dedicated cluster when workflow volume or the number of teams makes that database the bottleneck. The programming model carries over; the operations change.",
    ),
    h2("Sagas did not disappear"),
    p(
      "A saga is a sequence of local transactions where each step has a compensating action. Durable execution does not remove the need for compensation: you still have to refund the card if the carrier rejects the shipment. What changes is that the saga becomes a `try` block in one function, with the forward step and its undo a few lines apart, instead of a choreography of events between services that nobody can see in one place.",
    ),
    h2("Waiting for people"),
    p(
      "The underrated feature is waiting. A refund over a threshold needs a manager’s approval. A contract waits for a signature. A trial converts after 14 days unless cancelled. With durable execution these become a call that waits for a signal or a timer, inside the same function, and the process sleeps without holding a thread, a connection or a row lock.",
    ),
    h2("The trade-offs"),
    ul(
      "A new failure mode: non-determinism bugs. Code that reads the clock in the workflow body works in tests and breaks on the first replay in production.",
      "Versioning in-flight workflows takes discipline that a stateless queue consumer never needed.",
      "Debugging moves to the engine’s tools. You read a journal of a run, not log lines from five services, which is better once the team has learned it.",
      "Throughput limits are the engine’s limits. Journaling every step costs a write, which matters for very high-volume, short tasks.",
      "Another dependency on the critical path, unless the engine is a library over a database you already depend on.",
    ),
    h2("When a queue is enough"),
    p(
      "Most background jobs are a single step: send an email, resize an image, recalculate a report. A queue and a worker are simpler and perfectly adequate for those, and wrapping them in a workflow engine adds ceremony for nothing.",
    ),
    p(
      "The line I draw: once a process has two or more side effects that must all happen or be undone together, or waits longer than a request, it is a workflow. Write it as one.",
    ),
    h2("Lessons"),
    ul(
      "If a process needs a status column, a reconciler and a runbook, it is already a workflow. Make that explicit.",
      "Give every workflow a business ID. It is the cheapest idempotency you will ever add.",
      "Keep workflow bodies boring and deterministic, and push every effect into a step with an idempotency key.",
      "Put compensation next to the step it undoes.",
      "Start with the engine that adds the least to operate, and move when a measured limit says so.",
    ),
  ],
};
