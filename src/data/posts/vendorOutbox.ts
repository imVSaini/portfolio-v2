import { code, h2, p, ul, type PostSource } from "@/data/posts/schema";

export const vendorOutbox: PostSource = {
  slug: "design-for-the-vendor-outage",
  title: "Design for the vendor outage: the outbox behind a CRM sync",
  excerpt:
    "A third-party API in your request path makes its downtime your downtime. The outbox moves that failure out of the user’s way, but only if you settle idempotency, ordering and poison messages up front, and keep a reconciliation job for the cases retries cannot fix.",
  topic: "Integrations",
  date: "2026-09-15",
  tint: "magenta",
  art: "outbox",
  body: [
    p(
      "When a request handler calls a vendor API, the vendor’s availability becomes yours. Their slow afternoon is your timeout, and their outage is your failed form. For a channel-partner portal that syncs with Zoho CRM, I did not want a partner’s submission to depend on a system neither of us controls.",
    ),
    h2("The dual-write problem"),
    p(
      "Saving locally and then calling the vendor is two writes to two systems with no shared transaction. If the process dies between them, the systems disagree and nothing records that they do. Swapping the order only changes which side is wrong.",
    ),
    h2("The outbox"),
    p(
      "Write the business row and a row describing the pending sync in the same database transaction. Either both exist or neither does. A worker delivers the pending rows afterwards.",
    ),
    code(
      "sql",
      `
CREATE TABLE outbox (
  id            bigserial   PRIMARY KEY,
  aggregate_id  uuid        NOT NULL,
  event_type    text        NOT NULL,
  payload       jsonb       NOT NULL,
  attempts      int         NOT NULL DEFAULT 0,
  next_attempt  timestamptz NOT NULL DEFAULT now(),
  delivered_at  timestamptz
);
`,
    ),
    p(
      "Workers claim rows with `FOR UPDATE SKIP LOCKED`, so several can run without taking the same one.",
    ),
    h2("Three decisions to make up front"),
    ul(
      "Idempotency. Delivery is at-least-once, so the same event will arrive twice sooner or later. Store the vendor’s record ID after the first create and turn every later send into an update.",
      "Ordering. Two edits to the same lead must not land in reverse. Deliver per record in `id` order, and hold an event while an earlier one for that record is still pending.",
      "Poison messages. A payload the vendor rejects will fail forever. Cap the attempts, back off between them, and park the row where a person can see it. It should block that one record, not the queue.",
    ),
    h2("Retries do not fix everything"),
    p(
      "Someone edits a record directly in the CRM. A field is renamed on their side. A row is parked and forgotten. A reconciliation job that compares both systems on a schedule and reports the drift is what turns “eventually consistent” from a hope into something you can check.",
    ),
    h2("What the user sees"),
    p(
      "Their save succeeds immediately, whatever the vendor is doing. The sync state is shown honestly as pending, synced or needs attention, because hiding it only moves the question to support.",
    ),
  ],
};
