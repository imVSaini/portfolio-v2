export type ProjectTint = "orange" | "gold" | "magenta" | "red" | "soot";

export type Project = {
  slug: string;
  title: string;
  client: string;
  category: string;
  blurb: string;
  stack: string[];
  url: string;
  tint: ProjectTint;
};

export const projects: Project[] = [
  {
    slug: "work-os",
    title: "Work OS",
    client: "Own product",
    category: "SaaS",
    blurb:
      "A workspace OS that puts tasks, time, clients, docs and finance on one grid, with a separate workspace for every context. It installs as a PWA.",
    stack: ["Next.js 15", "React 19", "FastAPI", "Zustand", "PostgreSQL 16", "Redis 7", "PWA"],
    url: "https://workos.dsgnphy.com/",
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
