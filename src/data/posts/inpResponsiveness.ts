import { code, h2, p, quote, ul } from "@/data/article";
import { diagram, type PostSource } from "@/data/posts/schema";

export const inpResponsiveness: PostSource = {
  slug: "inp-react-compiler-and-yielding",
  title: "Responsiveness in 2026: INP, the React Compiler and yielding to the main thread",
  excerpt:
    "Interaction to Next Paint measures how quickly a page responds to every click, tap and key press, and plenty of fast-loading React apps fail it on mid-range phones. How to find the slow interactions in field data, what each of INP’s three phases is telling you, where the React Compiler helps and where it cannot, and how scheduler.yield() lets input cut in line.",
  metaTitle: "INP, the React Compiler and yielding",
  metaDescription:
    "Many fast-loading React apps fail INP on real phones. Field attribution, the three phases of an interaction, the React Compiler and scheduler.yield().",
  topic: "Frontend",
  date: "2026-09-30",
  tint: "gold",
  art: "frames",
  body: [
    p(
      "A page can load in a second and still feel broken. You tap a filter and nothing happens for half a second; you type in a search box and the characters arrive in bursts. Interaction to Next Paint, a Core Web Vital since March 2024, measures exactly that, and it is the vital most React applications struggle with.",
    ),
    p(
      "The good news is that the tools have caught up. The React Compiler reached 1.0 in October 2025, `scheduler.yield()` ships in Chromium and Firefox, and the Long Animation Frames API tells you which script was running when the user was kept waiting.",
    ),
    h2("What INP measures"),
    p(
      "INP observes every click, tap and key press during a visit and reports one of the slowest, the worst on most pages, a high percentile on pages with very many interactions. Each interaction is measured from the input to the next frame painted, and that time has three parts.",
    ),
    diagram(
      "inpAnatomy",
      "One interaction, three phases: waiting for the main thread, running handlers, and producing the next frame.",
      "A main-thread timeline. A click arrives during someone else’s long task, so it waits: that is input delay. Then the page’s own event handlers run: processing. Then style, layout and paint produce the next frame: presentation delay. A bracket spanning all three is labelled INP, click to next paint, with a note that good means 200 milliseconds or less for at least 75 percent of visits.",
    ),
    ul(
      "Input delay: the main thread was busy when the user acted, often with a third-party script, hydration or a timer.",
      "Processing: your event handlers and the rendering work they trigger.",
      "Presentation delay: style recalculation, layout and paint for the next frame, which grows with DOM size and expensive CSS.",
    ),
    p(
      "Each phase has different fixes, so the first job is to learn which one is slow, and for which interaction.",
    ),
    h2("Measure in the field"),
    p(
      "Lab tools on a fast laptop rarely reproduce INP problems. Collect it from real users, with attribution, so each slow interaction arrives with its target element, its phase breakdown and the scripts that were running.",
    ),
    code(
      "tsx",
      `
import { onINP } from "web-vitals/attribution";

onINP(({ value, attribution }) => {
  const scripts = attribution.longAnimationFrameEntries.flatMap((frame) =>
    frame.scripts.map((script) => script.sourceURL),
  );
  navigator.sendBeacon(
    "/rum",
    JSON.stringify({
      inp: value,
      target: attribution.interactionTarget,
      inputDelay: attribution.inputDelay,
      processing: attribution.processingDuration,
      presentation: attribution.presentationDelay,
      scripts: [...new Set(scripts)],
    }),
  );
});
`,
    ),
    p(
      "Group the results by target and page, and sort by the 75th percentile. A short list of interactions, often a filter, a menu and a form field, usually accounts for most of the problem.",
    ),
    h2("Fixing input delay"),
    ul(
      "Load third-party scripts after the page is interactive, and audit them quarterly. Tag managers accumulate.",
      "Hydrate less. Server Components ship no JavaScript, and `Suspense` boundaries let React hydrate the part the user is touching first.",
      "Break up your own long tasks during load: initialising a large store or parsing a big JSON payload can block the first tap.",
      "Move pure computation off the main thread into a Web Worker when it takes more than a few frames.",
    ),
    h2("Fixing processing time"),
    p(
      "The rule is simple: do the minimum needed to show the user that something happened, let the browser paint, then do the rest. Show the pressed state and the spinner first; filter ten thousand rows afterwards, in pieces, yielding between them.",
    ),
    diagram(
      "yieldChunks",
      "The same work split into chunks. The click is handled after the current chunk instead of after all of them.",
      "Two rows. In the first, one long task renders 2,000 rows, a click arrives early and waits, shown as a red bar, until the whole task finishes. In the second, the work is split into short chunks with gaps; the click arrives during the second chunk and its handler runs right after it, in accent, before the remaining chunks continue.",
    ),
    code(
      "tsx",
      `
function yieldToMain(): Promise<void> {
  if ("scheduler" in globalThis && "yield" in scheduler) {
    return scheduler.yield();
  }
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function applyFilter(rows: Row[], filter: Filter) {
  showPending(); // visible feedback in the very next frame
  await yieldToMain();
  const matches: Row[] = [];
  for (const [index, row] of rows.entries()) {
    if (matchesFilter(row, filter)) matches.push(row);
    if (index % 500 === 499) await yieldToMain();
  }
  renderRows(matches);
}
`,
    ),
    p(
      "`scheduler.yield()` is better than a `setTimeout` because the continuation goes to the front of the queue rather than the back, so yielding does not let unrelated tasks overtake your work. Safari does not support it yet, hence the fallback. Inside React, `useTransition` does the equivalent for state updates: urgent updates such as the input value render first, and the expensive list re-render is marked as interruptible.",
    ),
    h2("The React Compiler"),
    p(
      "The React Compiler memoises components and hooks automatically at build time, so a parent re-render no longer re-renders every child whose props did not change. In codebases that never got around to `memo` and `useMemo`, that removes a lot of wasted rendering from the processing phase with no code changes.",
    ),
    ul(
      "It helps when interactions are slow because too much re-renders.",
      "It does not help when one component does expensive work whose inputs really did change: a 5,000-row table still needs virtualisation.",
      "It relies on the rules of React: pure render functions and no mutation of props or state. Its lint rules in `eslint-plugin-react-hooks` find the components it had to skip.",
      "Adopt it incrementally, directory by directory, and compare field INP before and after rather than trusting a lab benchmark.",
    ),
    quote(
      "Memoisation removes work that should never have happened. It does nothing for work that has to happen; that work needs to be smaller, later or elsewhere.",
    ),
    h2("Fixing presentation delay"),
    ul(
      "Keep the DOM small. Pages with tens of thousands of nodes pay for every style and layout pass.",
      "Use `content-visibility: auto` for long, offscreen sections so the browser skips their rendering work.",
      "Avoid reading layout, such as `offsetHeight`, right after writing styles in the same handler; it forces a synchronous layout.",
      "Animate `transform` and `opacity` only, which the compositor can handle without layout.",
    ),
    h2("The trade-offs"),
    ul(
      "Yielding makes the total work slightly longer. Users notice responsiveness far more than total duration.",
      "Chunked work needs care with consistency: the user can change the filter between chunks, so cancel stale work.",
      "Real-user monitoring adds a script and a data pipeline, which is still far cheaper than guessing.",
      "The compiler changes how components re-render. Code that relied on extra renders, usually by accident, can behave differently.",
    ),
    h2("Lessons"),
    ul(
      "Measure INP in the field with attribution before changing any code.",
      "Fix the phase that is slow: input delay, processing or presentation each have their own remedies.",
      "Paint feedback first, then yield, then do the heavy work in chunks.",
      "Turn on the React Compiler for free wins, and keep virtualising big lists.",
      "Test on a mid-range Android phone. That is where your INP lives.",
    ),
  ],
};
