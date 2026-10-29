export type SkillGroup = { name: string; note: string; items: string[] };

export const skillGroups: SkillGroup[] = [
  {
    name: "Languages",
    note: "What I write every day.",
    items: ["Python", "JavaScript (ES6+)", "TypeScript", "HTML5", "CSS3", "SCSS"],
  },
  {
    name: "Backend",
    note: "Async-first APIs with typed contracts, secure by default.",
    items: [
      "FastAPI",
      "Pydantic",
      "SQLAlchemy",
      "Node.js",
      "Express.js",
      "REST APIs",
      "GraphQL",
      "JWT Authentication",
      "Celery",
      "WebSockets",
    ],
  },
  {
    name: "Frontend",
    note: "React and Next.js, plus everything that makes them feel fast.",
    items: [
      "Next.js (App Router)",
      "React.js",
      "Redux",
      "Zustand",
      "Context API",
      "Tailwind CSS",
      "GSAP",
    ],
  },
  {
    name: "Data & Infra",
    note: "Where the state lives and how it ships.",
    items: [
      "PostgreSQL",
      "Redis",
      "Docker",
      "Docker Compose",
      "Nginx",
      "AWS EC2",
      "AWS S3",
      "GitHub Actions (CI/CD)",
    ],
  },
  {
    name: "AI Developer Tools",
    note: "Part of my daily workflow, not something I bring out for demos.",
    items: [
      "Cursor",
      "Claude Code",
      "Devin (formerly Windsurf)",
      "Kiro",
      "Antigravity",
      "GitHub Copilot",
      "ChatGPT",
      "Ollama",
    ],
  },
  {
    name: "Tooling",
    note: "The tools I reach for without thinking.",
    items: ["Git", "GitHub", "Webpack", "Vite", "Postman", "Vercel", "Linux", "Linear"],
  },
  {
    name: "Architecture",
    note: "How I organise code so it scales with the team.",
    items: [
      "Component-Driven Development",
      "Micro-Frontend",
      "Responsive Design",
      "Performance Optimization",
    ],
  },
  {
    name: "Practices",
    note: "How the work gets shipped.",
    items: [
      "Agile / Scrum",
      "Code Review",
      "Technical Documentation",
      "Team Mentorship",
      "Cross-functional Collaboration",
    ],
  },
];
