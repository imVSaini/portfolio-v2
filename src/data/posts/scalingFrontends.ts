import type { Post } from "@/data/posts/schema";

export const scalingFrontends: Post = {
  slug: "scaling-frontends-across-teams",
  title: "Scaling a frontend across teams: modular monolith first, micro-frontends last",
  excerpt:
    "Frontends stop scaling when the team grows, not when the traffic does: merge conflicts, unclear ownership, a design system nobody follows and one team’s change breaking another’s page. A modular monolith in a monorepo, with enforced boundaries, a token-based design system and a modern CSS platform, solves most of it. Micro-frontends solve the rest, at a price worth knowing first.",
  metaTitle: "Scaling a frontend across teams",
  metaDescription:
    "A modular monolith with enforced boundaries, design tokens and modern CSS fixes most team-scaling pain. When micro-frontends are worth their price.",
  topic: "Frontend",
  date: "2026-08-26",
  tint: "orange",
  art: "modules",
};
