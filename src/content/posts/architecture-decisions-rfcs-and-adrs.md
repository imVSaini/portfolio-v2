Two years after a decision, the people who made it have often moved on, and the code is all that remains. Someone new looks at a schema-per-tenant database, or a message queue between two services that could have been a function call, and asks why. If nobody can answer, the decision gets relitigated, or worse, quietly undone by someone who did not know what it was protecting against.

Good decision-making in a growing team is less about making brilliant calls and more about making calls at the right speed, by the right person, and leaving a record that explains them.

## Size process to the decision

Some decisions are one-way doors: expensive or impossible to reverse once walked through. Most are two-way doors: if they turn out wrong, you walk back. The mistake is applying the same process to both. Add a second axis, how far the impact reaches, and four sensible processes fall out.

{% diagram name="doorTest" caption="Process weight follows two questions: how expensive is this to undo, and how many teams does it affect?" alt="A two by two grid. The horizontal axis runs from cheap to undo to expensive to undo; the vertical axis from one team to org-wide. Cheap and one team: decide in the PR, for example a form library or a retry count. Expensive and one team: a short design note, for example a table schema or a service boundary. Cheap and org-wide: announce, then decide, for example a log format or a shared CI template. Expensive and org-wide, highlighted: RFC and ADR, for example the tenancy model or the primary datastore." /%}

Most decisions land in the bottom-left quadrant and should take minutes. The process is only heavy where the cost of being wrong is high and widely shared.

## Writing a useful RFC

Writing forces clarity that a meeting never does. A good RFC is short, two to four pages, and makes the decision easy to check rather than easy to admire.

- The problem, and why it matters now. If nothing gets worse by waiting, it may not be time.
- Constraints: what must stay true, such as data isolation, latency targets, budget and team skills.
- Options, always including “do nothing” and at least one that the author does not favour, described fairly.
- A recommendation with its costs stated plainly: what it makes harder, what it rules out, what it will cost to run.
- How we will know we were wrong, and what we would do then.

## One decider, not a consensus

Consensus sounds respectful and produces either paralysis or the option nobody objected to strongly enough, which is rarely the best one. Name a single decider up front, usually the engineer who will own the outcome. Reviewers advise, the decider decides, and the RFC records any strong dissent alongside the decision. People commit far more readily to a decision they disagreed with when they can see their objection was understood and written down.

{% diagram name="rfcFlow" caption="Two-way doors skip straight to the pull request. One-way doors go through a time-boxed RFC, a named decider and an ADR with a revisit trigger." alt="First, a question: is this a two-way door, cheap to undo and affecting one team? Yes leads to deciding in the pull request, with the reason in the description. No leads down to a row of five steps: draft an RFC covering problem, options and cost; review asynchronously for five days; one owner decides; an ADR is merged beside the code; and a named trigger for revisiting it. A dashed loop from revisit back to draft notes that when the trigger fires, a new ADR supersedes the old one and links back to it." /%}

## ADRs: a decision log

An architecture decision record is a short document, stored in the repository next to the code it affects, that captures one decision: the context, the choice and its consequences. The format dates back to Michael Nygard in 2011 and has survived because it is small enough that people actually write it.

```markdown
# ADR-014: Schema-per-tenant isolation

Status: Accepted, 2026-03-02. Supersedes ADR-006.
Decider: lead engineer. Consulted: backend team, security.

## Context
Customers require hard data isolation, plus per-tenant export and deletion.
Row-level filtering depends on every query remembering a WHERE clause.

## Decision
Each tenant gets its own PostgreSQL schema. Shared reference data stays in public.

## Consequences
- Export, deletion and restore work per schema.
- Migrations run once per tenant; we need a resumable runner with a concurrency limit.
- Cross-tenant reporting moves to a nightly pipeline.

## Revisit when
Tenant count passes 5,000, or one migration run across all tenants exceeds 30 minutes.
```

- Keep ADRs immutable. When a decision changes, write a new ADR that supersedes the old one and link them both ways. The history is the point.
- Store them in the repository, where they are versioned, reviewed and found by search, not in a wiki that drifts.
- Write the consequences honestly, including the bad ones. They are what the next engineer most needs to know.

> Treat every significant decision as a hypothesis with an expiry condition. Then revisiting it is routine, not a confession.

## Revisit triggers

Decisions are made under assumptions about scale, team size, cost and technology. A revisit trigger names the measurement that would invalidate those assumptions: a tenant count, a latency, a monthly bill, a team growing past a size. Put it in the ADR and, ideally, on a dashboard or in an alert. When it fires, the conversation starts from the original reasoning instead of from scratch.

## Reviews without bottlenecks

- Publish guidelines and golden paths, so most designs need no review at all.
- Run review as open office hours rather than a gate every change must pass.
- Review the risky parts of a design, such as data model, failure handling and security boundaries, not the whole document line by line.
- Time-box it. An RFC review window of five working days keeps decisions moving.

## With AI in the loop

Decision records have a new reader. Coding agents work from the context they are given, and a repository with ADRs and an instructions file tells them which patterns are deliberate. Agents are also useful for drafting the options section of an RFC and for finding where existing code contradicts a recorded decision. What they cannot own is the judgement about trade-offs specific to your product, team and risk appetite. That stays with the decider.

## The trade-offs

- Writing takes time. For two-way doors it is time wasted, which is why most decisions should skip it.
- A single decider concentrates responsibility. That is the purpose, and it needs a culture where decisions can be wrong without blame.
- ADRs only help if people read them. Link them from the code they explain and from onboarding.
- Revisit triggers need someone watching. Without an owner they are decoration.

## Lessons

- Size process to reversibility and reach; most decisions belong in a pull request.
- Write RFCs that include “do nothing” and an honest list of costs.
- Name one decider and record dissent instead of chasing consensus.
- Record significant decisions as immutable ADRs next to the code, with consequences and a revisit trigger.
- Give the next engineer, and the next agent, the reasons, not just the result.
