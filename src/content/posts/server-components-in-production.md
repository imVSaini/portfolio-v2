React Server Components have been stable in Next.js for a few years now, and the early confusion has settled into a small set of patterns that hold up in production. This site runs on them: Next.js 16 with React 19 and Cache Components switched on, and nearly everything renders on the server, with interactive pieces kept as small client leaves.

Most of what goes wrong with Server Components comes from treating them as a new syntax for the old model. They are a different model: the server renders the tree, and the browser only receives JavaScript for the parts that need to be interactive.

## Server tree, client leaves

Server Components run only on the server. They can read the database directly, they ship no JavaScript, and they produce HTML plus a compact description of the tree. Client Components, marked with `"use client"`, are rendered on the server too, then hydrated in the browser so they can hold state and handle events.

{% diagram name="serverTree" caption="Pages, layouts and data stay on the server. Only the leaves that hold state or handle events become client components and ship JavaScript." alt="A component tree. The page renders a header, a cached product list and streamed reviews, all as server components. Each has one client leaf, highlighted in accent: a search box with input state, an add-to-cart button with a click handler, and a review form with form state. A legend explains that client components ship JavaScript and hydrate, while server components send HTML only." /%}

The most common mistake is putting `"use client"` at the top of a page because one button needs an `onClick`. Everything that page imports becomes client code and ships to the browser. Move the directive down to the button. When a client component needs server-rendered content inside it, a dialog or a tab panel for example, pass that content as `children`: a client component can render server components it receives as props, it just cannot import them.

## Static, cached and streamed

Next.js 16’s Cache Components make caching explicit. With `cacheComponents: true`, nothing is cached unless you say so. A page is prerendered into a static shell; any component marked with `"use cache"` is cached and can join that shell; anything that reads request data, such as cookies or headers, sits behind a `Suspense` boundary and streams in at request time.

```tsx
import { cacheLife, cacheTag } from "next/cache";
import { cookies } from "next/headers";
import { Suspense } from "react";

import { AddToCart } from "./AddToCart"; // "use client"

export default async function ProductPage({ params }: PageProps<"/products/[id]">) {
  const { id } = await params;
  return (
    <>
      <ProductDetails id={id} />
      <Suspense fallback={<PriceSkeleton />}>
        <PersonalPrice id={id} />
      </Suspense>
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews id={id} />
      </Suspense>
    </>
  );
}

async function ProductDetails({ id }: { id: string }) {
  "use cache";
  cacheLife("hours");
  cacheTag(`product-${id}`);
  const product = await db.products.find(id);
  return (
    <section>
      <h1>{product.name}</h1>
      <AddToCart productId={id} />
    </section>
  );
}

async function PersonalPrice({ id }: { id: string }) {
  const tier = (await cookies()).get("tier")?.value ?? "standard";
  return <Price amount={await pricing.quote(id, tier)} />;
}
```

Reading cookies inside `PersonalPrice` no longer makes the whole route dynamic, as it did in older versions of the App Router. Only that hole waits for the request; the header, the product and the layout are already on screen.

{% diagram name="streamingShell" caption="The prerendered shell paints first. Each dynamic hole streams in on its own schedule, and hydration only covers the client leaves." alt="A timeline from 0 to 400 milliseconds. The static shell with layout, header and cached products arrives first, marked as shell painted. Dashed fallbacks hold space while a personal price that reads cookies streams in early and reviews from a slow query arrive last. Hydration of the client leaves runs in between. Timings are illustrative." /%}

## Invalidation is the hard part

Caching is easy to add and hard to keep correct. Two functions cover most needs. `updateTag` expires a tag immediately, so a server action that just changed data can show the user their own write. `revalidateTag` marks it stale and refreshes in the background, which suits changes the user did not make themselves.

```tsx
"use server";

import { updateTag } from "next/cache";

export async function renameProduct(id: string, input: unknown) {
  const user = await requireUser();
  await assertCanEdit(user, id);
  const { name } = RenameProduct.parse(input);
  await db.products.update(id, { name });
  updateTag(`product-${id}`); // the next render reads the new name
}
```

- Tag by entity, and by tenant in multi-tenant apps: `product-42`, `tenant-7-products`. A tag per page is too coarse to invalidate safely.
- The cache key includes the function’s arguments and anything it closes over. Never cache per-user data in a function whose key does not include the user.
- Pick `cacheLife` by how wrong a stale value can be, not by how expensive the query is.
- The default runtime cache is in memory per server. For a shared cache across instances, use a remote cache handler, and measure whether you need it.

> A cache you cannot invalidate precisely is a bug with a delay on it.

## Fetching without waterfalls

Async components make it easy to create request waterfalls by accident: a parent awaits its data, then renders a child that awaits its own. Start independent requests together, at the top, and pass promises down. A client component can read a promise with `use()`, which suspends until it resolves, so the fetch begins on the server while the client code waits for it.

## The boundary is an API

Everything that crosses from server to client is serialised and sent to the browser, and every server action is a public HTTP endpoint that anyone can call with any arguments.

- Authenticate and authorise inside every server action. Being called from your own form proves nothing.
- Validate action input with a schema, exactly as you would a REST body.
- Never pass secrets or whole database rows as props to a client component; they end up in the page source. Pass the fields the leaf needs.
- Import `server-only` in modules that must never reach the client bundle, so a wrong import fails the build.
- Keep React and Next.js patched. The critical Server Components vulnerability disclosed in December 2025 was a reminder that the protocol between server and client is attack surface too.

## The trade-offs

- The server does more work on every uncached request, so server capacity and caching matter more than in a static single-page app.
- Two module graphs, server and client, with rules about what can import what. New team members need a week to stop tripping on them.
- Highly interactive surfaces such as editors, canvases and dashboards with heavy client state get little from Server Components; they are client islands either way.
- Explicit caching is more code than implicit caching. It is also code you can reason about.

## Lessons

- Push `"use client"` down to the leaf that needs it, and pass server content in as `children`.
- Prerender a shell, cache what is shared and stream what is personal.
- Tag caches by entity and tenant, and use `updateTag` after a user’s own write.
- Start data requests in parallel and pass promises down.
- Treat server actions as public endpoints: authorise, validate and log them.
