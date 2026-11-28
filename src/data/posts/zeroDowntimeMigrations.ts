import type { Post } from "@/data/posts/schema";

export const zeroDowntimeMigrations: Post = {
  slug: "zero-downtime-schema-migrations",
  title: "Zero-downtime schema migrations: locks, backfills and expand/contract in Postgres",
  excerpt:
    "Most migration outages are not slow migrations. They are fast migrations that waited for a lock, while every query behind them waited too. How the Postgres lock queue turns a one-millisecond ALTER into an outage, which operations are actually safe, why backfills are a workload rather than a migration, and how expand/contract keeps every deploy reversible.",
  metaTitle: "Zero-downtime schema migrations",
  metaDescription:
    "A one-millisecond ALTER can still cause an outage. The Postgres lock queue, lock_timeout, safe operations, batched backfills and expand/contract deploys.",
  topic: "Backend",
  date: "2026-09-09",
  tint: "soot",
  art: "schema",
};
