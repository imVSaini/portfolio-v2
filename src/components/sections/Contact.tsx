import { RevealText } from "@/components/motion/RevealText";
import { RollText } from "@/components/motion/RollText";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { contact } from "@/data/contact";
import { site } from "@/data/site";

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
            Have a&nbsp;hard problem? Let’s build the{" "}
            <span className="text-accent">calm version.</span>
          </RevealText>
        </div>

        <div className="grid gap-12 md:grid-cols-12 md:items-end">
          <div className="flex flex-col gap-8 md:col-span-7">
            <p className="max-w-xl text-p1 text-muted">
              If you have a project in mind, feel free to reach out — I’d be glad to help bring your
              vision to life.
            </p>
            <a
              href={`mailto:${contact.email}`}
              className="group inline-flex w-fit max-w-full items-center gap-[0.4em] font-display text-[clamp(1.125rem,3.4vw,2.75rem)] leading-tight font-semibold whitespace-nowrap"
            >
              <RollText text={contact.email} />
              <span
                aria-hidden="true"
                className="grid size-[2em] shrink-0 place-items-center rounded-full border border-current/25 text-[0.55em] text-accent transition-[rotate,background-color,border-color,color] duration-500 ease-out-expo group-hover:rotate-45 group-hover:border-accent group-hover:bg-accent group-hover:text-faded-black group-focus-visible:rotate-45 group-focus-visible:border-accent group-focus-visible:bg-accent group-focus-visible:text-faded-black motion-reduce:transition-none"
              >
                ↗
              </span>
            </a>
          </div>

          <div className="flex flex-col gap-6 md:col-span-4 md:col-start-9">
            <ul className="flex flex-col border-t border-line-strong">
              {contact.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between gap-4 border-b border-line-strong py-5 transition-colors duration-300 intent:text-accent"
                  >
                    <span className="font-display text-h4 font-medium uppercase">{link.label}</span>
                    <span className="flex items-center gap-3 text-p3 text-muted">
                      {link.handle}
                      <span
                        aria-hidden="true"
                        className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                      >
                        ↗
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="flex items-center justify-between text-p4 tracking-wide text-muted uppercase">
              <span>{site.location}</span>
              <span>
                <LiveClock className="text-faded-black tabular-nums dark:text-manila-light" /> IST
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
