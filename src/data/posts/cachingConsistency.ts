import { code, h2, p, ul, type PostSource } from "@/data/posts/schema";

export const cachingConsistency: PostSource = {
  slug: "caching-is-a-consistency-decision",
  title: "Caching is a consistency decision that happens to make things fast",
  excerpt:
    "Before adding Redis, agree on how stale a number is allowed to be and who is allowed to see it. Why I chose a 60-second refresh-ahead over invalidation for our heaviest dashboard query, and how scope-aware keys stop one user’s totals reaching another.",
  topic: "Performance",
  date: "2026-10-06",
  tint: "gold",
  art: "cache",
  body: [
    p(
      "A cache is easy enough to add that it gets treated as a performance tweak. It is really a decision to show people data that may be wrong for a while. Speed is what you receive in exchange, so the terms of that exchange deserve to be written down first.",
    ),
    h2("Start with a staleness budget"),
    p(
      "For every number you plan to cache, ask whoever owns the screen how old it is allowed to be. For pipeline totals on a dashboard, a minute was fine. For the record a user has just edited, the answer is zero. Those are different kinds of data and they should not share a strategy.",
    ),
    h2("Refresh ahead instead of invalidating"),
    p(
      "Invalidation asks every write path to know every key it affects. For an aggregate that reads from many tables, that list is long, it grows with each feature, and one missed path means a wrong number with no error anywhere.",
    ),
    p(
      "So the heaviest dashboard query does not run in a request at all. Celery Beat recomputes it every 60 seconds and overwrites the key, and requests only ever read Redis. That gives three properties I care about:",
    ),
    ul(
      "No user pays for the query, including the first one after a deploy.",
      "There is no stampede on expiry, because nothing is waiting for a key to expire.",
      "Staleness is bounded and easy to explain: “up to a minute old”.",
    ),
    p(
      "The cost is computing results nobody is looking at. Refreshing only tenants and scopes that were active recently keeps that in check.",
    ),
    h2("Scope belongs in the key"),
    p(
      "A cached total is the answer to a question asked by someone with particular permissions. If a manager sees the whole team’s deals and a rep sees only their own, a key per tenant would serve one person’s numbers to the other. The scope has to be part of the key:",
    ),
    code(
      "python",
      `
def dashboard_key(tenant_id: str, scope: Scope) -> str:
    return f"dash:v1:{tenant_id}:{scope.kind}:{scope.id}"
`,
    ),
    p(
      "`scope` is resolved from the caller’s role on the server, never taken from the request. The version prefix lets the payload change shape without flushing Redis.",
    ),
    h2("Say it on the screen"),
    p(
      "“Updated 40 seconds ago” next to the numbers makes the trade visible, and it ends the bug reports that begin with “I just closed a deal and the total did not change”.",
    ),
    h2("When not to cache"),
    p(
      "If an index or a better query makes the request fast enough, do that instead. A cache is a second copy of the truth, and you maintain both for as long as the feature lives.",
    ),
  ],
};
