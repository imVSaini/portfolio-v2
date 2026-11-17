export type ProjectTint = "orange" | "gold" | "magenta" | "red" | "soot";

export type Project = {
  slug: string;
  title: string;
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
    category: "Accounting software",
    blurb:
      "A multi-tenant bookkeeping API that gives every client company its own Postgres schema, imports bank statements without duplicates and turns scanned bills into entries only after review.",
    stack: ["Node.js", "Express", "PostgreSQL 16", "BullMQ", "OpenAI API"],
    tint: "gold",
  },
  {
    slug: "parking-marketplace",
    title: "Parking Marketplace",
    category: "Parking marketplace",
    blurb:
      "An airport parking marketplace that never oversells: a row lock and a ten-minute hold guard each space while a Stripe deposit confirms the booking.",
    stack: ["Node.js 22", "Express", "PostgreSQL 16", "BullMQ", "Stripe"],
    tint: "red",
  },
  {
    slug: "ai-support-assistant",
    title: "AI Support Assistant",
    category: "AI chatbot",
    blurb:
      "An embeddable support chatbot that answers only from each business’s own documents, captures leads mid-chat and records the cost of every reply.",
    stack: ["FastAPI", "pgvector", "WebSockets", "OpenAI API", "React 19"],
    tint: "magenta",
  },
  {
    slug: "lead-management-crm",
    title: "Lead Management CRM",
    category: "CRM",
    blurb:
      "A multi-tenant CRM that isolates each workspace in its own Postgres schema and pulls in leads from Facebook and Instagram ads without losing or doubling one.",
    stack: ["FastAPI", "PostgreSQL 16", "Celery", "Next.js 16", "React 19"],
    tint: "orange",
  },
  {
    slug: "vlsid-2027",
    title: "VLSID 2027",
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
    category: "Travel & tourism",
    blurb:
      "The site for a Kerala travel studio, with customisable holiday packages across India and abroad, each shaped around the traveller’s dates, pace and budget.",
    stack: ["PHP", "Node.js", "Tailwind CSS"],
    url: "https://travelkampany.in/",
    tint: "gold",
  },
  {
    slug: "kvpr-masalas",
    title: "KVPR Masalas",
    category: "E-commerce",
    blurb:
      "A storefront for Mantrupti and Rajadhya, two South Indian spice brands, with catalogue, cart and checkout, dealership enquiries and a recipe library.",
    stack: ["WordPress", "WooCommerce", "Custom theme", "PHP"],
    url: "https://kvprfs.com/",
    tint: "red",
  },
  {
    slug: "vlsid-2026",
    title: "VLSID 2026",
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
    category: "Architecture",
    blurb:
      "The site for an award-winning New Delhi architecture and interiors studio, presenting its nature-integrated projects in education, hospitality, commercial and residential work.",
    stack: ["WordPress", "Custom theme", "Vite"],
    url: "https://basics.co.in/",
    tint: "gold",
  },
  {
    slug: "3d-visual",
    title: "3D Visual Solutions",
    category: "Architectural visualisation",
    blurb:
      "The site for a Bengaluru visualisation studio, showing renders, 3D walkthroughs, floor plans and drone surveys of spaces before they are built.",
    stack: ["WordPress", "Custom theme", "PHP"],
    url: "https://3dvisual.in/",
    tint: "magenta",
  },
  {
    slug: "artsy-lens",
    title: "Artsy Lens",
    category: "Wedding photography",
    blurb:
      "The site for a Bengaluru wedding studio shooting since 1994, with a cinematic hero slideshow, a page for every shoot from pre-wedding to maternity, and its films and portfolio.",
    stack: ["HTML", "Tailwind CSS", "JavaScript"],
    url: "https://artsy-lens.netlify.app/",
    tint: "red",
  },
  {
    slug: "3-knots-photography",
    title: "3 Knots Photography",
    category: "Photography studio",
    blurb:
      "The site for a Bangalore wedding and candid photography studio, opening on a slideshow with a camera-settings overlay and leading couples from recent work to a consultation.",
    stack: ["HTML", "Tailwind CSS", "JavaScript"],
    url: "https://3-knots-photography.netlify.app/",
    tint: "soot",
  },
  {
    slug: "portfolio-v1",
    title: "Portfolio v1",
    category: "Personal Portfolio",
    blurb:
      "The first version of this portfolio: a hand-drawn sketchbook look, with a career timeline that scrolls sideways.",
    stack: ["Next.js 16", "TypeScript", "Tailwind CSS 4", "GSAP", "Rough.js"],
    url: "https://imvsaini.vercel.app/",
    tint: "orange",
  },
];
