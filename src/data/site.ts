export const site = {
  name: "Vaibhav Kumar Saini",
  shortName: "Vaibhav",
  monogram: "VKS",
  role: "Lead Full-Stack Engineer",
  location: "Bengaluru, India",
  timeZone: "Asia/Kolkata",
  url: "https://imvsaini.vercel.app",
  description:
    "Vaibhav Kumar Saini is a lead full-stack engineer in Bengaluru building multi-tenant SaaS, AI-powered features and fast, considered interfaces with Python, FastAPI, Node.js, React and Next.js.",
  availability: "Open to lead & senior roles",
  since: 2019,
} as const;

export const nav = [
  { label: "Approach", href: "#approach" },
  { label: "Work", href: "#work" },
  { label: "Experience", href: "#experience" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
] as const satisfies readonly { label: string; href: `#${string}` }[];
