import { code, h2, p, quote, ul } from "@/data/article";
import { diagram, type PostSource } from "@/data/posts/schema";

export const scalingFrontends: PostSource = {
  slug: "scaling-frontends-across-teams",
  title: "Scaling a frontend across teams: modular monolith first, micro-frontends last",
  excerpt:
    "Frontends stop scaling when the team grows, not when the traffic does: merge conflicts, unclear ownership, a design system nobody follows and one team’s change breaking another’s page. A modular monolith in a monorepo, with enforced boundaries, a token-based design system and a modern CSS platform, solves most of it. Micro-frontends solve the rest, at a price worth knowing first.",
  metaTitle: "Scaling a frontend across teams",
  metaDescription:
    "A modular monolith with enforced boundaries, design tokens and modern CSS fixes most team-scaling pain. When micro-frontends are worth their price.",
  topic: "Frontend",
  date: "2026-08-26",
  tint: "gold",
  art: "modules",
  body: [
    p(
      "A frontend that three people build together is easy. At fifteen people in four teams, the same codebase starts to fight back. Nobody knows who owns the shared table component. A change to billing breaks the reports page. Every release needs a meeting. The usual proposal at this point is micro-frontends.",
    ),
    p(
      "Sometimes that is right. More often, the problem is missing boundaries inside one application, and the cheaper fix is to draw them and make the tools enforce them.",
    ),
    h2("What breaks as teams grow"),
    ul(
      "Ownership is implicit. Shared folders such as `components/` and `utils/` belong to everyone, which means no one.",
      "Features import each other’s internals, so a refactor in one team’s code breaks another team’s page.",
      "The design system drifts. Each team adds a slightly different button, and the product stops looking like one product.",
      "CI slows down, because every change builds and tests everything.",
      "Releases need coordination, because everything ships together.",
    ),
    p("Only the last one truly needs separate deployments. The other four are boundary problems."),
    h2("A modular monolith"),
    p(
      "Keep one application, one build and one deploy, but split the code into packages with explicit owners and explicit public interfaces. The app shell composes features. Features depend on the design system, never on each other’s internals.",
    ),
    diagram(
      "moduleBoundaries",
      "The app composes features; features depend on the design system; nothing reaches into another feature except through its public entry point.",
      "Three dashed zones. The top zone, apps/web, holds the app shell, which points down to three feature packages: deals owned by Growth, billing owned by Payments and reports owned by Insights, each with an index.ts tab as its public entry point. A red dashed arrow from deals into billing’s internals is crossed out, labelled deep imports into another feature fail lint. Features point down to the bottom zone, packages/ui, where tokens feed primitives, which feed patterns.",
    ),
    p("The boundaries only hold if a tool enforces them:"),
    code(
      "tsx",
      `
// packages/features/billing/package.json
{
  "name": "@acme/billing",
  "exports": { ".": "./src/index.ts" }  // the only importable path
}

// eslint.config.js
export default [
  {
    files: ["packages/features/**"],
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{
          group: ["@acme/*/src/*", "../../*/src/**"],
          message: "Import another feature through its public entry point.",
        }],
      }],
    },
  },
];
`,
    ),
    ul(
      "`exports` in each package’s `package.json` makes deep imports fail at resolution time, not just in lint.",
      "A `CODEOWNERS` entry per package routes reviews to the owning team automatically.",
      "A task runner such as Turborepo or Nx builds and tests only what a change affects, which keeps CI time flat as the repo grows.",
      "Shared code earns its place in `packages/ui` or a shared utilities package by being used by two features, not by being written in hope.",
    ),
    h2("A design system is an API"),
    p(
      "A design system scales when components never hard-code a decision that belongs to the brand. Design tokens make that structural: raw values at the bottom, meanings in the middle, component decisions on top.",
    ),
    diagram(
      "tokenLayers",
      "Components only reference semantic or component tokens. Themes remap the semantic layer and leave everything else alone.",
      "Three columns of tokens. Primitive tokens orange.500, sand.50 and ink.900 map to semantic tokens accent, surface and text, which map to component tokens button.bg, card.bg and body.text. Three theme chips, light, dark and brand B, point at the semantic column. Notes say components never name a raw colour and a theme remaps only the middle column, so dark mode or a second brand costs one file.",
    ),
    ul(
      "Store tokens in one source and generate CSS custom properties from it. The W3C Design Tokens format reached its first stable version in late 2025, so tools now agree on the file format.",
      "Build interactive components on headless, accessible primitives such as Base UI, Radix or React Aria, and own only the styling. Focus management and keyboard support are not where a product team should innovate.",
      "Version the design system like any API, with a changelog and deprecations, even inside a monorepo.",
    ),
    h2("Let CSS do the work"),
    p(
      "A lot of the JavaScript that used to hold large frontends together is now unnecessary. Modern CSS is supported in every current browser and removes whole categories of cross-team conflict.",
    ),
    ul(
      "Cascade layers (`@layer`) fix the order of reset, design system, features and overrides, so specificity wars between teams end.",
      "Container queries let a component adapt to the space its slot gives it, not the viewport, which is what makes a component truly reusable across pages.",
      "`:has()` replaces many parent-state hacks that used to need JavaScript.",
      "Custom properties carry theme values through any component tree without a context provider.",
    ),
    quote("Most frontend scaling problems are ownership problems wearing a technical costume."),
    h2("When micro-frontends pay off"),
    p(
      "Micro-frontends give each team its own build and deploy, composed into one experience at runtime or at the edge. That independence is valuable when:",
    ),
    ul(
      "Teams genuinely need different release cadences and cannot wait for a shared release train.",
      "You are migrating a large legacy frontend gradually and need old and new stacks side by side.",
      "Separate organisations, or acquired products, must ship into one shell.",
    ),
    p("The costs are real and mostly permanent:"),
    ul(
      "Duplicate dependencies and larger downloads unless shared versions are coordinated, which reintroduces coupling.",
      "Version skew at runtime: two copies of React, or of the design system, on one page.",
      "Cross-cutting concerns, such as routing, authentication, analytics and error handling, now need a contract between independently deployed pieces.",
      "Consistency gets harder: every team can drift from the design system on its own schedule.",
    ),
    p(
      "If you do go this way, compose at build time or on the server before runtime federation, and keep the design system as one shared, versioned package.",
    ),
    h2("The trade-offs"),
    ul(
      "Enforced boundaries slow down the occasional legitimate shortcut, and someone has to own the lint rules.",
      "One deploy for everything means one bad change blocks the release. Feature flags and fast rollbacks reduce that cost.",
      "A design system needs a funded owner. Without one it becomes a folder of components nobody dares change.",
    ),
    h2("Lessons"),
    ul(
      "Draw boundaries with packages and public entry points, and let tools enforce them.",
      "Give every package an owner in `CODEOWNERS`.",
      "Build the design system on tokens and headless primitives, and treat it as a versioned API.",
      "Use cascade layers and container queries before reaching for more JavaScript.",
      "Choose micro-frontends for deploy independence you can name, not for tidiness.",
    ),
  ],
};
