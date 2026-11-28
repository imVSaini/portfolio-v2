import type { Post } from "@/data/posts/schema";

export const inpResponsiveness: Post = {
  slug: "inp-react-compiler-and-yielding",
  title: "Responsiveness in 2026: INP, the React Compiler and yielding to the main thread",
  excerpt:
    "Interaction to Next Paint measures how quickly a page responds to every click, tap and key press, and plenty of fast-loading React apps fail it on mid-range phones. How to find the slow interactions in field data, what each of INP’s three phases is telling you, where the React Compiler helps and where it cannot, and how scheduler.yield() lets input cut in line.",
  metaTitle: "INP, the React Compiler and yielding",
  metaDescription:
    "Many fast-loading React apps fail INP on real phones. Field attribution, the three phases of an interaction, the React Compiler and scheduler.yield().",
  topic: "Frontend",
  date: "2026-09-30",
  tint: "orange",
  art: "frames",
};
