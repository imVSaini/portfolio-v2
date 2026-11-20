import Link from "next/link";

import { FooterMotion } from "@/components/layout/FooterMotion";
import { RollText } from "@/components/motion/RollText";
import { ScrollLink } from "@/components/scroll/ScrollLink";
import { CurrentYear } from "@/components/ui/CurrentYear";
import { Seal } from "@/components/ui/Seal";
import { socialIcons } from "@/components/ui/SocialIcons";
import { contact } from "@/data/contact";
import { site } from "@/data/site";

const letters = [...site.shortName];
const SEAL_ITEMS = ["Back to top", "Back to top", "Back to top"] as const;

/**
 * Scrolling in draws the rule, raises the wordmark letter by letter, then drops the accent dot and
 * spins the back-to-top seal in. A pointer over the wordmark lifts the letters nearest to it.
 */
export function Footer() {
  return (
    <FooterMotion className="relative overflow-clip">
      <span
        data-footer-rule=""
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px origin-left bg-line"
      />
      <div className="container-page grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-8 py-10 md:grid-cols-[1fr_auto_auto] md:items-end md:gap-y-10">
        <p
          data-footer-wordmark=""
          aria-hidden="true"
          className="col-span-2 flex font-display text-[17vw] leading-[0.8] font-semibold tracking-[-0.03em] uppercase select-none md:text-[clamp(3rem,13.5vw,15rem)]"
        >
          {letters.map((letter, i) => (
            // Clipped along the bottom only, so glyphs rise out of the baseline untrimmed.
            <span
              key={i}
              data-footer-mask=""
              className="inline-block [clip-path:inset(-1em_-0.2em_0_-0.2em)]"
            >
              <span data-footer-glyph="" className="inline-block">
                {letter}
              </span>
            </span>
          ))}
          <span data-footer-dot="" className="inline-block text-accent">
            .
          </span>
        </p>
        <ul
          data-footer-meta=""
          className="col-start-1 row-start-2 flex flex-col text-p4 tracking-wide text-muted uppercase md:col-start-2 md:flex-row md:gap-6"
        >
          {contact.links.map((link) => {
            const Icon = socialIcons[link.label];
            return (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${link.label} (opens in a new tab)`}
                  className="group inline-flex min-h-11 items-center gap-2 md:min-h-6"
                >
                  <Icon
                    aria-hidden="true"
                    className="size-3.5 transition-colors duration-300 group-hover:text-accent group-focus-visible:text-accent"
                  />
                  <RollText text={link.label} />
                </a>
              </li>
            );
          })}
        </ul>
        <ScrollLink
          href="#top"
          aria-label="Back to top"
          data-footer-seal=""
          className="group col-start-2 row-start-2 block size-24 justify-self-end rounded-full sm:size-28 md:col-start-3 md:row-start-1 md:size-36 xl:size-44"
        >
          <Seal
            items={SEAL_ITEMS}
            className="size-full"
            discClassName="size-[40%] overflow-hidden transition-transform duration-500 ease-out-expo group-hover:scale-110 group-focus-visible:scale-110 motion-reduce:transition-none"
          >
            <span className="absolute inset-0 grid place-items-center transition-transform duration-500 ease-out-expo group-hover:-translate-y-full group-focus-visible:-translate-y-full motion-reduce:transition-none">
              ↑
            </span>
            <span className="absolute inset-0 grid translate-y-full place-items-center transition-transform duration-500 ease-out-expo group-hover:translate-y-0 group-focus-visible:translate-y-0 motion-reduce:transition-none">
              ↑
            </span>
          </Seal>
        </ScrollLink>
        <span
          data-footer-meta=""
          className="col-start-1 row-start-3 text-p4 tracking-wide text-muted uppercase md:row-start-2"
        >
          © <CurrentYear /> {site.fullName}
        </span>
        <nav
          data-footer-meta=""
          aria-label="Legal"
          className="col-start-2 row-start-3 justify-self-end text-p4 tracking-wide text-muted uppercase md:col-start-3 md:row-start-2"
        >
          <Link href="/privacy" className="group inline-flex min-h-6 items-center">
            <RollText text="Privacy policy" />
          </Link>
        </nav>
      </div>
    </FooterMotion>
  );
}
