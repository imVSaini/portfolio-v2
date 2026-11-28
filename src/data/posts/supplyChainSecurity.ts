import type { Post } from "@/data/posts/schema";

export const supplyChainSecurity: Post = {
  slug: "software-supply-chain-security",
  title: "Software supply chain security after Shai-Hulud: lockfiles, provenance and signed builds",
  excerpt:
    "In September 2025 a self-replicating worm spread through npm by stealing publishing tokens from developer machines and CI, then publishing infected versions of its victims’ own packages. It made the point plainly: your dependencies and your build pipeline are part of your attack surface. The controls that matter at each stage, from cooldowns and pinned actions to keyless signing and admission checks.",
  metaTitle: "Supply chain security after Shai-Hulud",
  metaDescription:
    "A worm spread through npm by stealing CI tokens. Lockfiles, release cooldowns, pinned actions, OIDC, provenance and admission checks: what matters.",
  topic: "DevOps",
  date: "2026-10-28",
  tint: "red",
  art: "chain",
};
