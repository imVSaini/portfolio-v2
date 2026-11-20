# 0004. Animated sections stay on the server behind wrappers

- Status: Accepted
- Date: 2026-11-20

## Context

`Hero`, `Approach`, `Experience` and `Footer` were client components only so `useGSAP` could hold
a ref on their outer element. That made every child they imported, and the data those children
read, part of the client bundle too.

## Decision

Each animated section keeps its markup in a Server Component and renders its outer element
through a small client wrapper beside it (`HeroMotion`, `ApproachMotion`, `ExperienceMotion`,
`FooterMotion`). The wrapper owns the ref and the `useGSAP` block, and receives the server-rendered
markup as `children`. Animations find their targets through `data-*` attributes scoped to that
ref, so they do not need component references.

The Next.js server and client boundary guide describes this pattern: rendered elements passed as
`children` cross the boundary without adding their code to the client graph.

## Consequences

- The section markup, its child components and its data are no longer shipped as client code.
  Measured at the time, the home page lost 7.7 KB of gzipped script and every other page 1.6 KB.
- Motion code and markup live in two files, connected by `data-*` attribute names.
- A new animated section follows the same split, rather than adding `"use client"` to the section.
