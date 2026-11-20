import { code, h2, p, quote, ul } from "@/data/article";
import { diagram, type PostSource } from "@/data/posts/schema";

export const postgresDefault: PostSource = {
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
  body: [
    p(
      "The architecture diagram for a typical new product used to have a database, a queue, a cache, a search cluster and, more recently, a vector database. Five systems to provision, secure, back up, upgrade, monitor and keep consistent with each other, before the product has its hundredth customer.",
    ),
    p(
      "My default today is PostgreSQL for all of it except the cache, and Redis for that. Not because Postgres is the best queue or the best search engine, but because one system the team understands deeply beats four it half understands, and because a single transaction across your data, your jobs and your index is worth more than most benchmark wins.",
    ),
    h2("The cost of one more database"),
    ul(
      "Another thing to operate: backups, restores you have tested, upgrades, capacity, alerts and someone on call who knows it.",
      "Another security boundary: credentials, network rules, encryption and audit.",
      "Dual writes. Writing to Postgres and then to a queue or index can fail halfway, so you need an outbox or change data capture to keep them in step.",
      "Another failure mode in every request that touches it.",
    ),
    p(
      "The last two are the expensive ones. Inside one database, “save the order and enqueue the email” is one atomic commit. Across two systems it is a distributed systems problem.",
    ),
    h2("Jobs: a queue with SKIP LOCKED"),
    p(
      "`SELECT … FOR UPDATE SKIP LOCKED` lets many workers pull from one table without blocking each other: each claims the next unlocked row and skips rows another worker holds. Insert the job in the same transaction as the business write and you get transactional enqueueing for free, with no outbox.",
    ),
    diagram(
      "skipLocked",
      "Workers claim different rows of the same table without waiting for each other, and jobs are inserted in the producer’s own transaction.",
      "An API and a scheduler insert rows into a jobs table in Postgres. Three workers on the right each lock a different row, labelled locked by W1, W2 and W3, while the remaining rows show as ready. Each worker skips rows that another holds.",
    ),
    code(
      "sql",
      `
CREATE TABLE jobs (
    id           uuid PRIMARY KEY DEFAULT uuidv7(),  -- time-ordered, index-friendly
    kind         text        NOT NULL,
    payload      jsonb       NOT NULL,
    run_at       timestamptz NOT NULL DEFAULT now(),
    attempts     int         NOT NULL DEFAULT 0,
    locked_until timestamptz
);
CREATE INDEX jobs_due ON jobs (run_at);

-- Claim up to ten due jobs. Rows held by other workers are skipped, not waited on.
WITH next AS (
    SELECT id FROM jobs
    WHERE run_at <= now()
      AND (locked_until IS NULL OR locked_until < now())
    ORDER BY run_at
    LIMIT 10
    FOR UPDATE SKIP LOCKED
)
UPDATE jobs
SET locked_until = now() + interval '5 minutes', attempts = attempts + 1
FROM next
WHERE jobs.id = next.id
RETURNING jobs.*;
`,
    ),
    p(
      "The lease in `locked_until` means a worker that dies mid-job releases it automatically after five minutes. Completed jobs should be deleted or moved to a history table quickly, because a queue table full of dead rows makes autovacuum work hard and the claim query slow. For high volumes, partition the history by day and drop old partitions instead of deleting rows.",
    ),
    p(
      "Libraries such as pg-boss, Procrastinate and River package this pattern with retries, scheduling and monitoring. Use one rather than hand-rolling the edge cases.",
    ),
    h2("Search with tsvector and GIN"),
    p(
      "Full-text search in Postgres handles stemming, ranking, phrase queries and web-style query syntax. For a product searching its own records it is usually enough, and it filters by tenant and permissions in the same query, which an external search engine cannot do without copying your access rules.",
    ),
    code(
      "sql",
      `
-- Postgres 18 makes generated columns VIRTUAL by default. An indexed
-- tsvector must be STORED, so say so explicitly.
ALTER TABLE articles ADD COLUMN search tsvector
    GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(body, '')), 'B')
    ) STORED;
CREATE INDEX articles_search ON articles USING gin (search);

SELECT id, title
FROM articles, websearch_to_tsquery('english', $2) AS query
WHERE tenant_id = $1 AND search @@ query
ORDER BY ts_rank(search, query) DESC
LIMIT 20;
`,
    ),
    p(
      "Add the `pg_trgm` extension for typo tolerance and prefix matching on short fields such as names and SKUs.",
    ),
    h2("Vectors with pgvector"),
    p(
      "pgvector stores embeddings next to the rows they describe and indexes them with HNSW. The practical advantage over a separate vector database is the filter: “nearest chunks for this tenant, in documents this user can see” is one query with a `WHERE` clause. Recent pgvector versions scan the index iteratively when a filter removes most candidates, which used to be the classic failure of filtered approximate search.",
    ),
    p(
      "In the AI support assistant I built, chunks sit in a pgvector column beside the documents they came from, so retrieval is one SQL query with the same tenant `WHERE` clause as everything else. Combine vector similarity with the full-text index above and you have hybrid search in the same round trip.",
    ),
    h2("What Postgres 18 changed"),
    ul(
      "Asynchronous I/O. A new I/O subsystem, chosen with `io_method`, can issue reads ahead of need. Sequential scans, bitmap heap scans and vacuum benefit most.",
      "`uuidv7()`. Time-ordered UUIDs insert at the right edge of the B-tree instead of at random pages, so primary key indexes stay smaller and hotter in cache than with `gen_random_uuid()`.",
      "Skip scan. A multicolumn B-tree index can now serve queries that do not filter on its leading column, when that column has few distinct values. Some redundant indexes can go.",
      "Virtual generated columns, now the default, computed on read and taking no space.",
      "Major version upgrades keep planner statistics, so the first hours after an upgrade no longer run on bad plans while `ANALYZE` catches up.",
    ),
    quote(
      "Most teams that outgrow Postgres outgrew one table, one query pattern or one workload. Move that, not everything.",
    ),
    h2("When to graduate"),
    diagram(
      "postgresEnvelope",
      "Postgres covers most of each workload. Move the specific workload that a measured limit pushes out, and only that one.",
      "A chart with five rows: job queue, search, vectors, documents and analytics. Each row has an accent bar for the Postgres feature that covers it, SKIP LOCKED, tsvector and GIN, pgvector and HNSW, jsonb and GIN, and materialized views, followed by a dashed remainder and a note on when to graduate: a log such as Kafka for many consumers replaying one stream, a search engine for relevance tuning and facets, a vector store for huge filtered indexes, a document store for schema-free writes at very high volume, and a columnar warehouse for scans over billions of rows.",
    ),
    p(
      "Graduation should be triggered by a measurement, not a feeling: a queue whose claim latency climbs despite tuning, search relevance that product needs to tune weekly, analytics queries that hurt transactional latency even on a replica. Then move that workload, keep Postgres as the source of truth, and feed the new system from it with change data capture.",
    ),
    h2("Operating it like you mean it"),
    ul(
      "Pool connections with PgBouncer in transaction mode. Postgres processes are expensive; thousands of idle connections are not free.",
      "Set `statement_timeout` and `idle_in_transaction_session_timeout` per role, so a forgotten transaction cannot hold locks for an hour.",
      "Keep `pg_stat_statements` on and look at it weekly. The top five queries by total time are where the work is.",
      "Tune autovacuum per table for the busy ones, especially queues.",
      "Send analytics to a replica, and point-in-time recovery at a restore you actually tested this quarter.",
    ),
    h2("The trade-offs"),
    ul(
      "One database is one blast radius. A runaway job query can now slow checkout, so isolate workloads with roles, timeouts and, eventually, separate instances.",
      "Postgres queues are pull-based. For many consumers reading one stream independently, a log is the right tool.",
      "Built-in search will not match a dedicated engine on relevance tuning, faceting or typo tolerance at scale.",
      "Your team has to get good at Postgres. That is a better investment than getting mediocre at five systems.",
    ),
    h2("Lessons"),
    ul(
      "Default to one transactional database and justify every addition with a measured limit.",
      "Enqueue jobs in the same transaction as the write that caused them.",
      "Filter by tenant inside the search and vector query, never after it.",
      "Use `uuidv7()` for new primary keys, and write `STORED` explicitly on generated columns you index.",
      "When you graduate, move one workload and keep Postgres as the source of truth.",
    ),
  ],
};
