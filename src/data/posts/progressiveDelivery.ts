import type { Post } from "@/data/posts/schema";

export const progressiveDelivery: Post = {
  slug: "progressive-delivery-canary-analysis",
  title: "Progressive delivery: canaries, feature flags and rollbacks nobody has to run",
  excerpt:
    "Continuous delivery made shipping fast. Progressive delivery makes being wrong in production cheap: expose a change to a small slice of traffic, compare it with what is already running, and expand or roll back automatically. Separating deploy from release with flags, writing analysis that actually decides, and the parts of a change, like the schema, that cannot be canaried.",
  metaTitle: "Progressive delivery with canaries",
  metaDescription:
    "Expose a change to 5% of traffic, compare it with stable and let the pipeline promote or roll back. Flags, canary analysis with Argo Rollouts, limits.",
  topic: "DevOps",
  date: "2026-09-23",
  tint: "red",
  art: "canary",
};
