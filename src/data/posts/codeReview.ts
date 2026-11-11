import { h2, p, quote, ul, type PostSource } from "@/data/posts/schema";

export const codeReview: PostSource = {
  slug: "code-review-is-architecture",
  title: "Code review is where architecture actually happens",
  excerpt:
    "Design documents describe intent; merged pull requests decide the system. What I look for when reviewing across five products, what I deliberately leave to linters, and how to hold a standard without becoming the bottleneck for every change.",
  topic: "Leadership",
  date: "2026-05-12",
  tint: "orange",
  art: "review",
  body: [
    p(
      "A design document describes the system someone intended. The system that exists is the sum of what was merged. Reviewing code across five products has convinced me that review is where architecture is really decided, a few hundred lines at a time.",
    ),
    h2("What I read for"),
    ul(
      "Data model and migrations. They are the hardest thing to reverse, so they get the most attention.",
      "Boundaries. A new dependency, a changed API contract, a module reaching into another’s tables.",
      "Failure handling. What happens when this call times out, or runs twice?",
      "Tenancy and permissions on every new query.",
      "Tests that would fail if the behaviour broke, and not only if the code moved.",
    ),
    h2("What I leave to machines"),
    p(
      "Formatting, import order, naming conventions and unused code belong to the formatter and the linter. A human comment about any of them costs attention twice, once to write and once to read, and it buries the comment that mattered.",
    ),
    quote(
      "If the same comment appears on three pull requests, it belongs in a lint rule or a document, not in a fourth comment.",
    ),
    h2("Holding a standard without being the bottleneck"),
    ul(
      "Write a decision down once, briefly, so a review can link to it instead of arguing it again.",
      "Ask for small pull requests. A large one gets a skim and an approval.",
      "Mark every comment as blocking or optional, so the author knows what a merge needs.",
      "Review the design before the code when a change is big. It is cheaper to disagree with a paragraph.",
      "Spread review across the team. If only one person can approve, that person is the release schedule.",
    ),
    h2("Review teaches in both directions"),
    p(
      "A question such as “what happens if this runs twice?” teaches more than “make this idempotent”, and sometimes the answer shows that I was the one who had missed something. The aim is a team that would catch the problem without me.",
    ),
  ],
};
