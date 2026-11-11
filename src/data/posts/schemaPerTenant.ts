import { code, h2, p, ul, type PostSource } from "@/data/posts/schema";

export const schemaPerTenant: PostSource = {
  slug: "schema-per-tenant-trade-offs",
  title: "Schema-per-tenant is an operations decision, not a data-modelling one",
  excerpt:
    "Isolation was never the hard part. The real cost shows up in migrations that must succeed across every schema, connection pooling around search_path, and the day one tenant needs a restore. Here is how I weigh it against a tenant_id column, and when I would pick the column.",
  topic: "Architecture",
  date: "2026-10-28",
  tint: "orange",
  art: "tenants",
  body: [
    p(
      "Most multi-tenancy discussions start with isolation, and that is the wrong place to start. A `tenant_id` column and a schema per tenant can both be made safe. What separates them is the work each one hands you a year later, and almost all of that work is operational.",
    ),
    h2("What you actually buy"),
    ul(
      "One tenant’s data can be dumped, restored or deleted on its own, without a `WHERE` clause that somebody can forget.",
      "A missing tenant filter fails loudly with “relation does not exist” instead of quietly returning another customer’s rows.",
      "Tenants can have their own custom fields and indexes without widening a shared table for everyone.",
    ),
    h2("What you pay"),
    p(
      "A migration stops being one transaction and becomes a loop. A change that passes on most schemas and fails on one leaves you running two versions of the database at once. So every migration has to be safe to re-run, each schema has to record its own version, and the application has to tolerate both the old and the new shape for as long as a rollout takes.",
    ),
    p(
      "Connection pooling is the second bill. `search_path` is session state, and a pooler in transaction mode will happily hand that session to the next request. Set it per transaction, so it cannot outlive the work it belongs to:",
    ),
    code(
      "python",
      `
@asynccontextmanager
async def tenant_session(schema: str):
    async with SessionLocal() as session, session.begin():
        await session.execute(
            text("SELECT set_config('search_path', :path, true)"),
            {"path": f"{schema},public"},
        )
        yield session
`,
    ),
    p(
      "The schema name must come from a lookup you trust, never from the request. And the third bill arrives slowly: every schema multiplies the system catalog, so dumps, autovacuum and any tool that lists tables all get slower as tenants grow.",
    ),
    h2("When I would pick the column"),
    p(
      "Many small tenants, self-serve sign-up and reporting across tenants all point to shared tables with a `tenant_id` and row-level security. Schemas earn their cost when tenants are fewer and larger, when contracts ask for separate restores or deletion, or when tenants reshape their own data model. A CRM with configurable pipelines and custom fields is that last case, which is why I chose schemas for it.",
    ),
    h2("The question to ask"),
    p(
      "Not “which one is more isolated?” but “who runs the migrations, and what happens when one fails halfway?” If the team has a clear answer, schemas are a good choice. If it does not, the column will be kinder.",
    ),
  ],
};
