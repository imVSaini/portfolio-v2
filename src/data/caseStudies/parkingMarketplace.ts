import { code, h2, p, ul } from "@/data/article";
import { diagram, type CaseStudy } from "@/data/caseStudies/schema";

export const parkingMarketplace: CaseStudy = {
  slug: "parking-marketplace",
  title: "Parking Marketplace",
  category: "Marketplace",
  headline:
    "An airport parking marketplace API: a ten-minute hold on every space, a Stripe deposit that is also the platform’s commission and three separate ways for a payment to confirm a booking.",
  summary:
    "Building an airport parking marketplace backend on Express, PostgreSQL and Stripe: overselling stopped by a row lock, holds that expire by themselves and what each cost.",
  date: "2026-11-13",
  tint: "red",
  art: "parking",
  facts: [
    { label: "Role", value: "Lead engineer, schema to deploy pipeline" },
    { label: "Timeline", value: "April to July 2026" },
    { label: "Platform", value: "REST API and background workers" },
    { label: "Status", value: "Pre-launch" },
  ],
  metrics: [
    { value: "210", label: "API routes across 15 modules" },
    { value: "42", label: "Tables, built by 35 migrations" },
    { value: "10m", label: "A space is held while the deposit is paid" },
    { value: "3", label: "Independent paths that can confirm a payment" },
  ],
  stack: [
    "TypeScript",
    "Node.js 22",
    "Express",
    "PostgreSQL 16",
    "Knex",
    "Objection.js",
    "Redis 7",
    "BullMQ",
    "Stripe",
    "Clerk",
    "WebAuthn",
    "Zod",
    "Cloudflare R2",
    "AWS SES",
    "Docker",
    "GitHub Actions",
  ],
  overview: [
    h2("The problem"),
    p(
      "The product is a marketplace for airport parking. A traveller searches by airport and dates, compares lots, pays a deposit online and pays the rest when they drop the car off. Lot operators manage their rates, blackout dates, add-on services and the day’s arrivals. Platform staff moderate listings, answer support tickets and issue refunds. A guest can book without an account.",
    ),
    p(
      "A parking space is inventory that expires and cannot be sold twice. Everything hard about the backend sits next to that fact: two people booking the last space in the same second, a checkout that is abandoned halfway, a payment that succeeds after the hold on its space has lapsed, a webhook that arrives twice or never, and a price that has to be the same number when it is quoted, charged and argued about a month later.",
    ),
    h2("Constraints I set"),
    ul(
      "A lot is never sold past its capacity, whatever the timing of two requests.",
      "An abandoned checkout gives its space back without depending on a job running on time.",
      "The server computes every price. A client sends dates and choices, never amounts.",
      "A booking keeps the price it was sold at, even after the operator changes their rates.",
      "A payment confirms its booking even when the webhook never arrives.",
      "The platform never holds money that belongs to an operator.",
    ),
    h2("Architecture"),
    p(
      "The API is Express on Node 22, with Objection and Knex over PostgreSQL 16. Redis backs rate limiting, token revocation and three BullMQ queues for email, cleanup and audit writes. Fifteen modules each own their routes, Zod schemas, services and queries. Every route declares the same chain before a controller runs: a rate-limit preset, authentication, the kind of user, a permission code and validation.",
    ),
    p(
      "Customers, operator staff and platform staff share one token format. The API issues its own short-lived access tokens and rotating refresh tokens, with TOTP, email codes and passkeys on top. Signing out revokes the access token at once, and permissions are read fresh on every request, so removing a role takes effect immediately. Social sign-in is the one thing handed to Clerk: it verifies the provider, and the API then issues the same tokens as any other sign-in.",
    ),
    p(
      "Search is deliberately plain. It loads every published lot for the airport, runs five batched lookups in parallel, prices each lot in memory for the requested dates, then filters, sorts and paginates in application code. A price depends on the dates, the length of the stay, the rate period and the taxes, which makes it awkward to sort in SQL, and one airport has a bounded number of lots. The cost is that nothing is cached, so every search repeats the work.",
    ),
    h2("Booking a space"),
    p(
      "A booking request is validated against the lot, its dates and its blackout periods, and then repriced from scratch. The write happens in one transaction. It locks the lot’s row, counts the reservations that overlap the requested dates, checks that the same number plate is not already booked for them, and only then inserts the reservation as `pending_payment` with an expiry ten minutes out. The price breakdown, the coupon redemption and the first event in the booking’s history are written in the same transaction.",
    ),
    diagram(
      "bookingHold",
      "The space is held inside one transaction, and Stripe is called only after it has committed.",
      "A booking is repriced on the server. A transaction then locks the lot row and counts the reservations that overlap the dates. If there is room, a reservation is written as pending with a ten-minute hold. After the commit a PaymentIntent is created and an expiry job is scheduled.",
    ),
    code(
      "sql",
      `
SELECT count(*)
FROM reservations
WHERE parking_lot_id = $1
  AND arrival_date < $3
  AND departure_date > $2
  AND (
    status IN ('confirmed', 'checked_in')
    OR (status = 'pending_payment' AND payment_expires_at > now())
  );
`,
    ),
    p(
      "The last line is the hold. A pending reservation occupies a space only while its expiry is in the future, and the database decides that each time the question is asked. Stripe is called after the commit, never inside it, so a slow payment API cannot keep a lot locked. The PaymentIntent is created with an idempotency key derived from the reservation, so a retried call returns the same intent instead of a second charge.",
    ),
    h2("Confirming a payment"),
    p(
      "A booking becomes real when Stripe says the deposit was paid, and that news can arrive three ways. The webhook is the fast path: the signature is verified over the raw body, the event id is stored in a unique column so a repeat is recognised, and the reservation is locked while it is confirmed. A delayed job fires for each reservation when its hold ends and asks Stripe directly before it cancels anything. A sweep every six hours does the same for whatever both of those missed.",
    ),
    diagram(
      "paymentPaths",
      "A webhook, a ten-minute job and a six-hour sweep all end at the same reservation.",
      "The expiry job and the reconciliation sweep both ask Stripe for the state of the payment before they act. The webhook goes straight to the reservation, which is then confirmed or cancelled. A payment that arrives after the hold has lapsed is refunded.",
    ),
    p(
      "Asking Stripe before cancelling matters more than it looks. A job that trusted its own database would cancel a booking whose webhook was merely late and leave a paid customer without a space. The opposite case exists too: a payment can land after the hold expired and the space was sold to someone else. That one is refunded automatically, because the alternative is confirming a booking the lot cannot honour.",
    ),
    h2("What a booking costs"),
    p(
      "Operators price by length of stay: a rate for each of the first six days, then weekly, fortnightly and monthly tiers, each with its own rate for extra days. Rate periods override the base rate for a season. Taxes are set per lot, apply to named parts of the price and can compound on each other. Coupons can be a percentage or a fixed amount, global or tied to one lot, taken off the total or off the deposit.",
    ),
    diagram(
      "priceBuild",
      "Every amount is computed on the server and stored with the booking it was sold at.",
      "A price starts with the rate period chosen by the arrival date, then the length-of-stay tier, then taxes applied per component. The deposit is the total multiplied by the commission rate, a coupon is taken off, and the result is stored as a snapshot on the reservation.",
    ),
  ],
  decisions: [
    {
      title: "Lock the lot, then count",
      context:
        "Two requests for the last space can both read “one left” before either writes. The usual answers are a row of inventory per lot per day, an exclusion constraint, or making bookings for one lot take turns.",
      chose:
        "`SELECT … FOR UPDATE` on the lot’s row inside the booking transaction, then a count of the reservations that overlap the dates. Bookings for one lot queue behind each other; bookings for different lots never meet.",
      cost: "Nothing in the database enforces the rule, so a code path that skips the helper can oversell. Every booking for a busy lot waits on the same lock, even for dates that do not overlap. The count covers the whole date range instead of the busiest single day, so a lot can turn away a booking that would have fitted.",
    },
    {
      title: "A hold is a timestamp, not a job",
      context:
        "A space has to be kept while the customer types a card number and released if they walk away. Releasing it with a scheduled job means the inventory is only as correct as the queue is punctual.",
      chose:
        "The pending reservation carries `payment_expires_at`, and the availability query ignores holds that are past it. The space frees itself at that instant whether or not anything runs. The expiry job only tidies up the row afterwards.",
      cost: "A row can say `pending_payment` while its space is already free, so every query that reads status has to apply the same expiry rule. A payment can also arrive for a hold that no longer counts, which is why the late-payment refund has to exist at all.",
    },
    {
      title: "Three ways to confirm a payment",
      context:
        "A webhook can be delayed, repeated or lost, and an unconfirmed booking is the worst failure the product has: the customer has paid and has no space.",
      chose:
        "The webhook for speed, a per-reservation job at the end of the hold that asks Stripe before cancelling, and a sweep every six hours over anything still pending. Whichever arrives first does the work.",
      cost: "Three code paths now make the same state change and have to agree on it. The webhook is deduplicated by event id, but the status check and the update are not one atomic step on every path, so I would call this at-least-once with guards, not exactly-once. The sweep also spends Stripe calls on reservations that were never going to be paid.",
    },
    {
      title: "The deposit is the commission",
      context:
        "A marketplace that collects the full price has to pay operators out, which means connected accounts, payout schedules, a ledger of what is owed and a share of every dispute.",
      chose:
        "Charge online exactly what the platform earns: the total multiplied by the lot’s commission rate, 10% by default with per-lot tiers. The customer pays the balance at the lot, straight to the operator. No money that belongs to an operator ever reaches the platform.",
      cost: "The platform can refund only the deposit, because that is all it took. It cannot see whether the balance was paid, so a no-show costs the operator the balance. If the product ever needs full prepayment, the payout machinery I avoided comes back in one piece.",
    },
    {
      title: "Store the price, do not recompute it",
      context:
        "Rates, taxes and commission tiers change. A booking made in March must not change price in May because the operator edited a rate.",
      chose:
        "The server reprices at booking and stores the rate, the tax breakdown, the add-on services and the commission rate on the reservation. The reservation is its own record of what was sold, whatever the live tables say later.",
      cost: "Changing a booking’s dates or overriding its rate changes the stored totals without charging or refunding the difference online; that is settled at the lot. The rate period is picked by the arrival date alone, so a stay that runs into a dearer season is priced entirely at the cheaper one.",
    },
    {
      title: "Own the tokens, rent the social sign-in",
      context:
        "Three kinds of user, guests, permissions that staff can change and passkeys do not fit neatly inside a hosted identity product. Verifying Google, Apple and Microsoft sign-ins by hand is work with no upside.",
      chose:
        "The API issues its own access and refresh tokens for everyone. Clerk verifies a social sign-in on three routes and nothing else, and the API swaps that proof for its own tokens.",
      cost: "Two identity systems to keep in step, and all of the session work is mine: rotation, revocation, lockout, MFA. Reading permissions fresh makes every request pay for a Postgres lookup and two Redis checks in exchange for revocation that is instant.",
    },
  ],
  outcome: [
    h2("Where it stands"),
    p(
      "The API has 210 routes across 15 modules, 42 tables built by 35 migrations, three queues and 35 transactional email templates. It covers search, quotes, booking, changes, cancellation, extensions, check-in and check-out, no-shows, reviews, support tickets, coupons, commission tiers and listing moderation. A push to the main branch builds an image, backs up the database, deploys behind a health check and rolls back to the previous image if the check fails. Backups also run daily, with daily, weekly and monthly retention and a restore workflow.",
    ),
    p(
      "It has not taken production traffic yet, and it has no automated tests. The second of those is the one I would fix before the first.",
    ),
    h2("What I would change"),
    ul(
      "Write the tests, starting with the booking transaction and the three confirmation paths under concurrency. Those are the places where a mistake costs someone a space or a refund.",
      "Move the capacity rule into the database, as inventory per lot per day or a constraint, so no code path can oversell and the busiest day is what gets counted.",
      "Make every status change a compare-and-set, `UPDATE … WHERE status = 'pending_payment'`, so two paths confirming at once cannot both win.",
      "Split a stay across rate periods instead of pricing all of it by the arrival date.",
      "Run the workers in their own process. They share the API’s today, so a deploy restarts both and a slow job competes with requests.",
      "Issue the refund as part of a cancellation. The amount is computed now, and a member of staff still has to send it.",
      "Cache search results per airport and date range once real traffic shows which ones repeat.",
    ),
    h2("What I took from it"),
    p(
      "The most useful decision was making time part of the data. A hold that is true only until a timestamp needs no worker to be correct, and everything built afterwards, the expiry job and the sweep, became cleanup instead of correctness. The least defensible is that the invariants live in application code with no tests holding them there. A concurrency rule kept by convention is true until the first code path that forgets it.",
    ),
  ],
};
