import type { Post } from "@/data/posts/schema";

export const cellArchitecture: Post = {
  slug: "cell-based-architecture-blast-radius",
  title: "Cell-based architecture: shrinking the blast radius of every failure",
  excerpt:
    "Replicas protect you from a dead machine. They do nothing about a bad deploy, a poison request or one tenant melting the shared database, because every replica runs the same code against the same data. Cells split the system into complete, independent copies that each serve a slice of tenants, so a failure takes out a slice instead of the service.",
  metaTitle: "Cell architecture and blast radius",
  metaDescription:
    "Replicas survive dead machines, not bad deploys. How cells, a thin router and shuffle sharding limit a failure to a slice of tenants, and what that costs.",
  topic: "Architecture",
  date: "2026-11-18",
  tint: "soot",
  art: "cells",
};
