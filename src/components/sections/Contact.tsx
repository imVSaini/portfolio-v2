import { RevealText } from "@/components/motion/RevealText";
import { RollText } from "@/components/motion/RollText";
import { DayPeriod } from "@/components/sections/contact/DayPeriod";
import { ArrowSwap } from "@/components/ui/ArrowSwap";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { contact } from "@/data/contact";

import { LiveClock } from "./LiveClock";

export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="relative overflow-hidden border-t border-line py-28 md:py-40"
    >
      <div
        aria-hidden="true"
        data-scroll=""
        data-scroll-speed="0.2"
        className="pointer-events-none absolute -bottom-1/3 -left-1/4 size-[60vw] rounded-full bg-accent opacity-15 blur-[140px] dark:opacity-25"
      />

      <div className="relative container-page flex flex-col gap-16">
        <div className="flex flex-col gap-6">
          <SectionLabel>Contact</SectionLabel>

          <RevealText as="h2" id="contact-title" className="text-h1 uppercase">
            Got an idea? <span className="text-accent">Say hello.</span>
          </RevealText>
        </div>

        <div className="grid gap-12 md:grid-cols-12 md:items-end">
          <div className="flex flex-col gap-8 md:col-span-8">
            <p className="max-w-xl text-p1 text-muted">
              If you have a project in mind, feel free to reach out — I’d be glad to help bring your
              vision to life.
            </p>
            <a
              href={`mailto:${contact.email}`}
              className="group inline-flex w-fit max-w-full items-center gap-[0.4em] font-display text-[clamp(1.125rem,3.4vw,2.75rem)] leading-tight font-semibold whitespace-nowrap"
            >
              <RollText text={contact.email} />
              <span
                aria-hidden="true"
                className="grid size-[2em] shrink-0 place-items-center rounded-full bg-faded-black text-[0.55em] text-manila-light transition-colors duration-300 ease-out-expo corner-squircle dark:bg-manila-light dark:text-faded-black group-intent:bg-accent group-intent:text-faded-black dark:group-intent:bg-accent"
              >
                <ArrowSwap />
              </span>
            </a>
          </div>

          <div className="flex flex-col gap-3 md:col-span-4 md:items-end md:text-right">
            <p className="text-p4 tracking-wide text-muted uppercase">Local time</p>
            <p className="flex flex-col gap-1 font-display text-h4 font-medium md:items-end">
              <span>
                <LiveClock className="tabular-nums" /> IST
              </span>
              <DayPeriod className="text-muted" />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
