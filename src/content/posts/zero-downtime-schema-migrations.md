Picture a trivial migration: add a nullable column. It runs in a millisecond on a table of any size. It can still take a product down for minutes, because a reporting query has been reading that table for twenty minutes, the `ALTER TABLE` queues behind it, and every new query queues behind the `ALTER TABLE`.

Zero-downtime migrations are mostly about locks and compatibility, not speed. Get those two right and most schema changes become routine.

## The lock queue nobody explains

Most `ALTER TABLE` forms need an `ACCESS EXCLUSIVE` lock, which conflicts with everything, including plain `SELECT`s. If a long transaction holds even a weak lock on the table, the `ALTER` waits. While it waits, it sits in the lock queue, and new queries that conflict with it queue behind it rather than jumping ahead. The table is effectively offline until the long transaction finishes.

{% diagram name="lockQueue" caption="Without a lock timeout, the waiting ALTER blocks every new query. With one, the migration gives up quickly and retries, and users never notice." alt="Two timelines. In the first, a report query holds a lock for minutes, an ALTER TABLE waits behind it for an exclusive lock, and every new query queues behind the ALTER in red until the report finishes. In the second, with lock_timeout set to two seconds, the ALTER gives up after a short wait and retries later, while new queries keep running as short accent bars throughout." /%}

## Always set lock_timeout

A migration should never wait long for a lock. Set `lock_timeout` to a couple of seconds so a blocked `ALTER` fails fast, and retry it with backoff. The migration takes a little longer to land; users never see it.

```sql
SET lock_timeout = '2s';
SET statement_timeout = '15min';

-- Metadata only: a nullable column, or one with a constant default (Postgres 11+).
ALTER TABLE contacts ADD COLUMN full_name text;

-- Build indexes without blocking writes. Cannot run inside a transaction,
-- and leaves an INVALID index behind if it fails, so check and drop on retry.
CREATE INDEX CONCURRENTLY IF NOT EXISTS contacts_full_name ON contacts (full_name);

-- Add constraints without scanning under an exclusive lock, then validate
-- with a weaker lock that lets reads and writes continue.
ALTER TABLE deals ADD CONSTRAINT deals_contact_fk
    FOREIGN KEY (contact_id) REFERENCES contacts (id) NOT VALID;
ALTER TABLE deals VALIDATE CONSTRAINT deals_contact_fk;

-- NOT NULL on a big table: prove it with a validated CHECK first,
-- then SET NOT NULL can skip the full scan.
ALTER TABLE contacts ADD CONSTRAINT full_name_present
    CHECK (full_name IS NOT NULL) NOT VALID;
ALTER TABLE contacts VALIDATE CONSTRAINT full_name_present;
ALTER TABLE contacts ALTER COLUMN full_name SET NOT NULL;
ALTER TABLE contacts DROP CONSTRAINT full_name_present;
```

## Which operations are safe

- Safe and instant: adding a nullable column, adding a column with a constant default, dropping a column (the space is reclaimed later), adding a `NOT VALID` constraint.
- Safe with care: `CREATE INDEX CONCURRENTLY`, `VALIDATE CONSTRAINT`, and the `CHECK` dance for `NOT NULL`. Each needs the lock timeout and a retry.
- Rewrites the table: changing most column types, adding a column with a volatile default such as `now()` or a random value. Avoid on large tables; add a new column and backfill instead.
- Breaks running code: renaming a column or table, dropping something the current release still reads. These always need expand/contract.

A linter such as Squawk catches most of the unsafe forms in CI, before a reviewer has to remember which `ALTER` takes which lock.

## Expand and contract

During any deploy, old and new versions of the code run at the same time, against the same schema. A change in meaning, such as renaming `name` to `full_name`, must therefore be spread across several deploys, each compatible with the one before it.

{% diagram name="expandContract" caption="Six small deploys instead of one risky one. At every step, the previous version of the code still works against the schema." alt="Six deploy cards in a row: add a nullable column, dual write to old and new, backfill in batches of 1,000, read the new column behind a flag, write only the new column, and drop the old one. Below each card, chips show what is written and what is read: writes go from old, to old plus new, to new, and reads switch from old to new at step four. A dashed line underneath notes that neighbouring steps run side by side, so every deploy can roll back." /%}

It feels slow. In practice each step is a small pull request, several can ship in a day, and at no point is there a deploy that cannot be rolled back. The one that drops the old column is the only irreversible step, and by then nothing has read it for a week.

## Backfills are workloads

Updating ten million rows in one statement holds locks for the whole run, bloats the table, floods replication and makes rollback all or nothing. Run backfills as a resumable background job instead: small batches, short transactions, a pause between them, and a brake on replica lag.

```python
BATCH = 1_000


async def backfill_full_name(db: AsyncSession) -> None:
    last_id = UUID(int=0)
    while True:
        result = await db.execute(
            text("""
                UPDATE contacts
                SET full_name = concat_ws(' ', first_name, last_name)
                WHERE id IN (
                    SELECT id FROM contacts
                    WHERE id > :last AND full_name IS NULL
                    ORDER BY id
                    LIMIT :batch
                )
                RETURNING id
            """),
            {"last": last_id, "batch": BATCH},
        )
        ids = [row.id for row in result]
        await db.commit()
        if not ids:
            return
        last_id = max(ids)
        await wait_for_replica_lag(max_seconds=2)
        await asyncio.sleep(0.05)
```

Walking the primary key keeps every batch an index range scan, and the `IS NULL` check makes the job safe to stop and restart at any point. Rows written by the new code during the backfill are already correct and get skipped.

> If a migration cannot be stopped halfway and resumed, it is not ready to run on production data.

## Schema-per-tenant migrations

In a schema-per-tenant design, which I use for multi-tenant products that need hard isolation, every migration runs once per tenant. A hundred tenants means a hundred runs; a step that takes a second becomes minutes, and a failure on tenant 57 leaves the fleet on mixed versions.

- Track the schema version per tenant, not globally, and make the runner resumable from any tenant.
- Run tenants with bounded concurrency, so migrations cannot exhaust connections or I/O.
- Expand/contract stops being optional. The application must work against both the old and new schema while the fleet catches up.
- Migrate a canary group of internal tenants first, just as you would deploy code.

## Guardrails

- Lint migrations in CI for unsafe operations.
- Rehearse every large migration against a copy of production-sized data and record how long it took.
- Review migrations as their own pull request, separate from the code that uses them.
- Keep schema changes and data backfills in separate steps, with separate rollbacks.

## The trade-offs

- Expand/contract turns one change into several deploys and needs someone to finish the contract step weeks later.
- Dual writes add code that exists only to be deleted, and a window where two columns can disagree.
- Concurrent index builds take longer and can fail, leaving cleanup behind.
- Lock timeouts mean a migration can fail repeatedly on a busy table, and someone has to notice and schedule it for a quieter moment.

## Lessons

- Set `lock_timeout` on every migration and retry with backoff.
- Know which statements take which lock, and let a linter remember for you.
- Never rename in place. Expand, migrate, contract.
- Run backfills as resumable, throttled jobs, not as migrations.
- In multi-tenant systems, version and migrate each tenant like a separate deploy.
