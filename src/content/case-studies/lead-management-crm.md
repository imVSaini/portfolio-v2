## The problem

The CRM is a lead management system for B2B sales teams: leads, a drag-and-drop pipeline, notes, an activity timeline, a dashboard, and stages, sources and custom fields that each workspace defines for itself. A platform admin creates every workspace. There is no public sign-up.

Leads are not only typed in. A workspace connects its Facebook Pages once, maps each lead-ad form to a product, an owner and a starting stage, and submissions from Facebook and Instagram land in the pipeline on their own.

The features are ordinary CRM. The engineering problem is that every customer is a separate company with its own data, its own roles and its own idea of what a pipeline is, and one forgotten `WHERE` clause would show one company’s leads to another. I wanted isolation that did not depend on every query remembering a filter.

## Constraints I set

- Tenant isolation enforced below the application code, so a missing filter cannot leak rows.
- One identity across workspaces. A person signs in once and can hold a different role in each workspace they belong to.
- Permissions that tell “my leads” from “all leads”, because that is how sales teams are organised.
- An audit trail that neither an admin nor a bug can rewrite.
- No ad lead lost or doubled, whatever the webhook does.
- Nothing I could not run on one machine with Docker Compose.

## Architecture

The backend is FastAPI on SQLAlchemy 2 and PostgreSQL 16, with Redis for caching, refresh tokens and the Celery broker. The frontend is a Next.js 16 app on React 19. Global tables live in the `public` schema: tenants, users, memberships, invitations, MFA secrets and passkeys. Each workspace gets a `tenant_<slug>` schema of 13 tables that holds its leads, stages, custom fields, roles, permissions and audit log.

Every tenant request passes through the same chain of dependencies: verify the JWT, load the user, confirm the membership, bind a database session to the tenant’s schema, then check the permission the endpoint asks for. A handler never chooses a schema and never holds a session that can reach another tenant.

{% diagram name="tenantRequest" caption="Every tenant request runs the same chain, and the session it ends with can see one schema only." alt="A request passes through JWT, membership, session, permission and handler in turn. The membership check reads the public schema. The session is bound to the tenant_acme schema and has no path to tenant_globex." /%}

```python
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
```

The translate map lives on the engine rather than on the connection because a connection-level option is dropped at the first commit. The next refresh or lazy load then resolves table names against `public`, where the tenant tables do not exist. The engine view shares the parent pool, so a hundred tenants do not mean a hundred pools.

Search is `ILIKE` backed by trigram GIN indexes. Deletes are soft, and a daily job empties the recycle bin after 30 days, one tenant at a time so a failure in one schema does not stop the rest.

## How leads get in

A lead reaches a workspace three ways: someone types it in, Meta sends it, or the workspace’s own website posts it. The last two have no signed-in user behind them, so each needs its own answer to the question the JWT normally settles: which workspace is this for?

Ad leads come in through Meta’s Lead Ads webhook. Connecting is an OAuth flow that links every Page the user manages. Page tokens are encrypted before they are stored and never pass through the browser, and the OAuth `state` is signed with its own short-lived secret, so a leaked value cannot be replayed as a session. The webhook carries only a lead id and a Page id. The Page id finds the connection, and with it the workspace. The server then fetches the lead from the Graph API and writes it into that workspace’s schema, tagged with platform, campaign and form.

{% diagram name="metaLeads" caption="A webhook and a five-minute sweep feed the same claim, so a lead is written once whichever signal arrives first." alt="The webhook and the sweep both lead to an event claim that is unique on the lead id. A claimed event is fetched from the Graph API with retries and written as a lead in the tenant’s schema, with its product, owner and stage taken from the form’s mapping." /%}

Website leads use an API key. A workspace admin issues a key tied to a list of allowed origins. The key is shown once, and only its hash is stored. A contact form or widget on the site posts the lead with the key in a header. The server matches the key, checks the request’s `Origin` against the list, and lets the key alone decide which workspace the lead belongs to.

From there it is an ordinary write with a few rules of its own. An owner named by email is resolved only among that workspace’s active members. Source, campaign and UTM fields are stored as sent. A lead whose email or phone is already in the pipeline is saved anyway and flagged as a duplicate, because a returning prospect is worth seeing and a dropped submission is gone for good. The audit row records the caller’s address in place of a user.

{% diagram name="leadCapture" caption="A website form reaches its workspace through the API key, never through anything in the request body." alt="The website form posts with an API key to a key gate that matches the hash and checks the origin list. The key selects the workspace. The lead is then validated, checked for duplicates by email or phone, and written with an audit row." /%}

A key that ships in page source is public, so the origin list is what ties it to the workspace’s own sites. That stops another website from borrowing the key. It does not stop a script that forges the header, which is why the endpoint is rate limited and can do one thing only: create a lead.

{% decisions /%}

## Where it stands

The API exposes 80 endpoints over 22 tables, shipped through 8 migrations. 162 API tests run against the live stack over HTTP instead of mocks, and 130 Playwright tests drive the browser. Sign-in supports TOTP with recovery codes and WebAuthn passkeys, sessions can be listed and revoked, and a superadmin entering a workspace is logged on every request. The CRM is in production. Leads from Facebook and Instagram ads reach each workspace’s pipeline already assigned by their form’s mapping, and an expired Page token marks its connection for reconnecting instead of failing quietly.

## What I would change

- Move the refresh token out of localStorage and into an HttpOnly cookie. Detecting a replay is the second line of defence and should not be the first.
- Write audit rows through an outbox in the same transaction and relay them afterwards. That removes the lost-row case without tying the request to the audit store.
- Move ad-lead processing onto the queue. The webhook is acknowledged before the lead is fetched, and a durable job would turn a lost event into a retry instead of a five-minute wait.
- Run the tests in CI. They exist and they pass locally; nothing runs them on every push yet.
- Notifications are a view over the activity table, polled every 60 seconds. That is right for now. Server-sent events start to pay once several people work the same pipeline at once.

## What I took from it

Isolation is cheapest when it is structural. A schema per tenant cost me a second migration branch and some provisioning code, and in exchange a whole class of bug cannot be written. I would make the same trade again for hundreds of tenants. Past a few thousand, catalogue size and migration time start to argue for shared tables with row-level security.
