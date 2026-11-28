import type { Post } from "@/data/posts/schema";

export const postgresDefault: Post = {
  slug: "postgres-before-another-database",
  title: "PostgreSQL in 2026: queues, search and vectors before you add another database",
  excerpt:
    "A new product rarely needs four data stores. PostgreSQL can be the queue, the search index, the vector store and the document database for far longer than most teams assume, and keeping them in one transactional system removes a whole class of consistency bugs. What Postgres 18 changed, how to use each feature well, and the signals that say it is time to graduate.",
  metaTitle: "PostgreSQL before another database",
  metaDescription:
    "Postgres can be your queue, search index and vector store for longer than you think. The patterns, what Postgres 18 changed and when to move on.",
  topic: "Backend",
  date: "2026-10-14",
  tint: "soot",
  art: "postgres",
};
