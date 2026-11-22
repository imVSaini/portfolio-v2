export const notFound = {
  /** Browser tab title; the root template appends the site name. */
  title: "Page not found",
  heading: "Page not found",
  description:
    "This page doesn’t exist or has moved. The work, the experience and a way to reach me are all on the home page.",
  cta: { label: "Back to home", href: "/" },
  /** Phrases on the ring that stands in for the zero. */
  seal: ["Not found", "Not found", "Not found"],
} as const;
