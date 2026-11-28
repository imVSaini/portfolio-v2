import type { CaseStudy } from "@/data/caseStudies/schema";

export const parkingMarketplace: CaseStudy = {
  slug: "parking-marketplace",
  title: "Parking Marketplace",
  category: "Parking marketplace",
  headline:
    "An airport parking marketplace API: a ten-minute hold on every space, a Stripe deposit that is also the platform’s commission and three separate ways for a payment to confirm a booking.",
  summary:
    "An airport parking marketplace backend on Express, PostgreSQL and Stripe: overselling stopped by a row lock and holds that expire by themselves.",
  date: "2026-11-13",
  tint: "red",
  art: "parking",
  facts: [
    { label: "Role", value: "Lead engineer, schema to deploy pipeline" },
    { label: "Timeline", value: "April to July 2026" },
    { label: "Platform", value: "REST API and background workers" },
    { label: "Status", value: "In production" },
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
};
