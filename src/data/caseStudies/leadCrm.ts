import type { CaseStudy } from "@/data/caseStudies/schema";

export const leadCrm: CaseStudy = {
  slug: "lead-management-crm",
  title: "Lead Management CRM",
  category: "CRM",
  headline:
    "A multi-tenant lead management CRM: a Postgres schema per workspace, scoped roles, an audit log nobody can edit and leads that flow in from Facebook and Instagram ads.",
  summary:
    "A schema-per-tenant lead management CRM on FastAPI and PostgreSQL: scoped roles, an append-only audit log, Meta Lead Ads ingestion and what each cost.",
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
    { value: "5m", label: "Maximum wait time before retrying a failed ad lead webhook" },
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
};
