import type { Post } from "@/data/posts/schema";

export const aiCodeReview: Post = {
  slug: "code-review-when-ai-writes-the-code",
  title: "Engineering standards when AI writes half the code: review, gates and ownership",
  excerpt:
    "Coding agents now draft a large share of the code that reaches review. Volume goes up, pull requests get bigger and plausible code hides subtle mistakes, while reviewer attention stays exactly where it was. Standards have to move from people’s heads into files the agent reads and gates that run before a person looks, so that human review can focus on intent, design and risk.",
  metaTitle: "Code review when AI writes the code",
  metaDescription:
    "Agents write more code than people can review. Rules the agent reads, gates before humans, small PRs, and review focused on intent, design and risk.",
  topic: "Leadership",
  date: "2026-10-21",
  tint: "magenta",
  art: "review",
};
