## The problem

The product is the back office of a bookkeeping practice. Its staff keep the books of many client companies: a chart of accounts, journal entries, bills, expenses, bank transactions, reconciliation and the reports that come out of them. Each client company is a tenant. The client’s own people never see the ledger. They get a portal where they answer the bookkeeper’s questions, share files and read the reports that have been published to them.

Most of a bookkeeper’s day is not accounting. It is getting bank statements in, working out what each line was, matching it to a bill and chasing the client about the ones nobody recognises. The engineering went into that pipeline, where the failures are specific: a statement uploaded twice must not double the books, a scanned bill must not become a liability because a pattern misread it, and a model’s guess about a category must not point at an account that does not exist.

## Constraints I set

- One client company’s books are out of reach of another’s, even when a query forgets its filter.
- Importing the same statement twice changes nothing.
- An entry whose debits and credits differ cannot be saved through the API.
- A scanned document becomes a bill only after a person has reviewed it.
- A model may choose among the accounts in that client’s chart. It cannot invent one.
- A client signs in without a password, through a link that works once.
- Mail, uploads, imports, OCR and model calls all happen off the request path.

## Architecture

The API is Express with Objection and Knex over PostgreSQL 16, with Redis and BullMQ behind it. Shared tables live in the `public` schema: users, tenants, memberships, roles, magic links and the audit log. Each client company gets its own schema of 46 tables for accounts, journal entries, bills, bank transactions, rules, reconciliations and documents. Onboarding creates the schema, runs the tenant migrations and seeds the tax codes; if any step fails, it removes what the earlier steps made.

A request names its tenant in the JWT, and switching company issues a new token. Middleware loads the tenant and checks that it is active. Every data call then runs inside one helper, which opens a transaction and points it at that tenant’s schema.

```ts
export async function withTenantSchema<T>(
  schema: string,
  work: (trx: Knex.Transaction) => Promise<T>,
): Promise<T> {
  return db.transaction(async (trx) => {
    await trx.raw("SET LOCAL search_path TO ??, public", [schema]);
    return work(trx);
  });
}
```

`LOCAL` is the word that matters. A plain `SET` stays on the connection after it goes back to the pool, and the next request to borrow it reads another company’s books. `SET LOCAL` ends with the transaction, so there is nothing to leak. Tenant tables also carry a tenant id that queries filter on, which makes the schema a second wall and not the only one.

Six queues take the slow work: mail, file storage, statement import, OCR, model categorisation and an hourly digest of questions a client has left unanswered. Each retries with exponential backoff and keeps its failed jobs for inspection.

## From statement to ledger

A bank statement arrives as a CSV or spreadsheet. The upload goes to object storage and a job row is written; a worker downloads the file, maps and validates each row and inserts the survivors as draft transactions. The tenant’s rules then run over the new drafts in priority order, matching on description, reference and amount, and a second job asks a model to suggest a category. Posting a transaction is what writes the journal entry and moves the account balances.

{% diagram name="statementImport" caption="A statement line becomes a draft, picks up a category, and reaches the ledger only when it is posted." alt="An uploaded statement is stored, then each row is fingerprinted and rows seen before are skipped. New rows are inserted as drafts in batches of 100. Rules run in priority order, a model suggests a category, and posting a transaction writes the journal entry." /%}

Matching a bank line to a bill is a scoring problem, not a lookup. Candidates within seven days either side are scored: 70 points when the amount equals the open balance, 50 when it equals the total, up to 30 for how close the dates are and 40 for the same contact. The bookkeeper sees the best twenty and picks. Reconciliation closes the loop: one open session per account, cleared items summed against the statement balance, and the session cannot be completed while the difference is more than a cent.

## From document to bill

A supplier’s bill arrives as a PDF or a photo. A worker runs Tesseract over it more than once with different page-segmentation modes, rasterising PDFs at 400 dpi first, and merges the text. Label and pattern rules pull out the supplier, dates, totals and tax, and decide whether the result is ready for review or needs a person to fill it in. The supplier is matched to a contact by name, and the document waits in a review state until someone approves it.

{% diagram name="documentBill" caption="Extraction fills in a draft. Approval by a person is what creates the bill and posts it." alt="A document is uploaded and queued. Tesseract reads it in several passes, pattern rules extract the fields and the supplier is matched by name. The document then waits for review, and approving it creates a bill that debits the expense accounts and credits accounts payable." /%}

## The client portal

Clients come to the portal a few times a year, which is exactly how often people forget a password. They sign in with a link instead. The bookkeeper sends one, or the client asks for one and always gets the same reply whether or not the address is known. The link holds a signed token with a purpose and a random id. Only a hash of that id is stored, and using the link locks its row, marks it used and issues ordinary tokens scoped to that one client company.

{% diagram name="magicLink" caption="The link is signed, stored only as a hash and claimed under a row lock, so it signs in once." alt="A request for a link gets the same reply whether or not the address is known. A signed token carrying a purpose and a random id is emailed, and only the hash of the id is stored. Verifying checks the signature and purpose, locks the unused row and marks it used, then issues tokens scoped to one tenant." /%}

{% decisions /%}

## Where it stands

The API has 319 routes across 30 routers and 66 tables, 20 shared and 46 in every tenant schema, built by 50 migrations. It covers the chart of accounts, journal entries, bills and payments, expenses, statement import, rules, model categorisation, matching, reconciliation, six reports with PDF and Excel export, document OCR, the audit log and the client portal. A push to the main branch type-checks, lints, builds an image and deploys it to a development server, with a rollback step if the deploy fails.

It is in production with automated tests. Statements come in by file upload today, and bank feeds are in progress.

## What I would change

- Build the migration runner that walks every tenant schema. Nothing else on this list matters if a schema change cannot ship.
- Enforce the balance in the database with a deferred constraint trigger, and carry money as integer minor units from the request to the column.
- Lock the account row when a posting changes its running balance, or stop storing the balance and derive it from the lines.
- Validate the model’s reply against a schema and retry a failed batch instead of skipping it.
- Add an occurrence index to the fingerprint, so two identical lines on one day both survive.
- Post invoices to the ledger, which is the half of the books the product does not keep yet.

## What I took from it

Idempotency is what let everything else stay simple. Once a statement line had a fingerprint, batches could commit on their own, a failed job could be run again and a file uploaded twice stopped being a support ticket. I would spend the same effort on the ledger’s invariants earlier. I enforced them where they were convenient to write, in the application, and the database is the only place where they cannot be bypassed.
