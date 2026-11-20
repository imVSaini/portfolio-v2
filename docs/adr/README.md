# Architecture decision records

Short records of decisions that are expensive to reverse: the context, the choice and what it
costs. Add one when a change alters how the site is built, not for routine features.

Each record is numbered, never renumbered, and superseded rather than edited when a decision
changes.

| #                                        | Decision                                             | Status   |
| ---------------------------------------- | ---------------------------------------------------- | -------- |
| [0001](./0001-typed-content-blocks.md)   | Content is typed TypeScript blocks, not MDX or a CMS | Accepted |
| [0002](./0002-static-first-rendering.md) | Every page is prerendered; CSP avoids nonces         | Accepted |
| [0003](./0003-smooth-scroll-on-gsap.md)  | Locomotive Scroll v5 runs on GSAP's ticker           | Accepted |
| [0004](./0004-client-motion-wrappers.md) | Animated sections stay on the server behind wrappers | Accepted |
| [0005](./0005-enforced-architecture.md)  | Layering and script weight are enforced by tooling   | Accepted |

## Template

```md
# NNNN. Title

- Status: Proposed | Accepted | Superseded by NNNN
- Date: YYYY-MM-DD

## Context

## Decision

## Consequences
```
