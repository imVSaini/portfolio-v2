import { ScrollLink } from "@/components/scroll/ScrollLink";
import { site } from "@/data/site";

export function Footer() {
  return (
    <footer className="bg-faded-black text-manila-light dark:bg-soot">
      <div className="container-page flex flex-col gap-10 border-t border-manila-light/10 py-10">
        <p
          aria-hidden="true"
          className="font-display text-[clamp(3rem,13.5vw,15rem)] leading-[0.8] font-semibold tracking-[-0.03em] uppercase select-none"
        >
          Vaibhav<span className="text-accent">.</span>
        </p>
        <div className="flex flex-col justify-between gap-4 text-p4 tracking-wide text-manila-light/60 uppercase sm:flex-row sm:items-center">
          <span>
            © {site.name} · {site.since} — Present
          </span>
          <ScrollLink href="#top" className="inline-flex items-center gap-2 intent:text-accent">
            Back to top <span aria-hidden="true">↑</span>
          </ScrollLink>
        </div>
      </div>
    </footer>
  );
}
