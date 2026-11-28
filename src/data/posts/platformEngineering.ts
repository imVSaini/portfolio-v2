import type { Post } from "@/data/posts/schema";

export const platformEngineering: Post = {
  slug: "platform-engineering-and-gitops",
  title: "Platform engineering without a platform team of twenty: golden paths and GitOps",
  excerpt:
    "Platform engineering earned a bad name from developer portals nobody opened. The idea underneath is sound: make the right way the easiest way. A handful of golden paths and a GitOps loop give a small team most of the benefit: new services that are production-ready on day one, deploys that are a merged commit, drift that reverts itself and migrations done once for everyone.",
  metaTitle: "Golden paths, GitOps and platforms",
  metaDescription:
    "Make the right way the easy way: golden-path templates, a GitOps loop with Argo CD, and a platform that absorbs migrations once for every team.",
  topic: "DevOps",
  date: "2026-08-19",
  tint: "red",
  art: "paved",
};
