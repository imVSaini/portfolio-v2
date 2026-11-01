export const site = {
  name: "Vaibhav Saini",
  shortName: "Vaibhav",
  monogram: "VS",
  role: "Full Stack Developer",
  location: "Bengaluru, India",
  timeZone: "Asia/Kolkata",
  url: "https://www.imvaibhav.com",
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

export const nav = [
  { label: "Home", href: "#top" },
  { label: "Work", href: "#work" },
  { label: "Experience", href: "#experience" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
] as const satisfies readonly { label: string; href: `#${string}` }[];
