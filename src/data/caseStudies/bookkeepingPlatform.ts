import type { CaseStudy } from "@/data/caseStudies/schema";

export const bookkeepingPlatform: CaseStudy = {
  slug: "bookkeeping-platform",
  title: "Bookkeeping Platform",
  category: "Accounting software",
  headline:
    "A multi-tenant bookkeeping API for an accounting practice: a double-entry ledger for every client company, bank statements that import without duplicates, supplier bills read by OCR and a client portal opened by magic link.",
  summary:
    "A schema-per-tenant bookkeeping backend on Express and PostgreSQL: a double-entry ledger, repeatable statement import, OCR to bill and AI categorisation.",
  date: "2026-11-13",
  tint: "gold",
  art: "ledger",
  facts: [
    { label: "Role", value: "Lead engineer, ledger to queues" },
    { label: "Timeline", value: "November 2025 to March 2026" },
    { label: "Platform", value: "REST API and six queue workers" },
    { label: "Status", value: "In production" },
  ],
  metrics: [
    { value: "319", label: "API routes across 30 routers" },
    { value: "66", label: "Tables: 20 shared, 46 in every tenant schema" },
    { value: "6", label: "Queues, each with its own worker" },
    { value: "100", label: "Statement rows committed per import batch" },
  ],
  stack: [
    "TypeScript",
    "Node.js",
    "Express",
    "PostgreSQL 16",
    "Knex",
    "Objection.js",
    "Redis 7",
    "BullMQ",
    "Zod",
    "WebAuthn",
    "Tesseract",
    "OpenAI API",
    "PDFKit",
    "Cloudflare R2",
    "AWS SES",
    "Docker",
    "GitHub Actions",
  ],
  decisions: [
    {
      title: "A schema per client, chosen by the transaction",
      context:
        "Client companies’ books in shared tables are one forgotten filter from a breach. A schema per tenant fixes that, but a `search_path` set on a pooled connection follows the connection to its next borrower.",
      chose:
        "One Postgres schema per client company, selected with `SET LOCAL search_path` inside a transaction that wraps every data call. The setting cannot outlive the work it was set for.",
      cost: "Every read is now a transaction, preceded by a check that the schema exists, and a nested call takes a second connection. Tenant migrations run when a tenant is created and there is no runner yet that walks existing schemas, so a change to a tenant table cannot reach the tenants already onboarded. That is the largest debt in the project.",
    },
    {
      title: "Give every bank line a fingerprint",
      context:
        "Bank exports carry no stable id, and people upload overlapping periods: January to March, then March to April. A failed import also has to be safe to run again.",
      chose:
        "A SHA-256 over the account, date, amount, direction and normalised description, behind a unique index. Rows are committed in batches of 100, each in its own transaction, and the queue job takes its id from the import so a retry is the same job.",
      cost: "Two real payments of the same amount to the same place on the same day collapse into one. A bad row fails the job while earlier batches stay committed, so a half-finished import is a normal state that only the fingerprint makes safe to repeat.",
    },
    {
      title: "Keep the ledger’s rules in the application",
      context:
        "A double-entry ledger has one invariant: debits equal credits. Postgres can enforce it with a deferred constraint trigger, or the code that writes entries can.",
      chose:
        "Validate in three places in the application: the request schema, the function that creates an entry and the model itself. Posting updates a running balance on each account and writes a balance-history row, so an account’s balance is a read and not a sum.",
      cost: "Nothing stops a script or a later code path from writing an unbalanced entry directly. Amounts are `decimal(15,2)` in Postgres and plain numbers in JavaScript, compared with a one-cent tolerance. The running balance is a second copy of the truth, updated by read-modify-write, and it needs a row lock it does not take yet.",
    },
    {
      title: "OCR and patterns for documents, not a model",
      context:
        "Handing each bill to a language model would have been quicker to build. It also sends every client’s supplier documents to a model provider and costs money per page.",
      chose:
        "Tesseract in several passes, pattern rules for the fields and a review step before anything is posted. No document is sent to a model provider, and reading one costs CPU time only.",
      cost: "The patterns know one country’s tax labels and the layouts I have seen. Nothing checks that subtotal plus tax equals the total. The bill’s line items come from the reviewer, not from the extraction, and the image has to ship Poppler to rasterise PDFs.",
    },
    {
      title: "The model suggests, the chart of accounts decides",
      context:
        "Putting a category on a bank line is work a language model does well, and a wrong category in someone’s books is expensive to find later.",
      chose:
        "Send the chart of accounts, recent categorised examples and a batch of transactions, and ask for JSON. A prediction is kept only if its account exists in that tenant’s chart. A per-tenant rule sets the confidence above which a category is applied without waiting, and tokens, cost and latency are recorded for every batch.",
      cost: "Transaction descriptions do go to a model provider, which the documents never do. A batch that fails is logged and skipped, so a job can report success with gaps in it. The reply is parsed and its account ids are checked, but it is not validated against a schema.",
    },
    {
      title: "A sign-in link that works once",
      context:
        "A password for someone who visits four times a year becomes a reset flow. A link in an email is easier, and a link that can be replayed is a session anyone can copy.",
      chose:
        "A token signed with its own secret, carrying a purpose claim and a random id. Only the SHA-256 of the id is stored. Verifying takes `SELECT … FOR UPDATE` on the unused, unexpired row and marks it used in the same transaction, so two clicks at once cannot both succeed.",
      cost: "The client’s mailbox is now the credential: whoever reads the email first is the client. The first visit also creates the user account as a side effect, so who has an account is decided by who clicked.",
    },
  ],
};
