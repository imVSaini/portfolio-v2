import { code, h2, p, ul } from "@/data/article";
import { diagram, type PostSource } from "@/data/posts/schema";

export const frontendArchitecture: PostSource = {
  slug: "frontend-architecture-that-stays-maintainable",
  title: "Frontend architecture: building applications that stay maintainable",
  excerpt:
    "Frontends rarely collapse from one bad decision. They erode: a shared component grows a twelfth prop, server data gets copied into a global store, and every feature imports every other. The boundaries I set early, which state belongs where, and when a reusable component is the wrong abstraction.",
  topic: "Frontend",
  date: "2026-10-22",
  tint: "orange",
  art: "layers",
  body: [
    p(
      "A frontend codebase rarely becomes hard to work in overnight. In the first year everything is quick. By the third, a change to one form breaks a page nobody was looking at, and new engineers take weeks to find where anything lives.",
    ),
    h2("How a frontend becomes hard to change"),
    ul(
      "A shared component accumulates props until it is a small framework with its own bugs.",
      "API data is copied into a global store, and now there are two versions of the truth to keep in step.",
      "Features import each other’s internals, so nothing can be changed or deleted in isolation.",
      "Folders are organised by file type, so one feature is spread across six directories.",
    ),
    h2("Why reuse is usually the wrong goal"),
    p(
      "Most of this starts with good intentions about reuse. Two screens look alike, so they share a component, and from then on every difference between them becomes a flag. The wrong abstraction costs more than duplication, because duplication is at least easy to delete.",
    ),
    p(
      "The property worth optimising for is not reuse. It is how much of the codebase a change forces you to read.",
    ),
    h2("Boundaries that hold"),
    ul(
      "Organise by feature. A feature owns its components, hooks and data access, and exposes a small public surface.",
      "Let dependencies point one way: app, then features, then shared UI and utilities. Shared code never imports a feature.",
      "Keep shared UI primitives free of business rules. A `Button` does not know what a deal is.",
      "Sort state by kind before choosing a tool for it.",
    ),
    diagram(
      "layers",
      "Features sit between the app shell and shared code. A feature never imports another feature.",
      "Three layers. App and routes at the top point down to three features: deals, billing and reports. Each feature points down to one shared layer of UI and utilities. Imports point down, never sideways.",
    ),
    p("That last rule removes most of the need for a global store:"),
    ul(
      "Server state belongs to a fetching layer with caching and revalidation, or to the server itself.",
      "URL state, such as filters, tabs and pagination, belongs in the URL so it survives a refresh and a shared link.",
      "Local UI state stays in the component that uses it.",
      "Global client state is what remains: theme, session, the occasional cross-cutting preference. It is a short list.",
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
      "This is from the site you are reading. `Work` renders on the server and reads typed data. Only `HorizontalSection`, the piece that needs scroll and animation, is a client component. Keeping the client boundary at the leaves means the interactive part stays small and the rest ships as HTML.",
    ),
    h2("The trade-offs"),
    ul(
      "Feature folders duplicate a little code between features. That is deliberate, and it needs saying out loud in review.",
      "Strict import rules are friction on day one and need lint enforcement, or they erode.",
      "Splitting state by kind means more than one tool to learn.",
      "Route-level code splitting adds loading states you now have to design.",
    ),
    h2("A real example"),
    p(
      "On this portfolio, content lives in typed data files, sections stay on the server wherever they can, and reusable motion lives in a few client components that any section can use. The animation library is imported through a single module, so its plugins are registered once and nothing else depends on it directly. Adding a project is a data change. Neither was an accident: both follow from deciding early which parts were allowed to know about which.",
    ),
    h2("Lessons learned"),
    ul(
      "Duplicate until the third use, then extract what the three really have in common.",
      "If deleting a feature means editing files outside its folder, the boundary has leaked.",
      "Put architecture rules in the linter. A rule that lives in a wiki is a suggestion.",
      "Lazy loading follows from good boundaries. You cannot split what is tangled.",
    ),
  ],
};
