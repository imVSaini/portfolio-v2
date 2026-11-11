import { code, h2, p, ul, type PostSource } from "@/data/posts/schema";

export const publicWidget: PostSource = {
  slug: "public-widget-no-secrets",
  title: "Nothing in an embedded widget is secret: securing a public AI chatbot",
  excerpt:
    "A key shipped to the browser is an identifier, not a credential. How domain allow-lists, Redis rate limits and per-tenant spend tracking work together, so one abused embed cannot run up the LLM bill for everyone.",
  topic: "Security",
  date: "2026-07-16",
  tint: "magenta",
  art: "widget",
  body: [
    p(
      "An embeddable chatbot runs on a customer’s website, in a stranger’s browser. Anything shipped there can be read, copied and replayed. With an LLM behind it, every replayed request also costs money, so the design has to assume the front door is open.",
    ),
    h2("The key is an identifier"),
    p(
      "The API key in the embed snippet says which tenant a request belongs to. It proves nothing about who sent it. Treat it like a username, and never let it unlock anything beyond the public chat.",
    ),
    h2("What a domain allow-list does and does not do"),
    p(
      "Checking the `Origin` header against the tenant’s list stops the embed being pasted onto someone else’s site, because browsers set that header honestly. A script outside a browser sends whatever it likes. The allow-list is a filter against casual misuse, and calling it authentication would be a mistake.",
    ),
    h2("Rate limits at three levels"),
    ul(
      "Per visitor, so one person cannot flood a conversation.",
      "Per tenant, so one abused embed cannot starve the rest.",
      "Global, as the last line when the first two are being worked around.",
    ),
    code(
      "python",
      `
async def allow(redis: Redis, key: str, limit: int, window_s: int) -> bool:
    count = await redis.incr(key)
    if count == 1:
        await redis.expire(key, window_s)
    return count <= limit
`,
    ),
    p(
      "A fixed window is crude, and that is fine here. The goal is to cap damage, not to be perfectly fair.",
    ),
    h2("A budget per tenant"),
    p(
      "Token usage is recorded per tenant on every request. Each tenant has a budget, and when it runs out the widget degrades on purpose: it stops calling the model and offers to take a message. An unexpected invoice is a worse outcome than a quiet chatbot.",
    ),
    h2("Limit what one request can cost"),
    ul(
      "Cap the length of the visitor’s message.",
      "Cap the output tokens and the history sent with each turn.",
      "Retrieve only from that tenant’s own documents, so answers stay on topic and prompts stay small.",
    ),
    h2("Make abuse boring"),
    p(
      "None of this stops a determined attacker from sending requests. It makes sure the most they get is a slow, rate-limited chatbot that talks about one company’s documents, and that is not worth much effort.",
    ),
  ],
};
