import { code, h2, p, ul } from "@/data/article";
import { diagram, type CaseStudy } from "@/data/caseStudies/schema";

export const leadCrm: CaseStudy = {
  slug: "lead-management-crm",
  title: "Lead Management CRM",
  category: "B2B SaaS",
  headline:
    "A multi-tenant lead management CRM: a Postgres schema per workspace, scoped roles, an audit log nobody can edit and leads that flow in from Facebook and Instagram ads.",
  summary:
    "Building a schema-per-tenant lead management CRM on FastAPI and PostgreSQL: scoped roles, an append-only audit log, Meta Lead Ads ingestion and what each cost.",
  date: "2026-11-12",
  tint: "orange",
  art: "pipeline",
  facts: [
    { label: "Role", value: "Lead engineer, schema to tests" },
    { label: "Started", value: "August 2026" },
    { label: "Platform", value: "Web app and REST API" },
    { label: "Status", value: "In production" },
  ],
  metrics: [
    { value: "80", label: "API endpoints" },
    { value: "22", label: "Tables: 9 shared, 13 in every tenant schema" },
    { value: "261", label: "Automated tests: 135 API, 126 in the browser" },
    { value: "60s", label: "Between dashboard cache refreshes" },
  ],
  stack: [
    "Python 3.12",
    "FastAPI",
    "SQLAlchemy 2",
    "Alembic",
    "PostgreSQL 16",
    "Redis 7",
    "Celery",
    "Meta Graph API",
    "Next.js 16",
    "React 19",
    "TypeScript",
    "Tailwind CSS 4",
    "Zustand",
    "Playwright",
  ],
  overview: [
    h2("The problem"),
    p(
      "The CRM is a lead management system for B2B sales teams: leads, a drag-and-drop pipeline, notes, an activity timeline, a dashboard, and stages, sources and custom fields that each workspace defines for itself. A platform admin creates every workspace. There is no public sign-up.",
    ),
    p(
      "Leads are not only typed in. A workspace connects its Facebook Pages once, maps each lead-ad form to a product, an owner and a starting stage, and submissions from Facebook and Instagram land in the pipeline on their own.",
    ),
    p(
      "The features are ordinary CRM. The engineering problem is that every customer is a separate company with its own data, its own roles and its own idea of what a pipeline is, and one forgotten `WHERE` clause would show one company’s leads to another. I wanted isolation that did not depend on every query remembering a filter.",
    ),
    h2("Constraints I set"),
    ul(
      "Tenant isolation enforced below the application code, so a missing filter cannot leak rows.",
      "One identity across workspaces. A person signs in once and can hold a different role in each workspace they belong to.",
      "Permissions that tell “my leads” from “all leads”, because that is how sales teams are organised.",
      "An audit trail that neither an admin nor a bug can rewrite.",
      "No ad lead lost or doubled, whatever the webhook does.",
      "Nothing I could not run on one machine with Docker Compose.",
    ),
    h2("Architecture"),
    p(
      "The backend is FastAPI on SQLAlchemy 2 and PostgreSQL 16, with Redis for caching, refresh tokens and the Celery broker. The frontend is a Next.js 16 app on React 19. Global tables live in the `public` schema: tenants, users, memberships, invitations, MFA secrets and passkeys. Each workspace gets a `tenant_<slug>` schema of 13 tables that holds its leads, stages, custom fields, roles, permissions and audit log.",
    ),
    p(
      "Every tenant request passes through the same chain of dependencies: verify the JWT, load the user, confirm the membership, bind a database session to the tenant’s schema, then check the permission the endpoint asks for. A handler never chooses a schema and never holds a session that can reach another tenant.",
    ),
    diagram(
      "tenantRequest",
      "Every tenant request runs the same chain, and the session it ends with can see one schema only.",
      "A request passes through JWT, membership, session, permission and handler in turn. The membership check reads the public schema. The session is bound to the tenant_acme schema and has no path to tenant_globex.",
    ),
    code(
      "python",
      `
@lru_cache(maxsize=128)
def tenant_engine(tenant_schema: str) -> Engine:
    return engine.execution_options(
        schema_translate_map={None: tenant_schema}
    )


@contextmanager
def tenant_session(tenant_schema: str) -> Iterator[Session]:
    session = SessionLocal(bind=tenant_engine(tenant_schema))
    try:
        yield session
    finally:
        session.close()
`,
    ),
    p(
      "The translate map lives on the engine rather than on the connection because a connection-level option is dropped at the first commit. The next refresh or lazy load then resolves table names against `public`, where the tenant tables do not exist. The engine view shares the parent pool, so a hundred tenants do not mean a hundred pools.",
    ),
    p(
      "Search is `ILIKE` backed by trigram GIN indexes. Deletes are soft, and a daily job empties the recycle bin after 30 days, one tenant at a time so a failure in one schema does not stop the rest.",
    ),
    h2("How leads get in"),
    p(
      "A lead reaches a workspace three ways: someone types it in, Meta sends it, or the workspace’s own website posts it. The last two have no signed-in user behind them, so each needs its own answer to the question the JWT normally settles: which workspace is this for?",
    ),
    p(
      "Ad leads come in through Meta’s Lead Ads webhook. Connecting is an OAuth flow that links every Page the user manages. Page tokens are encrypted before they are stored and never pass through the browser, and the OAuth `state` is signed with its own short-lived secret, so a leaked value cannot be replayed as a session. The webhook carries only a lead id and a Page id. The Page id finds the connection, and with it the workspace. The server then fetches the lead from the Graph API and writes it into that workspace’s schema, tagged with platform, campaign and form.",
    ),
    diagram(
      "metaLeads",
      "A webhook and a five-minute sweep feed the same claim, so a lead is written once whichever signal arrives first.",
      "The webhook and the sweep both lead to an event claim that is unique on the lead id. A claimed event is fetched from the Graph API with retries and written as a lead in the tenant’s schema, with its product, owner and stage taken from the form’s mapping.",
    ),
    p(
      "Website leads use an API key. A workspace admin issues a key tied to a list of allowed origins. The key is shown once, and only its hash is stored. A contact form or widget on the site posts the lead with the key in a header. The server matches the key, checks the request’s `Origin` against the list, and lets the key alone decide which workspace the lead belongs to.",
    ),
    p(
      "From there it is an ordinary write with a few rules of its own. An owner named by email is resolved only among that workspace’s active members. Source, campaign and UTM fields are stored as sent. A lead whose email or phone is already in the pipeline is saved anyway and flagged as a duplicate, because a returning prospect is worth seeing and a dropped submission is gone for good. The audit row records the caller’s address in place of a user.",
    ),
    diagram(
      "leadCapture",
      "A website form reaches its workspace through the API key, never through anything in the request body.",
      "The website form posts with an API key to a key gate that matches the hash and checks the origin list. The key selects the workspace. The lead is then validated, checked for duplicates by email or phone, and written with an audit row.",
    ),
    p(
      "A key that ships in page source is public, so the origin list is what ties it to the workspace’s own sites. That stops another website from borrowing the key. It does not stop a script that forges the header, which is why the endpoint is rate limited and can do one thing only: create a lead.",
    ),
  ],
  decisions: [
    {
      title: "A schema per tenant, not a tenant column",
      context:
        "A shared table with a `tenant_id` column is cheaper to run and easier to migrate, and it is one forgotten filter away from a data leak. Row-level security closes that gap, but moves the rule into policies that are harder to test than code.",
      chose:
        "One Postgres schema per workspace, selected by the engine through `schema_translate_map`. Tenant models name no schema; the session decides.",
      cost: "Every tenant migration runs once per schema, so Alembic has two branches and onboarding has to provision a schema. References from tenant tables to global users are plain UUIDs with no foreign key, and anything cross-tenant is a loop.",
    },
    {
      title: "Refresh tokens that notice their own theft",
      context:
        "Access tokens are short-lived. The refresh token is the valuable one, and a stolen copy looks exactly like the real one until both have been used.",
      chose:
        "Rotate on every refresh and remember each spent token in Redis. If a spent token comes back, every session in its family is revoked. In the browser, a single-flight promise and a cross-tab Web Locks lock keep the app’s own concurrent refreshes from looking like a replay.",
      cost: "Redis is now on the sign-in path, not a cache I can afford to lose. The tokens also sit in localStorage, so replay detection limits the damage of a theft without preventing it.",
    },
    {
      title: "Permissions carry a scope, and out of scope means not found",
      context:
        "A sales rep should edit their own leads. A manager should edit everyone’s. A role that is only a list of verbs cannot say that.",
      chose:
        "Each grant is a permission plus a scope of `own` or `all`, cached in Redis for five minutes under a versioned key. A lead outside the caller’s scope returns 404 rather than 403, so nobody can probe which ids exist, and a scope that cannot be resolved fails closed.",
      cost: "Every list, count and dashboard query has to apply the scope, and the dashboard cache key needs an audience segment so one scoped user’s numbers are never served to the whole workspace.",
    },
    {
      title: "An audit log the application cannot edit",
      context:
        "An audit trail the app can update is a log, not evidence. Revoking privileges would not help, because the application connects as the owner of the table.",
      chose:
        "A Postgres trigger rejects `UPDATE` and `DELETE` on the audit table. Each audit row is written in its own transaction after the main commit.",
      cost: "A failed audit write can never undo the user’s change, which also means an audit row can be lost. I chose a working product with a rare gap in the log over a log that can take the product down.",
    },
    {
      title: "A webhook for speed, a sweep for certainty",
      context:
        "Meta announces each lead-ad submission with a webhook that holds an id and nothing else. A delivery can repeat, arrive before the lead is readable or never arrive at all, and an endpoint that keeps failing has its subscription switched off.",
      chose:
        "Verify the `X-Hub-Signature-256` HMAC over the raw body, answer 200 at once, then fetch the lead with retries. Every event first claims its lead id in a table with a unique index, so a repeat is a no-op. A five-minute sweep pulls each connected Page through the same path and picks up whatever the webhook dropped.",
      cost: "Answering before the work is done means a restart can lose an event until the next sweep, so the worst case is five minutes, not seconds. The sweep spends Graph API calls on Pages with nothing new, and the events table that makes all of it safe only ever grows.",
    },
    {
      title: "Cache the dashboard, and keep it warm",
      context:
        "The dashboard aggregates every lead in a workspace across a date range, and it is the first page everyone opens.",
      chose:
        "Results are cached in Redis under a key built from a shape version, the date window and the audience. Celery Beat warms the cache every minute, so the request path reads a key that is already there.",
      cost: "The numbers can be a minute old, and the worker does work for workspaces nobody is looking at. Invalidation walks keys with `SCAN`, which is fine at this size and would need a tag index later.",
    },
  ],
  outcome: [
    h2("Where it stands"),
    p(
      "The API exposes 80 endpoints over 22 tables, shipped through 8 migrations. 135 API tests run against the live stack over HTTP instead of mocks, and 126 Playwright tests drive the browser. Sign-in supports TOTP with recovery codes and WebAuthn passkeys, sessions can be listed and revoked, and a superadmin entering a workspace is logged on every request. The CRM is in production. Leads from Facebook and Instagram ads reach each workspace’s pipeline already assigned by their form’s mapping, and an expired Page token marks its connection for reconnecting instead of failing quietly.",
    ),
    h2("What I would change"),
    ul(
      "Move the refresh token out of localStorage and into an HttpOnly cookie. Detecting a replay is the second line of defence and should not be the first.",
      "Write audit rows through an outbox in the same transaction and relay them afterwards. That removes the lost-row case without tying the request to the audit store.",
      "Move ad-lead processing onto the queue. The webhook is acknowledged before the lead is fetched, and a durable job would turn a lost event into a retry instead of a five-minute wait.",
      "Run the tests in CI. They exist and they pass locally; nothing runs them on every push yet.",
      "Notifications are a view over the activity table, polled every 60 seconds. That is right for now. Server-sent events start to pay once several people work the same pipeline at once.",
    ),
    h2("What I took from it"),
    p(
      "Isolation is cheapest when it is structural. A schema per tenant cost me a second migration branch and some provisioning code, and in exchange a whole class of bug cannot be written. I would make the same trade again for hundreds of tenants. Past a few thousand, catalogue size and migration time start to argue for shared tables with row-level security.",
    ),
  ],
};
