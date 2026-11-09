export type SkillGroup = { name: string; note: string; items: string[] };

export const skillGroups: SkillGroup[] = [
  {
    name: "Languages",
    note: "What I write every day.",
    items: ["TypeScript", "JavaScript (ES6+)", "Python", "C++"],
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
    items: ["React.js", "Next.js", "SolidJS", "Redux", "Zustand", "GSAP", "Motion (Framer Motion)"],
  },
  {
    name: "UI & Styling",
    note: "What interfaces are built and styled with.",
    items: [
      "Tailwind CSS",
      "shadcn/ui",
      "Radix UI",
      "Headless UI",
      "ReUI",
      "Material UI",
      "HeroUI",
      "daisyUI",
    ],
  },
  {
    name: "Databases",
    note: "Where the state lives.",
    items: ["PostgreSQL", "pgvector", "MongoDB", "MySQL", "Redis", "Valkey", "ChromaDB", "SQLite"],
  },
  {
    name: "AI",
    note: "Part of my daily workflow, not something I bring out for demos.",
    items: ["Claude", "Gemini", "Codex", "Qwen", "Ollama"],
  },
  {
    name: "Tools",
    note: "The tools I reach for without thinking.",
    items: [
      "Git",
      "GitHub",
      "GitLab",
      "Docker",
      "Kubernetes",
      "Linux",
      "Figma",
      "Vite",
      "Jira",
      "Linear",
    ],
  },
  {
    name: "Practices",
    note: "How the work gets shipped.",
    items: [
      "Agile / Scrum",
      "Code Review",
      "System Design",
      "Technical Documentation",
      "Team Mentorship",
      "Cross-functional Collaboration",
    ],
  },
];
