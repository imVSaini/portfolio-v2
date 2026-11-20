import { code, h2, p, quote, ul } from "@/data/article";
import { diagram, type PostSource } from "@/data/posts/schema";

export const aiCodeReview: PostSource = {
  slug: "code-review-when-ai-writes-the-code",
  title: "Engineering standards when AI writes half the code: review, gates and ownership",
  excerpt:
    "Coding agents now draft a large share of the code that reaches review. Volume goes up, pull requests get bigger and plausible code hides subtle mistakes, while reviewer attention stays exactly where it was. Standards have to move from people’s heads into files the agent reads and gates that run before a person looks, so that human review can focus on intent, design and risk.",
  metaTitle: "Code review when AI writes the code",
  metaDescription:
    "Agents write more code than people can review. Rules the agent reads, gates before humans, small PRs, and review focused on intent, design and risk.",
  topic: "Leadership",
  date: "2026-10-21",
  tint: "orange",
  art: "review",
  body: [
    p(
      "A coding agent can open an 1,800-line pull request that is well formatted, fully typed and confidently wrong in two places that only someone who knows the billing rules would catch. Reviewing it properly takes longer than writing the feature would have. Most review processes were designed for a world where writing code was the slow part.",
    ),
    p(
      "It no longer is. Agents produce code faster than people can read it, so the standards that used to live in reviewers’ heads have to move somewhere that scales: into files the agent reads before it writes, and gates that run before a person looks.",
    ),
    h2("What agents change"),
    ul(
      "Volume rises. More pull requests, and bigger ones, arrive for the same number of reviewers.",
      "Mistakes change shape. Fewer typos and syntax slips; more code that is plausible, consistent and subtly wrong about the domain.",
      "Local consistency hides global drift. Each change matches the file it touches and ignores the decision recorded somewhere else.",
      "Reviewers tire. Faced with large, tidy diffs, people skim, and approval turns into a formality.",
    ),
    h2("Standards the agent reads"),
    p(
      "Agents follow instructions they can see. A repository-level instructions file, `AGENTS.md` or its equivalents, turns tribal knowledge into context the agent loads on every task. The repository behind this site has one, and it is the most effective quality tool in it: strict TypeScript rules, styling conventions, and the rule that every change ships with passing Playwright tests.",
    ),
    code(
      "markdown",
      `
## Working agreements
- Match the surrounding code. Do not add dependencies without asking.
- Every feature added, updated or removed comes with matching Playwright tests,
  run and passing.

## TypeScript
- strict, noUncheckedIndexedAccess and exactOptionalPropertyTypes. Never loosen tsconfig.
- No any, @ts-ignore or @ts-expect-error. Take unknown and narrow it.

## Before calling a change done
- npm run check passes: types, lint and formatting.
- The affected specs pass on all five browser projects.
`,
    ),
    ul(
      "Write rules as instructions with reasons, not slogans. “Use `type`, not `interface`” is followable; “write clean code” is not.",
      "Point to examples in the codebase. “See `getAssetUrl` in `src/lib/asset.ts`” teaches more than a paragraph.",
      "Keep it short and current. A rules file nobody maintains becomes a list of things the codebase no longer does.",
      "When a reviewer makes the same comment twice, it becomes a rule in the file, or better, a lint rule.",
    ),
    h2("Gates before people"),
    p(
      "Anything a machine can check should be checked before a human is asked to look. Every gate that fails sends the work back to the agent, which can usually fix it unaided, rather than to a reviewer.",
    ),
    diagram(
      "reviewGates",
      "Deterministic gates catch what machines can; failures go straight back to the agent. People see only changes that passed, and turn repeated comments into rules.",
      "An agent draft enters a zone of automated gates in sequence: strict types, lint and format rules, unit and end-to-end tests, a security scan for secrets, dependencies and code issues, and a size limit under 400 lines. Failures loop back to the agent along a red dashed path. Changes that pass reach human review of intent, design and risk, then merge. A dashed arrow from human review up to AGENTS.md says that a comment made twice becomes a rule.",
    ),
    ul(
      "Strict types and lint, with the rules your team actually cares about turned on as errors.",
      "Tests that exercise behaviour, including end-to-end tests for user-facing changes.",
      "Security scanning for committed secrets, vulnerable or newly added dependencies, and common code flaws.",
      "A size limit. Above a few hundred changed lines, the pull request must be split before review.",
      "Coverage on changed lines, so new code cannot arrive untested even if the overall number looks healthy.",
    ),
    h2("What humans review now"),
    p(
      "With the mechanical checks automated, human attention should move up a level, to questions only someone who understands the product and the system can answer.",
    ),
    diagram(
      "reviewAttention",
      "With gates and written rules, reviewer time moves from style and obvious bugs to design fit, intent and risk. The split is illustrative.",
      "A bar chart of reviewer time across five categories, without gates versus with gates and written rules. Without gates, most time goes to style, obvious bugs and missing tests. With gates, style drops to zero and obvious bugs and missing tests to five percent each, while design fit rises to 35 percent and intent and risk to 55 percent.",
    ),
    ul(
      "Intent: does this solve the problem in the ticket, or a nearby problem that was easier?",
      "Domain correctness: rounding, time zones, permissions, tenancy, money. This is where plausible code is most often wrong.",
      "Design fit: does it follow the decisions already recorded, or quietly introduce a second way of doing something?",
      "Failure modes: what happens on retry, on timeout, on partial failure, under concurrency?",
      "Tests: read them first. Do they test behaviour a user cares about, or restate the implementation?",
    ),
    quote(
      "The reviewer’s job is no longer to find the missing semicolon. It is to decide whether this change should exist in this shape.",
    ),
    h2("Keep pull requests small"),
    p(
      "An agent will happily produce two thousand lines in ten minutes. Reviewer attention does not scale with that, and the research is consistent that small batches make teams faster and safer; the 2025 DORA report lists working in small batches among the capabilities that decide whether AI helps or hurts. Ask agents for stacked, reviewable steps: the migration, then the API, then the UI.",
    ),
    h2("Ownership stays human"),
    p(
      "The person who merges a change owns it, whoever typed it. “The agent wrote that” is not an answer in an incident review, any more than “the IDE autocompleted it” was. A simple standard works: the author must be able to explain every line of the diff and why it is there. If they cannot, it is not ready for review.",
    ),
    h2("Mentoring in the agent era"),
    p(
      "Juniors risk skipping the struggle that used to build judgement. The struggle can be moved rather than removed.",
    ),
    ul(
      "Pair on reviewing agent output. Reading code critically is now a core skill, and it can be taught.",
      "Ask for the reasoning, not just the diff: why this approach, what else was considered, what would break it.",
      "Have juniors write the test by hand before the agent writes the implementation.",
      "Rotate debugging duty. Production incidents teach what no generated code will.",
    ),
    h2("The trade-offs"),
    ul(
      "More gates mean longer CI. Invest in caching and test selection, or people will route around them.",
      "Size limits add overhead for changes that are large by nature, such as generated code or renames. Allow labelled exceptions.",
      "Rules files need maintenance, and stale rules mislead agents confidently.",
      "Raising the bar on explanation slows the fastest contributors at first. It is still cheaper than an incident.",
    ),
    h2("Lessons"),
    ul(
      "Write standards where the agent reads them, with reasons and examples.",
      "Automate every check a machine can make, and send failures back to the agent.",
      "Keep pull requests small, especially when they are cheap to produce.",
      "Point human review at intent, domain correctness, design and failure modes.",
      "Whoever merges owns it. Require that every line can be explained.",
    ),
  ],
};
