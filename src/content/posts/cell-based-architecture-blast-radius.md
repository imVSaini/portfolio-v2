Read enough postmortems and a pattern shows up. Something small went wrong: a config value, a query that only one customer’s data could trigger, a dependency that slowed down instead of failing. The system had three replicas of everything, autoscaling and a multi-zone database. Everyone went down anyway.

Redundancy answers the question “what if a machine dies?”. It does not answer “what if the thing every machine is running is wrong?”. Cell-based architecture is an answer to the second question, and it has moved from something only hyperscalers did to a pattern worth knowing for any multi-tenant SaaS.

## Why replicas fail together

Replicas are copies. They run the same build, read the same configuration, connect to the same database and receive a fair share of the same traffic. That is exactly what makes them good for capacity and exactly what makes them useless against correlated failure.

- A bad deploy reaches every replica, because that is what a deploy is for.
- A poison request, such as a huge import or a pathological search, is retried by the client until it has visited every replica and crashed each one.
- One tenant’s runaway job saturates the shared database, and every other tenant’s queries queue behind it.
- A configuration flag flipped globally is flipped globally.

The question to ask of any architecture is not how many copies there are. It is how much of the customer base a single mistake can reach. That number is the blast radius, and in a classic horizontally scaled service it is 100%.

## What a cell is

A cell is a complete, independent instance of the whole stack: API, workers, cache and database, sized for a fixed number of tenants. Cells share nothing on the request path. No shared database, no shared queue, no shared cache. A thin routing layer in front sends each request to the one cell that owns its tenant.

{% diagram name="cellRouter" caption="A thin router sends each tenant to one cell. A failing cell takes its own tenants down and no one else’s." alt="A control plane updates a cell map, which a cell router reads. Clients call the router, which sends traffic to three cells, each containing its own API, job workers and database and serving a range of tenants. Cell 2 is marked as failing and drawn faded, while cells 1 and 3 stay healthy." /%}

Scaling changes shape. Instead of making one deployment bigger, you add cells. A cell has a known maximum size, which you load-test once and then trust. That turns capacity planning from a guess about the future into arithmetic: tenants divided by tenants per cell.

> Cells do not make failures rarer. They make every failure smaller, and they make the size of the worst one a number you chose.

## Keep the router boring

Everything now depends on the router, so it must be the simplest component in the system. It looks up the tenant, finds the cell and forwards the request. No business logic, no database calls on the hot path, no feature flags beyond the routing table itself.

The routing table, the cell map, lives in a small store owned by the control plane: the part of the system that creates cells, places tenants and moves them. The router caches the map and keeps serving the last version it saw if the control plane is down. This property has a name, static stability: the data path keeps working when the control path is broken.

```python
CELL_MAP_TTL = 30  # seconds between refreshes


class CellRouter:
    def __init__(self, store: CellMapStore, bootstrap: dict[str, str]) -> None:
        self._store = store
        self._map = dict(bootstrap)
        self._loaded_at = 0.0

    async def cell_for(self, tenant_id: str) -> str:
        if time.monotonic() - self._loaded_at > CELL_MAP_TTL:
            try:
                self._map = await self._store.load()
                self._loaded_at = time.monotonic()
            except StoreUnavailable:
                # Static stability: keep routing with the last map we had.
                log.warning("cell map refresh failed, serving cached map")
        cell = self._map.get(tenant_id)
        if cell is None:
            raise UnknownTenant(tenant_id)
        return cell
```

Two details matter more than they look. The router ships with a bootstrap map, so a cold start during a control plane outage still works. And an unknown tenant is an error, not a fallback to some default cell, because a silent default is how one tenant’s traffic ends up somewhere it does not belong.

## Placing and moving tenants

For B2B SaaS the partition key is almost always the tenant. Everything a request touches belongs to one tenant, so a cell can own a tenant end to end. The awkward cases are the ones that cross that line, and they are worth listing before you start.

