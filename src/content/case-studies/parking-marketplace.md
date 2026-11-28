## The problem

The product is a marketplace for airport parking. A traveller searches by airport and dates, compares lots, pays a deposit online and pays the rest when they drop the car off. Lot operators manage their rates, blackout dates, add-on services and the day’s arrivals. Platform staff moderate listings, answer support tickets and issue refunds. A guest can book without an account.

A parking space is inventory that expires and cannot be sold twice. Everything hard about the backend sits next to that fact: two people booking the last space in the same second, a checkout that is abandoned halfway, a payment that succeeds after the hold on its space has lapsed, a webhook that arrives twice or never, and a price that has to be the same number when it is quoted, charged and argued about a month later.

## Constraints I set

- A lot is never sold past its capacity, whatever the timing of two requests.
- An abandoned checkout gives its space back without depending on a job running on time.
- The server computes every price. A client sends dates and choices, never amounts.
- A booking keeps the price it was sold at, even after the operator changes their rates.
- A payment confirms its booking even when the webhook never arrives.
- The platform never holds money that belongs to an operator.

## Architecture

The API is Express on Node 22, with Objection and Knex over PostgreSQL 16. Redis backs rate limiting, token revocation and three BullMQ queues for email, cleanup and audit writes. Fifteen modules each own their routes, Zod schemas, services and queries. Every route declares the same chain before a controller runs: a rate-limit preset, authentication, the kind of user, a permission code and validation.

Customers, operator staff and platform staff share one token format. The API issues its own short-lived access tokens and rotating refresh tokens, with TOTP, email codes and passkeys on top. Signing out revokes the access token at once, and permissions are read fresh on every request, so removing a role takes effect immediately. Social sign-in is the one thing handed to Clerk: it verifies the provider, and the API then issues the same tokens as any other sign-in.

Search is deliberately plain. It loads every published lot for the airport, runs five batched lookups in parallel, prices each lot in memory for the requested dates, then filters, sorts and paginates in application code. A price depends on the dates, the length of the stay, the rate period and the taxes, which makes it awkward to sort in SQL, and one airport has a bounded number of lots. The cost is that nothing is cached, so every search repeats the work.

## Booking a space

A booking request is validated against the lot, its dates and its blackout periods, and then repriced from scratch. The write happens in one transaction. It locks the lot’s row, counts the reservations that overlap the requested dates, checks that the same number plate is not already booked for them, and only then inserts the reservation as `pending_payment` with an expiry ten minutes out. The price breakdown, the coupon redemption and the first event in the booking’s history are written in the same transaction.

{% diagram name="bookingHold" caption="The space is held inside one transaction, and Stripe is called only after it has committed." alt="A booking is repriced on the server. A transaction then locks the lot row and counts the reservations that overlap the dates. If there is room, a reservation is written as pending with a ten-minute hold. After the commit a PaymentIntent is created and an expiry job is scheduled." /%}

```sql
SELECT count(*)
FROM reservations
WHERE parking_lot_id = $1
  AND arrival_date < $3
  AND departure_date > $2
  AND (
    status IN ('confirmed', 'checked_in')
    OR (status = 'pending_payment' AND payment_expires_at > now())
  );
```

The last line is the hold. A pending reservation occupies a space only while its expiry is in the future, and the database decides that each time the question is asked. Stripe is called after the commit, never inside it, so a slow payment API cannot keep a lot locked. The PaymentIntent is created with an idempotency key derived from the reservation, so a retried call returns the same intent instead of a second charge.

## Confirming a payment

A booking becomes real when Stripe says the deposit was paid, and that news can arrive three ways. The webhook is the fast path: the signature is verified over the raw body, the event id is stored in a unique column so a repeat is recognised, and the reservation is locked while it is confirmed. A delayed job fires for each reservation when its hold ends and asks Stripe directly before it cancels anything. A sweep every six hours does the same for whatever both of those missed.

{% diagram name="paymentPaths" caption="A webhook, a ten-minute job and a six-hour sweep all end at the same reservation." alt="The expiry job and the reconciliation sweep both ask Stripe for the state of the payment before they act. The webhook goes straight to the reservation, which is then confirmed or cancelled. A payment that arrives after the hold has lapsed is refunded." /%}

Asking Stripe before cancelling matters more than it looks. A job that trusted its own database would cancel a booking whose webhook was merely late and leave a paid customer without a space. The opposite case exists too: a payment can land after the hold expired and the space was sold to someone else. That one is refunded automatically, because the alternative is confirming a booking the lot cannot honour.

## What a booking costs

Operators price by length of stay: a rate for each of the first six days, then weekly, fortnightly and monthly tiers, each with its own rate for extra days. Rate periods override the base rate for a season. Taxes are set per lot, apply to named parts of the price and can compound on each other. Coupons can be a percentage or a fixed amount, global or tied to one lot, taken off the total or off the deposit.

{% diagram name="priceBuild" caption="Every amount is computed on the server and stored with the booking it was sold at." alt="A price starts with the rate period chosen by the arrival date, then the length-of-stay tier, then taxes applied per component. The deposit is the total multiplied by the commission rate, a coupon is taken off, and the result is stored as a snapshot on the reservation." /%}

{% decisions /%}

## Where it stands

The API has 210 routes across 15 modules, 42 tables built by 35 migrations, three queues and 35 transactional email templates. It covers search, quotes, booking, changes, cancellation, extensions, check-in and check-out, no-shows, reviews, support tickets, coupons, commission tiers and listing moderation. A push to the main branch builds an image, backs up the database, deploys behind a health check and rolls back to the previous image if the check fails. Backups also run daily, with daily, weekly and monthly retention and a restore workflow.

It is in production with automated tests.

## What I would change

- Move the capacity rule into the database, as inventory per lot per day or a constraint, so no code path can oversell and the busiest day is what gets counted.
- Make every status change a compare-and-set, `UPDATE … WHERE status = 'pending_payment'`, so two paths confirming at once cannot both win.
- Split a stay across rate periods instead of pricing all of it by the arrival date.
- Run the workers in their own process. They share the API’s today, so a deploy restarts both and a slow job competes with requests.
- Issue the refund as part of a cancellation. The amount is computed now, and a member of staff still has to send it.
- Cache search results per airport and date range, starting with the searches production traffic repeats most.

## What I took from it

The most useful decision was making time part of the data. A hold that is true only until a timestamp needs no worker to be correct, and everything built afterwards, the expiry job and the sweep, became cleanup instead of correctness. The least defensible is that the invariants live in application code and not in the database. A concurrency rule kept by convention is true until the first code path that forgets it.
