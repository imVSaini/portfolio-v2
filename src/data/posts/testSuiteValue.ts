import { h2, p, ul, type PostSource } from "@/data/posts/schema";

export const testSuiteValue: PostSource = {
  slug: "what-a-test-suite-buys",
  title: "What 325 tests buy you, and what they do not",
  excerpt:
    "Test count is a vanity metric. What matters is which failures the suite can catch and how quickly it tells you. How I split effort between integration tests against a real database and a small end-to-end layer, and which tests are worth deleting.",
  topic: "Engineering",
  date: "2026-06-24",
  tint: "gold",
  art: "pyramid",
  body: [
    p(
      "The suite I maintain at work has 325 automated tests and 28 end-to-end tests. Neither number tells you whether a Friday deploy is safe. A suite is worth the failures it would catch, so that is the question I ask of every test.",
    ),
    h2("Name the failure"),
    p(
      "For each test, finish this sentence: “if this goes red, it means…”. If the honest ending is “someone refactored”, the test is guarding the implementation and not the behaviour.",
    ),
    h2("Integration tests against a real database"),
    p(
      "In a multi-tenant product the expensive bugs live in queries: a missing tenant scope, a permission filter that is too wide, a migration that breaks a constraint. A mocked database cannot catch any of them. So most tests go through the HTTP layer to a real PostgreSQL, each inside a transaction that is rolled back afterwards.",
    ),
    h2("A small end-to-end layer"),
    p(
      "End-to-end tests are slow and fragile by nature, so they are reserved for flows whose breakage would be unacceptable: signing in with MFA, creating a record, moving it through a pipeline. A small set that stays green is worth more than a large one that people have learned to re-run.",
    ),
    h2("Tests worth deleting"),
    ul(
      "Tests that assert a mock was called with certain arguments. They restate the code.",
      "Snapshots that get updated without anyone reading the diff.",
      "Tests that fail on every refactor and never on a bug.",
      "Flaky tests. A test that fails at random teaches the team to ignore red.",
    ),
    h2("What the suite does not buy"),
    p(
      "It says nothing about behaviour under load, about how a vendor’s API really responds, or about a migration running against production-sized data. Those need load tests, monitoring and staged rollouts. A green build is permission to deploy carefully, and no more than that.",
    ),
    h2("Speed is part of correctness"),
    p(
      "A suite that takes too long stops being run before a push, and a test nobody runs catches nothing. Keeping it fast is maintenance work that deserves time on the plan.",
    ),
  ],
};
