import { code, diagram, h2, p, quote, ul, type PostSource } from "@/data/posts/schema";

export const technicalDebt: PostSource = {
  slug: "technical-debt-and-architecture-decisions",
  title: "Technical debt: why good developers sometimes make bad architecture decisions",
  excerpt:
    "Most technical debt is not written by careless people. It comes from sensible decisions made with the information and the deadline of the day, which then outlive both. How to tell deliberate debt from accidental, how to record a shortcut so it can be repaid, and how to refactor without stopping delivery.",
  topic: "Leadership",
  date: "2026-09-10",
  tint: "orange",
  art: "debt",
  body: [
    p(
      "When a team inherits a difficult codebase, the first explanation is usually that whoever came before did not know better. I have been the person who came before often enough to know that is rarely true. The decisions were reasonable. The circumstances changed and the decisions stayed.",
    ),
    h2("Nobody decides to build a mess"),
    p(
      "A table gets a nullable column because the migration had to ship that week. A module calls another’s internals because the proper interface would have taken a sprint. Each choice is defensible on the day. The difficulty arrives later, as the sum of many defensible choices that nobody was tracking.",
    ),
    h2("Why capable people make these choices"),
    ul(
      "Deadlines are visible and maintainability is not. The cost of a shortcut is paid by a future team that is not in the room.",
      "Requirements were different. The design fitted one customer and now serves fifty.",
      "A proof of concept was promoted to production because it worked.",
      "The fashionable option was chosen for a problem the team did not have.",
      "Nobody owned the decision, so nobody revisited it.",
    ),
    p(
      "It helps to separate two kinds of debt. Deliberate debt is a shortcut taken knowingly, with a reason. Accidental debt is a design that turned out wrong as you learned more. The first is a financing decision. The second is the ordinary cost of learning, and no process removes it.",
    ),
    h2("Make the debt visible, then pay it where you work"),
    ul(
      "Record significant decisions briefly: the context, the choice, what was given up, and what would make you revisit it.",
      "When you take a shortcut, write down the trigger for repaying it, such as “before the second tenant” or “when this table passes a million rows”.",
      "Refactor in the path of feature work. The code you are about to change is the code worth improving.",
      "Replace large legacy areas incrementally, routing one slice at a time to the new implementation. Rewrites from scratch nearly always take longer than the system they replace keeps changing.",
      "Give maintenance a standing share of every cycle. Debt that needs special permission to fix does not get fixed.",
    ),
    p(
      "A decision record does not need a template. For example, six lines are enough, as long as the last two are honest:",
    ),
    code(
      "yaml",
      `
decision: Store custom fields as JSONB on the deal row
date: 2026-03-04
context: Tenants need custom fields this quarter, and the shapes differ per tenant.
gave_up: Per-field indexes and type checks in the database.
revisit_when: A tenant filters on a custom field across more than 100k deals.
owner: backend
`,
    ),
    quote(
      "Debt is not the problem. Debt that nobody wrote down is, because it cannot be prioritised, only discovered.",
    ),
    h2("The trade-offs"),
    ul(
      "Refactoring that touches no upcoming feature is hard to justify, and often should not be. Some ugly code is stable, rarely read and best left alone.",
      "Incremental replacement means running two implementations for a while, and that has a cost too.",
      "Decision records take time to write and can turn into ceremony. A few honest paragraphs beat a template.",
      "Sometimes shipping the shortcut is right. Being late to market is a debt as well, and it carries interest.",
    ),
    h2("A real example"),
    p(
      "Reviewing code across five products, I have come to treat review as the place where debt is either taken on knowingly or slips in. The data model and migrations get the most attention, because they are the hardest thing to reverse. A shortcut in a handler can be rewritten in an afternoon. A shortcut in the schema becomes every query’s problem.",
    ),
    diagram(
      "reversal",
      "Review effort should follow the cost of being wrong, not the size of the diff.",
      "Four bars rising left to right show the cost of undoing a decision: handler code is cheapest, then a module boundary, then a public API, and the database schema is the most expensive.",
    ),
    p(
      "So the question I ask in review is not “is this perfect?” It is “if this turns out wrong, what does undoing it cost?” A cheap answer means ship it. An expensive one means the design gets another hour now.",
    ),
    h2("Lessons learned"),
    ul(
      "Judge past decisions by what was known then. You will want the same courtesy.",
      "Spend your caution on what is expensive to reverse: schemas, public APIs, service boundaries. Move fast on the rest.",
      "Explain debt to the business as risk and delay, with examples. “The code is messy” persuades nobody.",
      "If the same workaround appears three times, it is no longer a workaround. It is the architecture, so make it a deliberate one.",
    ),
  ],
};
