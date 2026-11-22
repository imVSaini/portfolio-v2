import type { Metadata } from "next";

import { PageShell } from "@/components/layout/PageShell";
import { NotFoundMotion } from "@/components/notFound/NotFoundMotion";
import { Button } from "@/components/ui/Button";
import { Seal } from "@/components/ui/Seal";
import { notFound } from "@/data/notFound";

export const metadata: Metadata = { title: notFound.title };

const DIGIT_MASK = "inline-block [clip-path:inset(-0.2em_-0.2em_0_-0.2em)]";

export default function NotFound() {
  return (
    <PageShell>
      <NotFoundMotion
        id="main"
        className="relative flex min-h-svh flex-col overflow-hidden pt-(--header-h)"
      >
        <div className="container-page flex flex-1 flex-col items-center justify-center gap-6 py-6 text-center md:gap-10 lg:gap-12">
          <p
            aria-hidden="true"
            className="flex items-center justify-center font-display text-[min(38vw,30svh)] leading-[0.8] font-semibold tracking-[-0.04em] select-none md:text-[min(34vw,34svh)] lg:text-[min(28vw,44svh)]"
          >
            <span className={DIGIT_MASK}>
              <span data-nf-digit="" className="inline-block">
                4
              </span>
            </span>
            <span data-nf-seal="" className="mx-[0.03em] inline-block">
              <Seal
                items={notFound.seal}
                className="size-[0.76em]"
                discClassName="size-[34%] text-[0.16em] font-semibold"
              >
                ?
              </Seal>
            </span>
            <span className={DIGIT_MASK}>
              <span
                data-nf-digit=""
                className="inline-block text-stroke-faded-black dark:text-stroke-manila-light"
              >
                4
              </span>
            </span>
          </p>

          <div className="flex flex-col items-center gap-3">
            <h1 data-nf-fade="" className="text-h3 uppercase">
              {notFound.heading}
            </h1>
            <p data-nf-fade="" className="max-w-md text-p2 text-balance text-muted md:text-p1">
              {notFound.description}
            </p>
            <div data-nf-fade="" className="mt-3 md:mt-5">
              <Button href={notFound.cta.href} route>
                {notFound.cta.label}
              </Button>
            </div>
          </div>
        </div>
      </NotFoundMotion>
    </PageShell>
  );
}
