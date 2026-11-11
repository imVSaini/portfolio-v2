export const site = {
  name: "Vaibhav Saini",
  fullName: "Vaibhav Kumar Saini",
  shortName: "Vaibhav",
  role: "Full Stack Developer",
  location: "Bengaluru, India",
  timeZone: "Asia/Kolkata",
  url: "https://www.imvaibhav.com",
  assetsUrl: "https://assets.imvaibhav.com",
  description:
    "Vaibhav Kumar Saini is a full stack developer in Bengaluru who crafts web and mobile products where design and code work as one, with Python, FastAPI, Node.js, React and Next.js.",
  /** Link-preview card, served from `public/`. */
  ogImage: {
    url: "/og.png",
    width: 1200,
    height: 630,
    alt: "Vaibhav Saini, Full Stack Developer in Bengaluru: Backend depth, frontend finish.",
  },
} as const;

type NavItem = { label: string } & (
  { kind: "section"; href: `#${string}` } | { kind: "page"; href: `/${string}` }
);

export const nav = [
  { kind: "section", label: "Home", href: "#top" },
  { kind: "section", label: "Work", href: "#work" },
  { kind: "section", label: "Experience", href: "#experience" },
  { kind: "section", label: "Skills", href: "#skills" },
  { kind: "page", label: "Blog", href: "/blog" },
  { kind: "section", label: "Contact", href: "#contact" },
] as const satisfies readonly NavItem[];
