export type ProjectTint = "orange" | "gold" | "magenta" | "red" | "soot";

export type Project = {
  slug: string;
  title: string;
  client: string;
  category: string;
  blurb: string;
  stack: string[];
  url?: string;
  tint: ProjectTint;
};

export const projects: Project[] = [
  {
    slug: "bookkeeping-platform",
    title: "Bookkeeping Platform",
    client: "Accounting and bookkeeping practices",
    category: "Accounting SaaS",
    blurb:
      "A bookkeeping API with a double-entry ledger for every client company, duplicate-free statement imports and OCR-read bills.",
    stack: ["Node.js", "Express", "PostgreSQL 16", "BullMQ", "OpenAI API"],
    tint: "gold",
  },
  {
    slug: "parking-marketplace",
    title: "Parking Marketplace",
    client: "Airport travellers and parking operators",
    category: "Marketplace",
    blurb:
      "An airport parking marketplace that holds each space for ten minutes while a Stripe deposit confirms the booking.",
    stack: ["Node.js 22", "Express", "PostgreSQL 16", "BullMQ", "Stripe"],
    tint: "red",
  },
  {
    slug: "ai-support-assistant",
    title: "AI Support Assistant",
    client: "Customer support teams",
    category: "AI product",
    blurb:
      "An embeddable support chatbot that answers from each business’s own documents and captures leads mid-conversation.",
    stack: ["FastAPI", "PostgreSQL", "pgvector", "WebSockets", "OpenAI API", "React 19"],
    tint: "magenta",
  },
  {
    slug: "lead-management-crm",
    title: "Lead Management CRM",
    client: "B2B sales teams",
    category: "B2B SaaS",
    blurb:
      "A multi-tenant CRM with a schema per workspace, scoped roles and leads that flow in from Facebook and Instagram ads.",
    stack: ["FastAPI", "PostgreSQL 16", "Celery", "Next.js 16", "React 19"],
    tint: "orange",
  },
  {
    slug: "vlsid-2027",
    title: "VLSID 2027",
    client: "40th International VLSI Design Conference",
    category: "Conference",
    blurb:
      "The official platform for the 40th International Conference on VLSI Design, held at the Sheraton Grand, Bengaluru.",
    stack: ["WordPress", "Custom theme", "PHP"],
    url: "https://vlsid.org/",
    tint: "magenta",
  },
  {
    slug: "travel-kampany",
    title: "Travel Kampany",
    client: "Travel Kampany",
    category: "Travel & tourism",
    blurb:
      "A travel platform with an itinerary builder and its own showcase page for every destination.",
    stack: ["PHP", "Node.js", "Tailwind CSS"],
    url: "https://travelkampany.in/",
    tint: "gold",
  },
  {
    slug: "kvpr-masalas",
    title: "KVPR Masalas",
    client: "KVPR",
    category: "E-commerce",
    blurb:
      "A storefront for a premium Indian spice brand, with catalogue, cart and checkout, dealership enquiries and a recipe library.",
    stack: ["WordPress", "WooCommerce", "Custom theme", "PHP"],
    url: "https://kvprfs.com/",
    tint: "red",
  },
  {
    slug: "vlsid-2026",
    title: "VLSID 2026",
    client: "39th International VLSI Design Conference",
    category: "Conference",
    blurb:
      "A dual-venue site for the 39th edition in Pune, January 2026, built and run end to end.",
    stack: ["WordPress", "Custom theme", "PHP"],
    url: "https://2026.vlsid.org/",
    tint: "soot",
  },
  {
    slug: "basics-architect",
    title: "Basics Architect",
    client: "Basics Co.",
    category: "Architecture",
    blurb:
      "A calm, image-led portfolio for an architecture studio, built around its projects and client stories.",
    stack: ["WordPress", "Custom theme", "Vite"],
    url: "https://basics.co.in/",
    tint: "gold",
  },
  {
    slug: "3d-visual",
    title: "3D Visual Solutions",
    client: "3D Visual Solutions",
    category: "3D visualisation",
    blurb: "A showcase for photo-real architectural renders, walkthroughs and drone mapping.",
    stack: ["WordPress", "Custom theme", "PHP"],
    url: "https://3dvisual.in/",
    tint: "magenta",
  },
];
