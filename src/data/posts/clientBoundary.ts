import { code, h2, p, ul, type PostSource } from "@/data/posts/schema";

export const clientBoundary: PostSource = {
  slug: "client-boundary-at-the-leaves",
  title: "Server-first is a budget: deciding where the client boundary goes",
  excerpt:
    "Every “use client” ships JavaScript and takes on hydration risk, so it should be spent on purpose. How a motion-heavy Next.js site keeps its sections on the server, pushes animation to the leaves and still reads correctly with motion switched off.",
  topic: "Frontend",
  date: "2026-04-21",
  tint: "red",
  art: "tree",
  body: [
    p(
      'This site scrolls horizontally, splits headings into lines and animates most of what you see. It would have been easy to mark every section as a client component and move on. I treat `"use client"` as a budget instead, because every use has a price.',
    ),
    h2("What the directive costs"),
    ul(
      "The component and everything it imports are shipped to the browser.",
      "Its markup has to hydrate, and any difference from the server render is a bug waiting for a slow phone.",
      "The boundary spreads: a client component cannot import a server one.",
    ),
    h2("Sections on the server, motion at the leaves"),
    p(
      "A section such as Work is a server component. Its text is in the HTML before any script runs. The scrolling behaviour lives in one small client component, and the content is passed through it as children:",
    ),
    code(
      "tsx",
      `
export function Work() {
  return (
    <HorizontalSection id="work" label="Selected work">
      {projects.map((project) => (
        <ProjectPanel key={project.slug} project={project} />
      ))}
    </HorizontalSection>
  );
}
`,
    ),
    p(
      "Children handed to a client component are still rendered on the server. The wrapper adds behaviour without pulling the content across the boundary.",
    ),
    h2("Motion is an enhancement"),
    ul(
      "Content is visible by default. It is hidden for a reveal only once a class on `html` confirms that scripted motion will run.",
      "Every animation sits inside `gsap.matchMedia()` with a reduced-motion query and returns its own cleanup.",
      "Only `transform` and `opacity` are animated, so layout never shifts.",
    ),
    h2("Browser state without a mismatch"),
    p(
      "Theme, reduced motion and similar values are read with `useSyncExternalStore` and a server snapshot. Reading `window` during render is the usual source of hydration warnings, and this removes the temptation.",
    ),
    h2("The question for each component"),
    p(
      "Does it need state, an effect, an event handler or a DOM ref? If the answer is no, it stays on the server. If yes, the next question is how small the part that needs it can be made.",
    ),
  ],
};
