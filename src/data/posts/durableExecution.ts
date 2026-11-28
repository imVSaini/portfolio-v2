import type { Post } from "@/data/posts/schema";

export const durableExecution: Post = {
  slug: "durable-execution-over-sagas",
  title: "Durable execution: retiring hand-rolled sagas, retry queues and cron reconcilers",
  excerpt:
    "Every product has processes that outlive a request: onboarding a tenant, charging and shipping an order, a payout that waits three days. We usually build them from a queue, a status column, a cron job and hope. Durable execution engines record each step’s result and replay the code after a crash, so a multi-step process reads like one function and survives like a database.",
  metaTitle: "Durable execution instead of sagas",
  metaDescription:
    "Queues, status columns and cron jobs turn one business process into five parts. How durable execution journals each step, and the rules the code must obey.",
  topic: "Architecture",
  date: "2026-10-07",
  tint: "gold",
  art: "journal",
};
