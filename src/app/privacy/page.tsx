import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { Footer } from "@/components/layout/Footer";
import { RevealText } from "@/components/motion/RevealText";
import { RollText } from "@/components/motion/RollText";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { contact } from "@/data/contact";
import { site } from "@/data/site";
import { STORAGE_KEYS } from "@/lib/appearance";

const LAST_UPDATED = "31 October 2026";

const link =
  "underline decoration-line-strong underline-offset-4 transition-colors duration-300 intent:text-accent intent:decoration-accent";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${site.name}'s portfolio handles your data: no cookies, no analytics, no tracking.`,
  alternates: { canonical: "/privacy" },
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-line pt-8 md:grid-cols-12 md:gap-10">
      <h2 className="text-h4 uppercase md:col-span-4">{title}</h2>
      <div className="flex flex-col gap-4 text-p2 text-muted md:col-span-8">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <header className="container-page flex h-(--header-h) items-center justify-between gap-6">
        <Link href="/" aria-label={`${site.name}, home`} className="group flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-faded-black font-display text-p4 font-semibold text-manila-light dark:bg-manila-light dark:text-faded-black">
            <RollText text={site.monogram} />
          </span>
          <span className="font-display text-p3 font-medium whitespace-nowrap uppercase">
            <RollText text={site.name} />
          </span>
        </Link>
        <Link
          href="/"
          className="group inline-flex items-center gap-2 font-display text-p4 font-medium tracking-wide uppercase"
        >
          <span
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:-translate-x-1"
          >
            ←
          </span>
          <RollText text="Back to home" />
        </Link>
      </header>

      <main id="main" className="container-page flex flex-col gap-16 pt-16 pb-28 md:pt-24 md:pb-40">
        <div className="flex flex-col gap-6">
          <SectionLabel>Privacy</SectionLabel>
          <RevealText as="h1" on="load" className="text-h2 uppercase">
            Privacy policy
          </RevealText>
          <p className="max-w-2xl text-p1 text-muted">
            The short version: this site uses no cookies, no analytics and no trackers, and it has
            no forms. Last updated {LAST_UPDATED}.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          <Section title="What I collect">
            <p>
              Nothing. Visiting this site doesn’t create an account, profile or record of you on my
              side, and no third-party scripts run on it. The fonts are served from this site rather
              than an outside font service.
            </p>
          </Section>

          <Section title="Stored on your device">
            <p>
              If you change the theme, accent colour or tone, that choice is saved in your browser’s
              local storage under <code>{STORAGE_KEYS.theme}</code>,{" "}
              <code>{STORAGE_KEYS.accent}</code> and <code>{STORAGE_KEYS.tone}</code>, so it’s still
              set on your next visit. It never leaves your device, and you can remove it at any time
              by clearing this site’s data in your browser.
            </p>
          </Section>

          <Section title="Hosting">
            <p>
              The site is hosted on Vercel. Like any web host, Vercel processes technical details
              such as your IP address and browser type to deliver pages and keep the service secure.
              Their{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noreferrer"
                aria-label="Vercel’s privacy policy (opens in a new tab)"
                className={link}
              >
                privacy policy
              </a>{" "}
              covers how they handle it.
            </p>
          </Section>

          <Section title="If you email me">
            <p>
              I receive your email address and whatever you choose to send. I use it only to reply
              to you, I don’t share it, and I’ll delete it if you ask.
            </p>
          </Section>

          <Section title="Other sites">
            <p>
              Links to LinkedIn, GitHub and the projects I’ve built take you to sites with their own
              privacy policies, which apply once you’re there.
            </p>
          </Section>

          <Section title="Questions">
            <p>
              Write to{" "}
              <a href={`mailto:${contact.email}`} className={link}>
                {contact.email}
              </a>
              . If this policy changes, the date at the top will change with it.
            </p>
          </Section>
        </div>
      </main>

      <Footer />
    </>
  );
}
