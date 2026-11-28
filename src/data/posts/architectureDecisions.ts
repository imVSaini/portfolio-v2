import type { Post } from "@/data/posts/schema";

export const architectureDecisions: Post = {
  slug: "architecture-decisions-rfcs-and-adrs",
  title: "Architecture decisions that outlive you: RFCs, ADRs and the one-way door test",
  excerpt:
    "Teams get architecture decisions wrong in two opposite ways: one person decides in a hallway and nobody remembers why, or a committee takes six weeks over something that could be undone in a day. The fix is weight in proportion to risk: most decisions made fast in a pull request, a few through a written RFC with one named decider, and every significant one recorded as an ADR with a trigger for revisiting it.",
  metaTitle: "RFCs, ADRs and one-way door decisions",
  metaDescription:
    "Most decisions belong in a pull request; a few need an RFC with one decider. Sizing decisions by reversibility, and ADRs with a revisit trigger.",
  topic: "Leadership",
  date: "2026-08-12",
  tint: "magenta",
  art: "doors",
};
