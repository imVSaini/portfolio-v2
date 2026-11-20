import { code, h2, p, quote, ul } from "@/data/article";
import { diagram, type PostSource } from "@/data/posts/schema";

export const measuringEngineering: PostSource = {
  slug: "measuring-engineering-in-the-ai-era",
  title: "Measuring engineering in the AI era: DORA, developer experience and what not to count",
  excerpt:
    "Every engineering leader is now asked whether AI is making the team faster. The honest answer needs measurement that cannot be gamed: delivery metrics per service, read together, alongside developer experience. What the five DORA metrics capture, what the 2025 DORA report found about AI, and the vanity numbers, from lines generated to suggestions accepted, that are best left uncounted.",
  metaTitle: "Measuring engineering in the AI era",
  metaDescription:
    "Is AI making the team faster? DORA’s five delivery metrics, developer experience signals, the 2025 DORA findings and the vanity numbers to drop.",
  topic: "Leadership",
  date: "2026-09-16",
  tint: "magenta",
  art: "gauges",
  body: [
    p(
      "“Is AI making us faster?” is now a question every engineering leader gets in every planning meeting. The tempting answers are the easy numbers: lines of code generated, suggestions accepted, pull requests merged. All of them go up when you adopt AI tools, and none of them tell you whether the team is delivering more value, more safely.",
    ),
    p(
      "Measurement in engineering works when it measures the system, not the people, and when it reads speed and stability together. That has not changed with AI. What has changed is how badly the easy numbers can mislead.",
    ),
    h2("Systems, not people"),
    p(
      "When a measure becomes a target, it stops being a good measure. Count pull requests per engineer and you will get more, smaller, emptier pull requests. Count story points and estimates inflate. Any metric attached to an individual’s performance review will be optimised, often skilfully, at the expense of what it was meant to show.",
    ),
    ul(
      "Measure per service and per team, and look at trends over months, not a weekly snapshot.",
      "Never build individual leaderboards from delivery data.",
      "Use numbers to start conversations in retrospectives, not to end them in reviews.",
    ),
    h2("The five delivery metrics"),
    p(
      "DORA’s research has refined the classic four metrics into five, split into two groups: throughput, how quickly changes reach users, and instability, how often they hurt.",
    ),
    diagram(
      "doraMetrics",
      "Three throughput metrics and two instability metrics. Each is only meaningful next to the others.",
      "Two dashed groups. Throughput, how fast, holds lead time from commit to production, deploy frequency per service per day, and recovery time from a failed deploy to a restored service. Instability, how safely, holds change fail rate, deploys needing a fix, and rework rate, unplanned fix deploys, with a note to read all five together per service and never per person. Below: speed without stability is just faster incidents.",
    ),
    p(
      "Most of these come from data you already have. Deploy events from the pipeline, commit timestamps from Git, and incident or rollback markers from wherever your on-call tooling records them:",
    ),
    code(
      "sql",
      `
-- Delivery metrics per service over the last 30 days.
SELECT
    d.service,
    count(*)                                         AS deploys,
    percentile_cont(0.5) WITHIN GROUP (
        ORDER BY extract(epoch FROM d.deployed_at - c.committed_at) / 3600
    )                                                AS median_lead_time_hours,
    avg((d.caused_incident OR d.rolled_back)::int)   AS change_fail_rate,
    avg((d.kind = 'hotfix')::int)                    AS rework_rate
FROM deployments AS d
JOIN commits AS c ON c.sha = d.oldest_commit_sha
WHERE d.deployed_at > now() - interval '30 days'
GROUP BY d.service
ORDER BY d.service;
`,
    ),
    p(
      "Start with what the data can honestly support. A rough lead time from the oldest commit in each deploy is far more useful than a precise number nobody trusts.",
    ),
    h2("The leading indicators"),
    p(
      "Delivery metrics lag. By the time lead time rises, the cause has been there for months. Developer experience research, the SPACE framework and the later DevEx model built on feedback loops, cognitive load and flow, points at signals that move first.",
    ),
    ul(
      "Feedback loops: CI duration, time waiting for the first review, time from merge to production.",
      "Cognitive load: how many systems, repositories and tools a typical change touches.",
      "Flow: uninterrupted focus time, and how often work is blocked waiting on another team.",
      "A short quarterly survey, five or six questions asked the same way each time, so the trend means something.",
      "Time to first meaningful pull request for new hires, which exposes every rough edge in setup and documentation.",
    ),
    h2("What AI changes"),
    p(
      "The 2025 DORA report, based on nearly five thousand respondents, found AI use at about 90% of professionals, and found that it now correlates with higher delivery throughput, a reversal from the year before. It also found that AI use still correlates with higher instability. Its central conclusion is that AI is an amplifier: it magnifies the strengths of a well-run system and the dysfunctions of a poorly run one.",
    ),
    diagram(
      "aiAmplifier",
      "The same AI assistant amplifies whatever system it lands in: small batches and fast feedback turn into shipping more, large batches and slow review into breaking more.",
      "An AI assistant feeds two teams. Team A, with loose coupling and fast feedback, makes small pull requests under 400 lines, runs CI in minutes and ships more while stability holds. Team B, with tight coupling and slow review, makes large pull requests of thousands of lines, builds a review queue measured in days, and breaks more as rework rises.",
    ),
    p(
      "The report pairs this with a model of capabilities that decide which way the amplifier points, among them a clearly communicated stance on AI use, strong version control practice, working in small batches and a high-quality internal platform. None of them is about the AI tool itself.",
    ),
    quote(
      "If AI made your throughput go up and your change fail rate go up with it, you did not get faster. You moved work from development to incident response.",
    ),
    h2("What not to count"),
    ul(
      "Lines of code, generated or otherwise. More code is more to maintain.",
      "Suggestions accepted. It measures how often people press Tab, not whether the result was good.",
      "Pull requests per person. Easy to inflate and actively harmful as a target.",
      "Story points delivered. They measure estimation habits, not output.",
      "Hours worked or online. A proxy for effort that says nothing about outcome and corrodes trust.",
    ),
    h2("Using the numbers well"),
    ul(
      "Pair every metric with its counterweight: deploy frequency with change fail rate, lead time with rework.",
      "Look for change over time within a service, not comparisons between teams with different systems.",
      "Bring the numbers to the team first, and ask what explains them.",
      "When introducing AI tools, record a baseline beforehand, so the before-and-after comparison is real.",
      "Revisit the measures yearly. A metric that has stopped informing decisions should be dropped.",
    ),
    h2("The trade-offs"),
    ul(
      "Good measurement needs plumbing: deploy events, incident links and survey tooling all take time to set up.",
      "Team-level metrics hide individual struggles. Pair them with regular one-to-ones, not individual dashboards.",
      "Surveys suffer from fatigue and politeness. Keep them short, anonymous and acted upon.",
      "Metrics with small samples swing wildly. Low-volume services need longer windows before any trend means anything.",
    ),
    h2("Lessons"),
    ul(
      "Measure systems and teams, never individuals.",
      "Read throughput and instability together; one without the other misleads.",
      "Watch developer experience signals; they move before delivery metrics do.",
      "Judge AI by its effect on the five delivery metrics, not by activity counts.",
      "Invest in small batches, fast feedback and a good platform; they decide whether AI helps.",
    ),
  ],
};
