import { code, h2, p, ul } from "@/data/article";
import { diagram, type CaseStudy } from "@/data/caseStudies/schema";

export const bookkeepingPlatform: CaseStudy = {
  slug: "bookkeeping-platform",
  title: "Bookkeeping Platform",
  category: "Accounting SaaS",
  headline:
    "A multi-tenant bookkeeping API for an accounting practice: a double-entry ledger for every client company, bank statements that import without duplicates, supplier bills read by OCR and a client portal opened by magic link.",
  summary:
    "Building a schema-per-tenant bookkeeping backend on Express and PostgreSQL: a double-entry ledger, repeatable statement import, OCR to bill, AI categorisation and what each cost.",
  date: "2026-11-13",
  tint: "gold",
  art: "ledger",
  facts: [
    { label: "Role", value: "Lead engineer, ledger to queues" },
    { label: "Timeline", value: "November 2025 to March 2026" },
    { label: "Platform", value: "REST API and six queue workers" },
    { label: "Status", value: "In development" },
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
  overview: [
    h2("The problem"),
    p(
      "The product is the back office of a bookkeeping practice. Its staff keep the books of many client companies: a chart of accounts, journal entries, bills, expenses, bank transactions, reconciliation and the reports that come out of them. Each client company is a tenant. The client’s own people never see the ledger. They get a portal where they answer the bookkeeper’s questions, share files and read the reports that have been published to them.",
    ),
    p(
      "Most of a bookkeeper’s day is not accounting. It is getting bank statements in, working out what each line was, matching it to a bill and chasing the client about the ones nobody recognises. The engineering went into that pipeline, where the failures are specific: a statement uploaded twice must not double the books, a scanned bill must not become a liability because a pattern misread it, and a model’s guess about a category must not point at an account that does not exist.",
    ),
    h2("Constraints I set"),
    ul(
      "One client company’s books are out of reach of another’s, even when a query forgets its filter.",
      "Importing the same statement twice changes nothing.",
      "An entry whose debits and credits differ cannot be saved through the API.",
      "A scanned document becomes a bill only after a person has reviewed it.",
      "A model may choose among the accounts in that client’s chart. It cannot invent one.",
      "A client signs in without a password, through a link that works once.",
      "Mail, uploads, imports, OCR and model calls all happen off the request path.",
    ),
    h2("Architecture"),
    p(
      "The API is Express with Objection and Knex over PostgreSQL 16, with Redis and BullMQ behind it. Shared tables live in the `public` schema: users, tenants, memberships, roles, magic links and the audit log. Each client company gets its own schema of 46 tables for accounts, journal entries, bills, bank transactions, rules, reconciliations and documents. Onboarding creates the schema, runs the tenant migrations and seeds the tax codes; if any step fails, it removes what the earlier steps made.",
    ),
    p(
      "A request names its tenant in the JWT, and switching company issues a new token. Middleware loads the tenant and checks that it is active. Every data call then runs inside one helper, which opens a transaction and points it at that tenant’s schema.",
    ),
    code(
      "ts",
      `
export async function withTenantSchema<T>(
  schema: string,
  work: (trx: Knex.Transaction) => Promise<T>,
): Promise<T> {
  return db.transaction(async (trx) => {
    await trx.raw("SET LOCAL search_path TO ??, public", [schema]);
    return work(trx);
  });
}
`,
    ),
    p(
      "`LOCAL` is the word that matters. A plain `SET` stays on the connection after it goes back to the pool, and the next request to borrow it reads another company’s books. `SET LOCAL` ends with the transaction, so there is nothing to leak. Tenant tables also carry a tenant id that queries filter on, which makes the schema a second wall and not the only one.",
    ),
    p(
      "Six queues take the slow work: mail, file storage, statement import, OCR, model categorisation and an hourly digest of questions a client has left unanswered. Each retries with exponential backoff and keeps its failed jobs for inspection.",
    ),
    h2("From statement to ledger"),
    p(
      "A bank statement arrives as a CSV or spreadsheet. The upload goes to object storage and a job row is written; a worker downloads the file, maps and validates each row and inserts the survivors as draft transactions. The tenant’s rules then run over the new drafts in priority order, matching on description, reference and amount, and a second job asks a model to suggest a category. Posting a transaction is what writes the journal entry and moves the account balances.",
    ),
    diagram(
      "statementImport",
      "A statement line becomes a draft, picks up a category, and reaches the ledger only when it is posted.",
      "An uploaded statement is stored, then each row is fingerprinted and rows seen before are skipped. New rows are inserted as drafts in batches of 100. Rules run in priority order, a model suggests a category, and posting a transaction writes the journal entry.",
    ),
    p(
      "Matching a bank line to a bill is a scoring problem, not a lookup. Candidates within seven days either side are scored: 70 points when the amount equals the open balance, 50 when it equals the total, up to 30 for how close the dates are and 40 for the same contact. The bookkeeper sees the best twenty and picks. Reconciliation closes the loop: one open session per account, cleared items summed against the statement balance, and the session cannot be completed while the difference is more than a cent.",
    ),
    h2("From document to bill"),
    p(
      "A supplier’s bill arrives as a PDF or a photo. A worker runs Tesseract over it more than once with different page-segmentation modes, rasterising PDFs at 400 dpi first, and merges the text. Label and pattern rules pull out the supplier, dates, totals and tax, and decide whether the result is ready for review or needs a person to fill it in. The supplier is matched to a contact by name, and the document waits in a review state until someone approves it.",
    ),
    diagram(
      "documentBill",
      "Extraction fills in a draft. Approval by a person is what creates the bill and posts it.",
      "A document is uploaded and queued. Tesseract reads it in several passes, pattern rules extract the fields and the supplier is matched by name. The document then waits for review, and approving it creates a bill that debits the expense accounts and credits accounts payable.",
    ),
    h2("The client portal"),
    p(
      "Clients come to the portal a few times a year, which is exactly how often people forget a password. They sign in with a link instead. The bookkeeper sends one, or the client asks for one and always gets the same reply whether or not the address is known. The link holds a signed token with a purpose and a random id. Only a hash of that id is stored, and using the link locks its row, marks it used and issues ordinary tokens scoped to that one client company.",
    ),
    diagram(
      "magicLink",
      "The link is signed, stored only as a hash and claimed under a row lock, so it signs in once.",
      "A request for a link gets the same reply whether or not the address is known. A signed token carrying a purpose and a random id is emailed, and only the hash of the id is stored. Verifying checks the signature and purpose, locks the unused row and marks it used, then issues tokens scoped to one tenant.",
    ),
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
  outcome: [
    h2("Where it stands"),
    p(
      "The API has 319 routes across 30 routers and 66 tables, 20 shared and 46 in every tenant schema, built by 50 migrations. It covers the chart of accounts, journal entries, bills and payments, expenses, statement import, rules, model categorisation, matching, reconciliation, six reports with PDF and Excel export, document OCR, the audit log and the client portal. A push to the main branch type-checks, lints, builds an image and deploys it to a development server, with a rollback step if the deploy fails.",
    ),
    p(
      "It is not in production. Invoices exist as documents but do not post to the ledger yet, statements come in by file upload because there are no bank feeds, and there are no automated tests.",
    ),
    h2("What I would change"),
    ul(
      "Build the migration runner that walks every tenant schema. Nothing else on this list matters if a schema change cannot ship.",
      "Enforce the balance in the database with a deferred constraint trigger, and carry money as integer minor units from the request to the column.",
      "Lock the account row when a posting changes its running balance, or stop storing the balance and derive it from the lines.",
      "Write the tests, starting with posting and reconciliation. Accounting is unusually easy to test, because every operation has an invariant to assert.",
      "Validate the model’s reply against a schema and retry a failed batch instead of skipping it.",
      "Add an occurrence index to the fingerprint, so two identical lines on one day both survive.",
      "Post invoices to the ledger, which is the half of the books the product does not keep yet.",
    ),
    h2("What I took from it"),
    p(
      "Idempotency is what let everything else stay simple. Once a statement line had a fingerprint, batches could commit on their own, a failed job could be run again and a file uploaded twice stopped being a support ticket. I would spend the same effort on the ledger’s invariants earlier. I enforced them where they were convenient to write, in the application, and the database is the only place where they cannot be bypassed.",
    ),
  ],
};
