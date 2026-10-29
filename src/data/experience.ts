export type Role = {
  company: string;
  title: string;
  location: string;
  start: string;
  end: string;
  summary: string;
  highlights: string[];
  metrics: { value: string; label: string }[];
  stack: string[];
};

export const experience: Role[] = [
  {
    company: "Screen Interactiv",
    title: "Lead Software Engineer",
    location: "Bengaluru, India",
    start: "Jan 2022",
    end: "Present",
    summary:
      "I own architecture, code review and delivery for five SaaS products in production, from a multi-tenant CRM to an embeddable AI chatbot.",
    highlights: [
      "Architected a schema-per-tenant CRM on FastAPI and PostgreSQL with configurable pipelines, custom fields, RBAC and a complete audit trail.",
      "Shipped an embeddable AI chatbot that answers from each tenant’s own documents, streams replies over WebSockets and drops captured leads straight into the CRM.",
      "Hardened it with API keys, domain allow-lists and Redis rate limiting, and tracked LLM spend per tenant.",
      "Took the heaviest dashboard query off the request path with a scope-aware Redis cache that Celery Beat refreshes every 60 seconds.",
      "Built an AI assistant on async SQLAlchemy that manages tasks through typed tools, with a human confirming every action.",
      "Synced a real-estate channel-partner portal with Zoho CRM through a retry-safe outbox that rides out vendor outages.",
      "Backed everything with 325 automated tests, 28 end-to-end tests, and sign-in protected by TOTP MFA and WebAuthn passkeys.",
    ],
    metrics: [
      { value: "5", label: "SaaS products live" },
      { value: "325", label: "automated tests" },
      { value: "28", label: "E2E journeys" },
    ],
    stack: ["FastAPI", "SQLAlchemy", "PostgreSQL", "Redis", "Celery", "WebSockets"],
  },
  {
    company: "Assent Global",
    title: "Software Engineer",
    location: "Bengaluru, India",
    start: "Jan 2020",
    end: "Jan 2022",
    summary:
      "I built and tuned SaaS products and their APIs, with a focus on response times and database load.",
    highlights: [
      "Built REST and GraphQL APIs on Node.js and Express, cutting response times by 20%.",
      "Cut PostgreSQL query time by 35% by reworking slow queries and their indexes.",
      "Put a Redis cache in front of the primary database to speed up hot reads.",
      "Moved reports and notifications onto Celery background workers.",
      "Profiled and load-tested services to find where the time actually went.",
    ],
    metrics: [
      { value: "−20%", label: "API response time" },
      { value: "−35%", label: "query time" },
    ],
    stack: ["Node.js", "Express.js", "GraphQL", "PostgreSQL", "Redis", "Celery"],
  },
  {
    company: "Cetpa Infotech",
    title: "Frontend Developer",
    location: "Noida, India",
    start: "Jul 2019",
    end: "Dec 2019",
    summary:
      "I hand-coded and maintained client websites. This is where I learned the web from the browser up.",
    highlights: [
      "Improved performance by 20% across client sites built with HTML5, CSS3 and JavaScript.",
      "Made pages load 15% faster through refactoring and asset optimisation.",
      "Tested every build for cross-browser compatibility and accessibility.",
    ],
    metrics: [
      { value: "+20%", label: "site performance" },
      { value: "−15%", label: "load time" },
    ],
    stack: ["HTML5", "CSS3", "JavaScript (ES6+)"],
  },
];
