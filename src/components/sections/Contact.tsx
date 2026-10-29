import { RevealText } from "@/components/motion/RevealText";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { contact } from "@/data/contact";
import { site } from "@/data/site";

import { LiveClock } from "./LiveClock";

export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="relative overflow-hidden bg-faded-black py-28 text-manila-light md:py-40 dark:bg-soot"
    >
      <div
        aria-hidden="true"
        data-scroll=""
        data-scroll-speed="0.2"
        className="pointer-events-none absolute -bottom-1/3 -left-1/4 size-[60vw] rounded-full bg-accent opacity-25 blur-[140px]"
      />

      <div className="relative container-page flex flex-col gap-16">
        <SectionLabel index="05" className="text-manila-light/60">
          Contact
        </SectionLabel>

        <RevealText as="h2" id="contact-title" className="text-h1 uppercase">
          Have a hard problem? Let’s build the <span className="text-accent">calm version.</span>
        </RevealText>

        <div className="grid gap-12 md:grid-cols-12 md:items-end">
          <div className="flex flex-col gap-8 md:col-span-7">
            <p className="max-w-xl text-p1 text-manila-light/70">
              I’m open to lead and senior full-stack roles, plus the occasional well-scoped
              contract. Tell me what’s breaking, or what you wish existed.
            </p>
            <a
              href={`mailto:${contact.email}`}
              className="group inline-flex w-fit items-center gap-4 font-display text-h3 font-semibold break-all"
            >
              <span className="bg-linear-to-r from-accent to-accent bg-size-[0%_2px] bg-bottom-left bg-no-repeat pb-1 transition-[background-size] duration-500 ease-out-expo group-hover:bg-size-[100%_2px]">
                {contact.email}
              </span>
              <span
                aria-hidden="true"
                className="text-accent transition-transform duration-500 ease-out-expo group-hover:translate-x-1 group-hover:-translate-y-1"
              >
                ↗
              </span>
            </a>
          </div>

          <div className="flex flex-col gap-6 md:col-span-4 md:col-start-9">
            <ul className="flex flex-col border-t border-manila-light/15">
              {contact.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between gap-4 border-b border-manila-light/15 py-5 transition-colors duration-300 intent:text-accent"
                  >
                    <span className="font-display text-h4 font-medium uppercase">{link.label}</span>
                    <span className="flex items-center gap-3 text-p3 text-manila-light/60">
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
            <p className="flex items-center justify-between text-p4 tracking-wide text-manila-light/60 uppercase">
              <span>{site.location}</span>
              <span>
                <LiveClock className="text-manila-light tabular-nums" /> IST
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
