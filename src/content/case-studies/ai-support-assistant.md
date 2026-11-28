## The problem

The assistant is a support chatbot that a business embeds on its own website. An admin creates the tenant, the tenant uploads documents or points the scraper at its site, and visitors get answers drawn from that material rather than from the model’s general knowledge. It is not a messaging app: there is one human in every conversation.

Three things made it more than a wrapper around a completion endpoint. The widget runs on domains we do not control. Every answer costs money, and by default it is the platform’s money. And the business wants a lead out of the conversation, not only a satisfied visitor.

## Constraints

- The widget is a script tag on someone else’s site, so its key is public by design.
- Tenants share one database and one deployment, and a bot must only ever retrieve its own tenant’s documents.
- Model spend has to be attributable to a tenant, a bot and a conversation.
- It had to run on a single server, without a job queue or a separate vector store.

## Architecture

Four apps live in one repository: a FastAPI backend, a widget in plain TypeScript, a tenant dashboard and a super-admin dashboard, both on React 19 and Vite. PostgreSQL holds everything, vectors included. Document chunks sit in a 1,536-dimension pgvector column beside the documents that own them, so retrieval is a SQL query with a tenant filter and not a call to a second system.

A message takes a short path. The widget opens a WebSocket with its bot’s key. The server checks the key, that the bot is active and that the `Origin` is on the bot’s allow-list. For each message it saves the visitor’s text, runs lead capture or rewrites the query, embeds it, takes the 15 nearest chunks by cosine distance, adds the last three turns, calls the model, records the cost and sends one frame back.

{% diagram name="answerPath" caption="The path of one visitor message, from the widget to the stored cost." alt="The widget connects through an origin gate that checks the key, the bot and the allow-list. Each message is rewritten, matched against the tenant’s 15 nearest chunks in Postgres, answered by the model with the last three turns, and its cost recorded before one frame returns." /%}

Lead capture happens inside the chat: the bot asks for each required field in turn and validates email and phone before it carries on.

## The knowledge base

A bot knows only what its tenant has given it, and there are two ways to give it something. An upload (PDF, DOCX or plain text) is read in memory, split and embedded inside the upload request, and the file itself is not kept. A scrape fetches the homepage and the pages its navigation links to on the same domain, strips scripts, navigation, forms and footers, and converts what is left to Markdown. The scraper refuses private and internal addresses, because a field that fetches a URL on the server’s behalf is otherwise a way into the network.

Scraped pages are drafts. The tenant previews them, saves the ones worth keeping and edits the Markdown, and nothing reaches the bot until they sync the document. An edit marks the document as out of sync, and the bot keeps answering from the last indexed version until the next sync, which deletes the document’s chunks and builds them again.

Both paths index the same way. Text is split recursively into chunks of about 1,500 characters with a 250-character overlap, breaking at paragraphs first, then lines, then sentences, so a chunk rarely ends mid-thought. One batched call embeds the whole document with `text-embedding-3-small`. Each chunk is stored beside its vector with its position and the file it came from, and the embedding call lands in the cost ledger like every other model call.

{% diagram name="knowledgeBase" caption="Uploads are indexed at once. Scraped pages wait as Markdown until the tenant syncs them." alt="An upload goes straight to splitting. A scrape becomes Markdown that the tenant edits and syncs by hand. Both are split into chunks of 1,500 characters with a 250-character overlap, embedded in one batched call and stored in pgvector beside their vectors." /%}

The design has two costs. Indexing runs inside the request, so a long PDF is a slow upload. And because an upload keeps no original, a change to the chunking can be replayed over Markdown documents but not over uploaded files.

The conversations feed back into it. From any transcript the tenant can ask the model what the knowledge base was missing, and gets back suggestions sorted by kind: missing information, gaps in an answer, recurring questions. They are suggestions, not edits. A person still writes the Markdown.

{% decisions /%}

## Where it stands

The product runs in production on Docker Compose behind nginx: 54 endpoints over nine tables, with optional Langfuse tracing on the model calls. Tenants manage bots, knowledge, conversations, leads and spend from their dashboard. Platform admins manage tenants and see spend across all of them.

My own commits are concentrated in the tenant dashboard, the admin dashboard, and the rule that an inactive bot refuses sockets and API calls alike.

## What I would change

- Stream the reply over the existing socket with an async client. Today the answer arrives as one frame once the model has finished, which is the longest wait in the product.
- Move the connection limits to Redis and add an HNSW index before either is urgent. Both are known ceilings, and both are cheaper to lift early.
- Put tests around retrieval and lead capture first. Those are the two places where a quiet regression costs a customer something.
- Turn query expansion into per-tenant configuration, so a new customer’s vocabulary is data and not a code change.

## What I took from it

The model was the easy part. What made this a product was everything around the call: who is allowed to trigger it, whose money it spends, what it is allowed to read and what gets written down afterwards. I now design the accounting and the allow-list before the prompt.
