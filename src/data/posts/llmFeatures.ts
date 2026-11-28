import type { Post } from "@/data/posts/schema";

export const llmFeatures: Post = {
  slug: "llm-features-in-production-backends",
  title: "Shipping LLM features in a production backend: retrieval, tools, evals and cost",
  excerpt:
    "The model call is one line of code. Everything around it is backend engineering: what context the model sees, what it is allowed to do, how you know an answer is right before customers do, and what each conversation costs. Lessons from shipping a retrieval-based support assistant and a tool-using task assistant into multi-tenant SaaS.",
  metaTitle: "LLM features in a production backend",
  metaDescription:
    "The model call is one line. Retrieval, typed tools with confirmation, prompt injection, evals in CI and per-tenant cost decide whether LLM features work.",
  topic: "Backend",
  date: "2026-11-11",
  tint: "gold",
  art: "retrieval",
};
