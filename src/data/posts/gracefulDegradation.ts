import type { Post } from "@/data/posts/schema";

export const gracefulDegradation: Post = {
  slug: "graceful-degradation-under-load",
  title: "High availability is a budget: SLOs, load shedding and graceful degradation",
  excerpt:
    "Systems rarely go down because something broke. They go down because something slowed, retries multiplied the load, queues filled and every request timed out together. The services that stay up are the ones designed to fail partially: retry budgets instead of retry counts, load shed early and cheaply, and degradation levels chosen in advance rather than discovered during the incident.",
  metaTitle: "Load shedding and graceful degradation",
  metaDescription:
    "Outages are usually overload, not breakage. Retry budgets, early load shedding and planned degradation levels that keep the core working when parts can’t.",
  topic: "Architecture",
  date: "2026-09-02",
  tint: "gold",
  art: "shedding",
};
