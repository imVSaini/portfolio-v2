import { code, h2, p, quote, ul } from "@/data/article";
import { diagram, type PostSource } from "@/data/posts/schema";

export const platformEngineering: PostSource = {
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
  body: [
    p(
      "The 2025 DORA report found that nine in ten organisations have adopted some form of platform engineering, and that the quality of the internal platform is one of the strongest predictors of whether AI tools actually speed teams up. That second finding matters more than the first. A platform is not a portal; it is the set of defaults every team builds on.",
    ),
    p(
      "You do not need twenty people to have a good one. You need a few well-maintained golden paths, a GitOps loop and the discipline to treat other engineers as customers.",
    ),
    h2("A platform is a product"),
    p(
      "Internal platforms fail for the same reason external products do: they solve a problem the builders find interesting rather than one the users have. Treat it as a product with customers.",
    ),
    ul(
      "Measure adoption, not features shipped. What share of services run on the golden path?",
      "Track time to first production deploy for a new service, and for a new hire.",
      "Count the tickets and messages asking the platform team for help. Each one is a missing self-service path.",
      "Start with the thinnest viable platform: often a template, a shared deployment base and good documentation.",
    ),
    h2("Golden paths, not golden cages"),
    p(
      "A golden path is a supported, opinionated way to build a common kind of thing, such as an HTTP service or a worker, that is production-ready from the first commit. Following it is optional; it is simply much easier than not.",
    ),
    diagram(
      "goldenPath",
      "One command creates a service with its pipeline, build, deploy config, dashboards, alerts and ownership already in place.",
      "A template on the left fans out to six outputs: a CI pipeline, a container build, deploy configuration, dashboards, alerts and an SLO, and an owner with a runbook. All six feed into a production service on the right, ready on day one, not month two. A note says leaving the path is allowed, but the team then owns its own on-call, upgrades and patches.",
    ),
    ul(
      "Generate everything a service needs, not just code: CI, Dockerfile, manifests, a dashboard, alerts tied to an SLO, a `CODEOWNERS` entry and a runbook stub.",
      "Keep templates updatable. Tools such as Copier can re-apply a template to existing services, so improvements reach old services, not only new ones.",
      "Make the paved road the fast road. If the template takes longer than copying another repo, people will copy another repo.",
      "Be explicit about leaving the path: allowed, but the team then owns its own upgrades, security patches and on-call.",
    ),
    h2("GitOps: the cluster pulls"),
    p(
      "In GitOps, the desired state of every environment lives in a Git repository, and an agent inside the cluster, such as Argo CD or Flux, continuously makes the cluster match it. CI never gets credentials to the cluster. A deploy is a merged commit; a rollback is a revert.",
    ),
    diagram(
      "gitopsLoop",
      "CI builds and signs the image, then opens a pull request that bumps its tag. Argo CD pulls the config repo and reconciles the cluster, reverting any manual drift.",
      "Top row: a developer opens a pull request in the app repo, CI builds, tests and signs, and pushes signed images to a registry. CI also opens a pull request that bumps the image tag in the config repo, which holds the desired state. Bottom row: Argo CD pulls the config repo and reconciles the cluster, which pulls the image from the registry. A dashed loop from the cluster back to Argo CD shows drift being detected and reverted.",
    ),
    code(
      "yaml",
      `
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: services
  namespace: argocd
spec:
  goTemplate: true
  generators:
    - git:
        repoURL: https://github.com/acme/platform-config.git
        revision: main
        directories:
          - path: services/*/production
  template:
    metadata:
      name: "{{ index .path.segments 1 }}"
    spec:
      project: default
      source:
        repoURL: https://github.com/acme/platform-config.git
        targetRevision: main
        path: "{{ .path.path }}"
      destination:
        server: https://kubernetes.default.svc
        namespace: "{{ index .path.segments 1 }}"
      syncPolicy:
        automated:
          prune: true
          selfHeal: true   # revert manual changes to match Git
        syncOptions:
          - CreateNamespace=true
`,
    ),
    p(
      "One `ApplicationSet` turns every directory under `services/` into a deployed application. Adding a service is adding a folder, which the golden-path template does for you.",
    ),
    h2("Where GitOps hurts"),
    ul(
      "Secrets do not belong in Git. Use the External Secrets Operator to sync from a secret manager, or encrypt with SOPS.",
      "Ordering matters. A database migration job must finish before the new deployment rolls out; sync waves and hooks express that, and need testing.",
      "Promotion between environments is a workflow of its own. Pull requests that copy a tag from staging to production work; tools such as Kargo automate it.",
      "Tag-bump commits create noise. Batch them, or let an image updater write them.",
      "“Why has it not synced?” needs a good answer in the platform’s documentation, because it will be asked weekly.",
    ),
    quote(
      "The highest-leverage thing a platform does is absorb a migration once, so a hundred services do not each do it alone.",
    ),
    h2("Absorbing migrations"),
    p(
      "In November 2025 the Kubernetes project announced that the community Ingress NGINX controller would be retired, with maintenance ending in March 2026. For teams that each owned their own ingress configuration, that meant every service team had to learn Gateway API and migrate on its own.",
    ),
    p(
      "For teams on a golden path, the platform migrated the shared gateway and the template once, converted existing routes with tooling, and every service picked up the change through a pull request to the config repo. That is the clearest argument for a platform: the cost of a change scales with the number of paths, not the number of services.",
    ),
    h2("The small-team version"),
    ul(
      "One config repository and Argo CD.",
      "One template for an HTTP service and one for a worker.",
      "One shared deployment base, with Kustomize or a Helm chart, that templates reference rather than copy.",
      "Default dashboards and alerts generated per service.",
      "A weekly office hour and a short page of documentation for each common question.",
    ),
    h2("The trade-offs"),
    ul(
      "Opinionated defaults will not fit every service. The escape hatch must exist and must carry clear responsibilities.",
      "Templates need owners. An unmaintained golden path rots into a trap that generates last year’s mistakes.",
      "GitOps adds a hop: a deploy is a pull request and a sync, not a command. That is slower for an individual and safer for everyone.",
      "Centralising migrations makes the platform team a bottleneck if it is not funded for them.",
    ),
    h2("Lessons"),
    ul(
      "Treat the platform as a product and measure adoption and time to first deploy.",
      "Make golden paths production-ready on day one, updatable and faster than the alternative.",
      "Let the cluster pull from Git; keep cluster credentials out of CI.",
      "Plan for secrets, ordering and promotion before they surprise you.",
      "Use the platform to absorb migrations once for everyone.",
    ),
  ],
};
