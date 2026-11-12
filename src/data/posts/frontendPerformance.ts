import { code, diagram, h2, p, ul, type PostSource } from "@/data/posts/schema";

export const frontendPerformance: PostSource = {
  slug: "frontend-performance-beyond-lazy-loading",
  title: "Frontend performance: making web applications fast beyond lazy loading",
  excerpt:
    "Lazy loading moves cost around; it does not remove it. Real speed comes from knowing which metric is failing and why: what blocks the largest paint, what keeps the main thread busy during a click, what shifts the layout. A field-data-first way to work through Core Web Vitals.",
  topic: "Frontend",
  date: "2026-10-01",
  tint: "magenta",
  art: "vitals",
  body: [
    p(
      "When a web application feels slow, the first suggestion is nearly always to lazy-load something. Sometimes that helps. Often it moves a delay from page load to the first click, where it is harder to measure and more annoying to meet.",
    ),
    h2("“We already lazy load”"),
    p(
      "Lazy loading is a technique. Performance is an outcome, and the outcome is measured from the user’s side: how soon the main content appears, how quickly the page responds to input, and whether things stay where they were. Those are the three Core Web Vitals, and each one fails for different reasons.",
    ),
    h2("Why one technique does not fix three metrics"),
    ul(
      "LCP, the largest paint, is about the critical path: server response time, render-blocking CSS and fonts, and when the hero image is discovered.",
      "INP, responsiveness, is about the main thread: long tasks, heavy hydration, and handlers that do too much before the next frame.",
      "CLS, layout stability, is about reserved space: images without dimensions, late-loading fonts, content injected above what the user is reading.",
    ),
    p(
      "Lazy-loading a below-the-fold chart helps none of these if the hero image is requested late, a third-party script blocks the thread, and the font swap moves the headline.",
    ),
    h2("Work from the metric that is failing"),
    ul(
      "Start with field data from real users. Lab scores run on a fast machine with an empty cache.",
      "For LCP: render the main content on the server, give the LCP image priority, inline or preload what the first paint needs, and cache HTML at the edge where you can.",
      "For INP: ship less JavaScript, keep client components small, break up long tasks, and defer work that does not affect the next frame.",
      "For CLS: set dimensions on media, reserve space for anything that loads late, and self-host fonts with a matched fallback.",
      "Audit third-party scripts. Analytics, chat and tag managers are frequently the largest cost on the page, and nobody on the team wrote them.",
    ),
    code(
      "tsx",
      `
<Image
  src={getAssetUrl(post.cover)}
  alt=""
  fill
  sizes="(min-width: 768px) 60vw, 100vw"
  loading="eager"
  fetchPriority="high"
/>
`,
    ),
    p(
      "Priority works both ways. The one image that is the largest paint should load eagerly with high priority. Lazy-loading it, which is the default advice, makes LCP worse. `sizes` matters as much: without it the browser may download a desktop-width image for a phone.",
    ),
    diagram(
      "waterfall",
      "LCP lands when the hero image finishes. Starting that request earlier moves the line; splitting JavaScript does not.",
      "A request waterfall over time: HTML first, then CSS and fonts, the hero image and JavaScript. A dashed line marks LCP at the moment the hero image finishes loading, while JavaScript is still downloading.",
    ),
    h2("The trade-offs"),
    ul(
      "Server rendering improves the first paint and adds server cost and hydration work.",
      "Aggressive code splitting produces many small requests and loading states between them.",
      "Preloading everything means prioritising nothing. A preload is a claim that this resource beats the others.",
      "Long cache lifetimes need content-hashed filenames, or users keep the old bundle.",
      "Animation libraries cost bytes and main-thread time. Animating only `transform` and `opacity` keeps that work off layout.",
    ),
    h2("A real example"),
    p(
      "This site is built on those rules. Sections render on the server and only the animated pieces are client components. Fonts are self-hosted, so there is no extra connection and no late swap from a third-party stylesheet. Images come from an asset bucket through the framework’s image component with explicit sizes. Motion animates `transform` and `opacity`, and is switched off entirely for visitors who prefer reduced motion.",
    ),
    p(
      "Early in my career I made client sites load 15% faster with nothing more exotic than refactoring and asset optimisation. The tools have changed since. The order of work has not: measure, find the largest cost, remove it.",
    ),
    h2("Lessons learned"),
    ul(
      "Fix the metric that is failing in the field, not the one that is easiest to improve in a lab.",
      "The fastest JavaScript is the JavaScript you did not send.",
      "Set a performance budget in CI. Regressions arrive one small dependency at a time.",
      "Test on a mid-range phone over a throttled connection. That is closer to your median user than your laptop is.",
    ),
  ],
};
