import { code, diagram, h2, p, ul, type PostSource } from "@/data/posts/schema";

export const databasePerformance: PostSource = {
  slug: "database-performance-beyond-clean-code",
  title: "Database performance: why your application is slow when the code looks perfect",
  excerpt:
    "Clean application code can still issue two hundred queries per request, scan a table for want of one index, or hold a lock while it waits on a network call. Where the time usually goes, how to find it with the query plan instead of a guess, and why a cache comes last.",
  topic: "Database",
  date: "2026-10-08",
  tint: "gold",
  art: "queryPlan",
  body: [
    p(
      "A slow endpoint gets reviewed, and the code is fine. It is readable, it is tested, the logic is linear. The request still takes two seconds, because the cost was never in the code. It was in what the code asked the database to do.",
    ),
    h2("Slow requests, clean code"),
    p(
      "An ORM makes a query look like an attribute access. That is its job, and it is also how a tidy loop over fifty deals turns into fifty-one queries. Nothing in the diff looks wrong. The only place the problem is visible is the query log.",
    ),
    h2("Where the time actually goes"),
    ul(
      "N+1 queries: one query for the list, then one more per row for a related record.",
      "Missing or unusable indexes: a filter on an unindexed column, or a function wrapped around an indexed one.",
      "Fetching too much: `SELECT *` on wide rows, or loading ten thousand rows to count them in Python.",
      "Connection handling: every request opening its own connection, or a pool smaller than the worker count.",
      "Long transactions: a lock held while the code calls an external API.",
    ),
    h2("Measure, then fix in order"),
    p(
      "The order matters, because the cheap fixes are also the most common. First count queries per request. Then take the slowest ones to the planner:",
    ),
    code(
      "sql",
      `
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, title, amount
FROM deals
WHERE owner_id = $1 AND stage = 'open'
ORDER BY updated_at DESC
LIMIT 20;
`,
    ),
    p(
      "A sequential scan over a large table followed by a sort means the database read everything to return twenty rows. A composite index on `(owner_id, stage, updated_at DESC)` lets it walk straight to them. Column order follows the query: equality filters first, then the sort.",
    ),
    diagram(
      "queryPlan",
      "The same query before and after the index. The work drops from the size of the table to the size of the answer.",
      "Two tables side by side. Before, a sequential scan and sort reads every row. After, a composite index reads only the twenty rows the query returns.",
    ),
    ul(
      "Remove N+1 with eager loading or a join, and select only the columns the response needs.",
      "Add indexes that match real filters and sorts, confirmed by the plan and not by intuition.",
      "Put a pooler in front of PostgreSQL once you have more workers than it has comfortable connections.",
      "Keep transactions short. Do the network call first, then open the transaction.",
      "Only then consider a cache.",
    ),
    h2("The trade-offs"),
    ul(
      "Every index speeds up some reads and slows every write to that table. Unused indexes are pure cost.",
      "Eager loading can over-fetch. Loading four relations to render one field is its own waste.",
      "Transaction-mode pooling breaks session features such as advisory locks and some prepared statements.",
      "A cache is a second copy of the truth. You inherit invalidation, staleness and one more thing to be down.",
    ),
    h2("A real example"),
    p(
      "At Assent Global I cut PostgreSQL query time by 35% without changing a line of business logic. The work was reading plans, rewriting the slow queries and giving them indexes they could use. A Redis cache went in front of the hottest reads only after that, when the remaining cost was volume and not waste.",
    ),
    p(
      "On the CRM I lead now, the heaviest dashboard query took the other route. It aggregates across many tables, so no index makes it cheap. It left the request path instead: Celery Beat recomputes it every 60 seconds, and the cache key includes the caller’s scope, so a rep’s totals are never served to a manager or the other way round.",
    ),
    h2("Lessons learned"),
    ul(
      "Log the query count and total database time per request. Most surprises show up there first.",
      "Test with production-sized data. Every query is fast on two hundred rows.",
      "Fix the query before you cache it. Caching a bad query hides the cost until the cache misses.",
      "Read the plan. It is the only description of what the database really did.",
    ),
  ],
};
