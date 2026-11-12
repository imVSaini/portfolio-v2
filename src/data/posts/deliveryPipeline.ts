import { code, h2, p, quote, ul } from "@/data/article";
import { diagram, type PostSource } from "@/data/posts/schema";

export const deliveryPipeline: PostSource = {
  slug: "ci-cd-is-not-just-automation",
  title: "CI/CD is not just automation: building a delivery pipeline you can trust",
  excerpt:
    "Running tests on every push is the easy half. A pipeline earns its keep when a green build means the change is safe to release and a bad release is boring to undo. Short-lived branches, one artefact promoted through every environment, migrations that tolerate a rollback, and a rollback you have actually rehearsed.",
  topic: "DevOps",
  date: "2026-10-29",
  tint: "gold",
  art: "pipeline",
  body: [
    p(
      "Most teams have a pipeline. Fewer have one they trust. The difference shows on a Friday afternoon: either a green build is enough to release, or someone still says “let’s wait until Monday”.",
    ),
    h2("Automated is not the same as reliable"),
    p(
      "A pipeline can be fully automated and still tell you very little. Tests that pass when the behaviour is broken, a staging environment that differs from production, a deploy script that works unless a migration is involved. Each of these automates a step without making the outcome more certain.",
    ),
    h2("Where pipelines lose trust"),
    ul(
      "Flaky tests. Once people re-run a red build until it turns green, the signal is gone.",
      "Slow feedback. A forty-minute pipeline pushes people towards large, infrequent merges, which are the risky kind.",
      "Rebuilding per environment. If production runs a different build from the one you tested, you tested something else.",
      "Rollback that exists only as a plan. The first attempt should not be during an incident.",
    ),
    h2("What a reliable pipeline does"),
    ul(
      "Short-lived branches into one main branch, behind review, so integration happens daily and not at the end.",
      "Fast checks first: types, lint and unit tests in a couple of minutes. Slower integration and end-to-end suites after.",
      "Build one artefact, usually a container image tagged with the commit, and promote that same image through every environment.",
      "Keep configuration outside the image, so promotion changes settings and not code.",
      "Separate deploy from release with feature flags, so unfinished work can ship dark.",
      "Make migrations backwards compatible: add first, switch the code, remove later.",
    ),
    p(
      "The last point is the one that makes rollback real. If version N+1 drops a column that version N still reads, you cannot go back, whatever the deploy tool promises. Expand, migrate, contract takes three releases, and it is the price of an undo button that works.",
    ),
    diagram(
      "migration",
      "Renaming a column takes three releases. The old and new versions of the code both work at every step.",
      "Three releases. In the first, the table has the old name column and a new full_name column. In the second, both exist while data is backfilled and the code switches over. In the third, the old column is dropped and only full_name remains.",
    ),
    code(
      "sql",
      `
-- Release 1: expand
ALTER TABLE contacts ADD COLUMN full_name text;

-- Release 2: backfill, and switch the code to read full_name
UPDATE contacts SET full_name = name WHERE full_name IS NULL;

-- Release 3: contract, once nothing reads the old column
ALTER TABLE contacts DROP COLUMN name;
`,
    ),
    p(
      "The pipeline around it can stay short. Fast checks gate the build, the image is built once, and that same image moves through every environment:",
    ),
    code(
      "yaml",
      `
jobs:
  check:
    steps:
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test
  build:
    needs: check
    steps:
      - run: docker build -t registry.example.com/app:$GIT_SHA .
      - run: docker push registry.example.com/app:$GIT_SHA
  staging:
    needs: build
    steps:
      - run: ./deploy.sh staging $GIT_SHA
  production:
    needs: staging
    environment: production
    steps:
      - run: ./deploy.sh production $GIT_SHA
`,
    ),
    p(
      "This is trimmed to the shape. What matters is that `production` receives the commit that `staging` ran, and that rolling back is the same command with the previous commit.",
    ),
    h2("The trade-offs"),
    ul(
      "Trunk-based work needs feature flags, and flags are debt of their own if nobody removes them.",
      "End-to-end tests catch what nothing else does, and they are the slowest and the flakiest. Keep them few and aimed at the flows that pay the bills.",
      "Blue-green and canary releases need spare capacity and good metrics. Without the metrics, a canary is just a slower deploy.",
      "Every gate adds minutes. A gate that never fails is cost without signal, so delete it.",
    ),
    h2("A real example"),
    p(
      "The products I lead are backed by 325 automated tests and 28 end-to-end tests. The split is deliberate. The bulk runs against a real PostgreSQL database rather than mocks, because tenancy, permissions and migrations are where our bugs would live, and a mock agrees with whatever you tell it. The end-to-end suite stays small and covers the journeys a customer would notice within a minute: signing in, including MFA, and the core record flows.",
    ),
    quote(
      "The test of a pipeline is not whether it is green. It is whether anyone still checks manually after it is.",
    ),
    h2("Lessons learned"),
    ul(
      "Treat a flaky test as a production bug in the pipeline. Fix it or delete it the same week.",
      "Measure time from merge to production and time to restore. They tell you more than coverage does.",
      "Rehearse a rollback on an ordinary day.",
      "Small pull requests are a delivery practice, not a style preference. They are what keeps every other step fast.",
    ),
  ],
};