- Global identity. A user can belong to several tenants, and sign-in happens before you know which one. Keep a small, read-mostly identity service outside the cells, replicate what cells need into them, and make sure a cell keeps working when that service is slow.
- Cross-tenant features. Admin dashboards, billing and analytics want every tenant at once. Feed them asynchronously from each cell into a separate store. They should never query cells live.
- Tenants that outgrow a cell. Some customer will be ten times larger than the rest. Give them a dedicated cell, which the design already supports, rather than raising the size of every cell.
- Uneven cells. Place new tenants by measured load, not by count, and keep headroom in every cell for the busiest week of the year.

Sooner or later you will rebalance, or evacuate a cell for maintenance. The move is the riskiest operation in a cellular system, so it should be boring, scripted and rehearsed. The simplest version that works: briefly pause writes for that tenant, copy its data to the new cell, verify counts and checksums, flip the cell map entry and resume.

Data layout makes this easy or painful. With schema-per-tenant PostgreSQL, which is how I build multi-tenant products, a tenant already lives in one schema, so a move is a bounded copy rather than a filtered extract from shared tables. Whatever the layout, every row needs a tenant key and no query should join across tenants.

## Deploy cell by cell

The biggest win from cells is often not runtime isolation at all. It is deployment isolation. A release goes to one cell first, usually a canary cell that hosts internal and friendly tenants, bakes there while the error budget is watched, and then moves outward in waves.

```yaml
waves:
  - name: canary
    cells: [cell-0]          # internal and design-partner tenants
    bake: 30m
  - name: first
    cells: [cell-1]
    bake: 1h
  - name: rest
    cells: [cell-2, cell-3, cell-4, cell-5]
    parallel: 2
    bake: 30m
halt_on:
  - error_rate_above: 1%
  - p95_latency_ms_above: 800
```

A bad release now has to get past several gates before it reaches most customers, and when it is caught, rollback means reverting one or two cells, not the world.

## Shuffle sharding

Not everything can be a full cell. A pool of expensive workers, such as document processors or model workers, may be shared across tenants for cost reasons. Shuffle sharding gives most of the isolation for a fraction of the price.

Give every tenant a small, random subset of the pool instead of the whole pool. With eight workers and two per tenant, there are 28 different pairs. A tenant that sends poison work can only ever take out its own two workers, and the chance that another tenant shares both of them is one in 28.

{% diagram name="shuffleShards" caption="Each tenant gets two of eight workers. A poison tenant takes out its own pair; everyone else keeps at least one healthy worker." alt="Four tenants at the top each connect to two of eight workers. Tenant C sends a poison request along red connectors to workers 4 and 7, which are marked as failed. Tenant A shares worker 4 but still has worker 1, and tenants B and D share no workers with C." /%}

The trick only works if clients retry across their shard, so that a tenant whose first worker is down quietly moves to the second. Without that retry, a shared worker failing still hurts everyone on it.

## Costs, and when to skip it

- More infrastructure. Six small databases cost more than one big one, and every cell needs headroom.
- Automation is not optional. Creating, upgrading and draining cells by hand does not scale past three or four.
- Observability must be per cell. A global error rate of 2% can hide one cell at 12%.
- Cross-cell features get harder, and some product ideas become asynchronous by necessity.
- Schema migrations now run once per cell, which is good for safety and tedious without tooling.

A team of eight running one product for a few hundred tenants does not need cells, and building them early is a good way to spend a quarter on plumbing. What you do want at that size is to stay cell-ready, which is cheap:

- A tenant ID on every row, every log line, every metric and every job.
- No query that joins across tenants on the request path.
- Per-tenant rate limits and per-tenant concurrency limits on worker pools, which are bulkheads in miniature.
- Deploys that go to a small slice of traffic first.
- Routing by tenant at the edge, even when every tenant routes to the same place.

When the day comes that one tenant’s incident becomes everyone’s incident often enough to hurt, the split is then a deployment change rather than a rewrite.

## Lessons

- Measure architecture by blast radius, not by replica count.
- Keep the router dumb and statically stable. It is the one shared thing left.
- Fix the cell size, load-test it once and scale by adding cells.
- Deploy in waves across cells. Most of the value arrives before any runtime isolation is needed.
- Make tenant moves routine. A move you have never rehearsed will fail the first time you need it.
