import { code, h2, p, quote, ul } from "@/data/article";
import { diagram, type PostSource } from "@/data/posts/schema";

export const progressiveDelivery: PostSource = {
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
  body: [
    p(
      "Every team that deploys often eventually ships a bad change to everyone at once. The fix is not to deploy less often. It is to make each deploy reach a few users first, measure whether it made things worse, and stop automatically if it did, before a person has finished reading the alert.",
    ),
    p(
      "That is progressive delivery: canary releases, feature flags and automated analysis working together so that most bad changes are caught at 5% of traffic and rolled back by the pipeline.",
    ),
    h2("Deploy is not release"),
    p(
      "Deploying puts new code on servers. Releasing shows a change to people. Feature flags separate the two, so code can be in production for days, dark, before anyone sees it, and can be turned off again in seconds without a deploy.",
    ),
    diagram(
      "deployRelease",
      "Code ships dark behind a flag, then reaches staff, 1% of users, beta tenants and everyone. The kill switch returns it to off without a deploy.",
      "Top row, deploy: merge to a releasable main branch, an image built once and signed, and production with the flag off so the code is dark. Bottom row, release: staff first, then 1% of users while errors are watched, then beta tenants who opted in, then everyone, after which the flag is deleted. A red dashed kill-switch path returns from everyone to off in seconds, without a deploy.",
    ),
    ul(
      "Use a vendor-neutral flag API such as OpenFeature, so the flag provider can change without touching every call site.",
      "Separate release flags, which are temporary, from operational kill switches, which are permanent. They have different lifetimes and owners.",
      "Give every release flag an owner and a removal date. A flag older than a quarter is debt with a branch in every code path it touches.",
      "Evaluate flags by tenant as well as by user, so a B2B customer sees a consistent product across all its users.",
    ),
    h2("Self-deciding canaries"),
    p(
      "A canary deploy sends a small share of traffic to the new version, compares it with the stable version, and moves through larger shares only while the comparison stays healthy. The decision should be made by the pipeline, from metrics, every time.",
    ),
    diagram(
      "canarySteps",
      "Traffic moves to the canary in steps, with an analysis gate between each. Any failed gate aborts and returns all traffic to stable.",
      "Seven stages in a row: 5% of traffic, analyse, 25%, analyse, 50%, analyse, 100%. Small bars under each weight show the canary’s share filling up. The analysis gates check error rate under 1% and p95 latency under 400 milliseconds, then saturation and a business KPI. Red dashed lines from each gate lead to an abort and roll back step where stable keeps 100% and no one is paged.",
    ),
    p("With Argo Rollouts, the steps and the analysis live next to the deployment:"),
    code(
      "yaml",
      `
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: api
spec:
  strategy:
    canary:
      canaryService: api-canary
      stableService: api-stable
      trafficRouting:
        plugins:
          argoproj-labs/gatewayAPI:
            httpRoute: api
            namespace: production
      analysis:
        templates:
          - templateName: canary-health
        startingStep: 1
        args:
          - name: hash
            valueFrom:
              podTemplateHashValue: Latest
      steps:
        - setWeight: 5
        - pause: { duration: 10m }
        - setWeight: 25
        - pause: { duration: 10m }
        - setWeight: 50
        - pause: { duration: 15m }
---
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: canary-health
spec:
  args:
    - name: hash
  metrics:
    - name: error-rate
      interval: 2m
      failureLimit: 1
      successCondition: result[0] < 0.01
      provider:
        prometheus:
          address: http://prometheus.monitoring:9090
          query: |
            sum(rate(http_requests_total{rollouts_pod_template_hash="{{args.hash}}", code=~"5.."}[2m]))
            /
            sum(rate(http_requests_total{rollouts_pod_template_hash="{{args.hash}}"}[2m]))
`,
    ),
    h2("Good analysis metrics"),
    ul(
      "It is measured per version. The query filters on the canary’s pod template hash; a service-wide error rate dilutes the canary’s 5% into noise.",
      "It is a ratio, not a count. Errors per request stay comparable as traffic weight changes.",
      "It is compared with the stable version running at the same moment, not with a fixed number or last week, so time of day and traffic mix cancel out.",
      "It reacts within the pause. A metric that needs an hour of data cannot gate a ten-minute step.",
      "It includes one business signal, such as checkout success or sign-in completion. Some of the worst regressions return 200.",
    ),
    p(
      "Low-traffic services are the hard case: 5% of very little traffic is not enough data to decide anything. Use longer pauses, synthetic traffic that exercises the main paths, or larger first steps with tighter thresholds.",
    ),
    quote(
      "If a human has to look at a dashboard to decide whether to promote, the canary is a ritual, not a control.",
    ),
    h2("What a canary cannot protect"),
    p(
      "A canary splits traffic between two versions of the code. Everything they share is outside its protection: the database schema, message formats, caches and external APIs. A destructive migration hits 100% of users the moment it runs, whatever weight the canary is at.",
    ),
    ul(
      "Make every schema change backward compatible before the code that needs it ships, with expand and contract.",
      "Version message formats, and make consumers accept both versions during a rollout.",
      "Namespace cache keys by version when the cached shape changes.",
      "Treat configuration changes as deploys, with the same progressive steps.",
    ),
    h2("Traffic splitting in 2026"),
    p(
      "Gateway API is now the standard way to split traffic in Kubernetes, with weighted backends on an `HTTPRoute`. The community Ingress NGINX controller was retired in March 2026, which pushed many teams onto Gateway API implementations anyway. Argo Rollouts and Flagger both drive Gateway API routes, so canary weights become ordinary route weights rather than controller-specific annotations.",
    ),
    h2("The trade-offs"),
    ul(
      "Rollouts take longer. A three-step canary with pauses adds most of an hour to every release; fixes for urgent incidents need a documented fast path.",
      "Two versions run side by side during every deploy, so every change must be compatible with its predecessor.",
      "Flags add branches to the code and to the test matrix until they are removed.",
      "Automated analysis needs good metrics. Weak metrics produce false rollbacks, and teams learn to override them.",
    ),
    h2("Lessons"),
    ul(
      "Separate deploy from release with flags, and give release flags an expiry.",
      "Let the pipeline promote and roll back from metrics compared against stable.",
      "Measure the canary by version, by ratio, and include one business signal.",
      "Make schema, message and config changes backward compatible first; canaries cannot protect shared state.",
      "Rehearse the rollback. A rollback path that has never run is a guess.",
    ),
  ],
};
