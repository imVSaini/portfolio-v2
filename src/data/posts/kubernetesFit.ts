import { code, diagram, h2, p, quote, ul, type PostSource } from "@/data/posts/schema";

export const kubernetesFit: PostSource = {
  slug: "do-you-really-need-kubernetes",
  title: "Kubernetes: do you really need it for your application?",
  excerpt:
    "Kubernetes solves real problems: scheduling many services across many machines, self-healing, rolling deploys and service discovery. It also brings a platform that someone has to run. A way to tell whether you have the problems it solves, and what to use until you do.",
  topic: "Cloud",
  date: "2026-10-15",
  tint: "red",
  art: "cluster",
  body: [
    p(
      "Kubernetes is often chosen before the application has a second service. The reasoning is that it is the standard, so starting there avoids a migration later. That treats an operational platform as a free default, and it is neither free nor a default.",
    ),
    h2("The problems it solves"),
    p("It is worth being precise about what you get, because all of it is real:"),
    ul(
      "Scheduling: placing many containers across many machines and moving them when a machine dies.",
      "Self-healing: health checks that restart or replace what stops responding.",
      "Rolling deploys and rollbacks as a built-in, declarative operation.",
      "Service discovery and load balancing between services that come and go.",
      "Horizontal scaling driven by metrics.",
    ),
    h2("The complexity you take on"),
    p(
      "In exchange you run a distributed system in order to run your distributed system. Networking, ingress, certificates, secrets, resource requests and limits, RBAC, cluster upgrades several times a year, and a YAML surface large enough to need its own tooling. A managed control plane removes some of that, not most of it.",
    ),
    p(
      "The cost is paid in attention. For a small team, the engineer who understands the cluster is the same engineer who was meant to be building the product.",
    ),
    h2("How to tell whether you need it"),
    ul(
      "Do you run enough services that placing them by hand is a recurring task?",
      "Do different workloads need to scale independently, and often?",
      "Do several teams deploy on their own schedules to shared infrastructure?",
      "Is there someone whose job includes operating the platform?",
    ),
    p(
      "With two or more firm yeses, Kubernetes will probably repay its cost. With none, a simpler target does the same job: a managed container service, a platform-as-a-service, or a couple of virtual machines running containers behind Nginx with health checks and a deploy script.",
    ),
    quote("Adopt the platform when you have the problem, not when you have the résumé gap."),
    h2("The trade-offs"),
    ul(
      "Staying simple means a migration later if you succeed. Containers keep that migration small: the image is the same, only the thing that runs it changes.",
      "Managed container services are easy until you need something they do not expose.",
      "Kubernetes gives one way to run everything, which is valuable at ten services and overhead at two.",
      "Autoscaling does not help if the bottleneck is the database, and it usually is.",
    ),
    h2("A real example"),
    p(
      "Take a typical B2B SaaS: an API, a background worker, PostgreSQL and Redis, with traffic that follows office hours. The stateful parts belong on managed services whatever you choose. What remains is two stateless processes. Running those needs a container image, a health check, a zero-downtime restart and a way to roll back to the previous image. All four are available without a cluster.",
    ),
    diagram(
      "hosting",
      "Two stateless containers on one host, with the stateful parts on managed services.",
      "Nginx forwards requests to an API container. The API and a worker container run on one host. The API talks to managed Postgres and Redis, and the worker reads its jobs from Redis.",
    ),
    p(
      "Readiness is the piece most often missing, and it is the same code whatever runs the container:",
    ),
    code(
      "python",
      `
@app.get("/healthz")
async def live() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/readyz")
async def ready(db: AsyncSession = Depends(get_db)) -> dict[str, str]:
    await db.execute(text("SELECT 1"))
    return {"status": "ready"}
`,
    ),
    p(
      "If the service does move to a cluster one day, Kubernetes only has to be told where those endpoints are:",
    ),
    code(
      "yaml",
      `
readinessProbe:
  httpGet:
    path: /readyz
    port: 8000
  periodSeconds: 5
livenessProbe:
  httpGet:
    path: /healthz
    port: 8000
resources:
  requests: { cpu: 250m, memory: 256Mi }
  limits: { memory: 512Mi }
`,
    ),
    p(
      "The picture changes when the same company runs twenty services owned by five teams. At that point the alternative to Kubernetes is not simplicity. It is a home-made platform with worse documentation.",
    ),
    h2("Lessons learned"),
    ul(
      "Build container images, health endpoints and twelve-factor configuration from day one. They are cheap and they keep every option open.",
      "Choose the deploy target for the team you have this year.",
      "If you adopt Kubernetes, use a managed offering and keep the cluster boring: few add-ons, defaults where possible.",
      "Whatever runs your containers, set resource limits and readiness checks. Most “Kubernetes problems” are an application that never said when it was ready.",
    ),
  ],
};
