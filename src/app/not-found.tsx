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
        <div className="container-page grid flex-1 content-center gap-8 py-8 md:gap-12 xl:grid-cols-12 xl:items-center xl:gap-12">
          <div data-nf-numeral="" className="@container min-w-0 xl:col-span-7">
            <p
              aria-hidden="true"
              className="flex items-center font-display text-[min(46cqi,30svh)] leading-[0.8] font-semibold tracking-[-0.04em] select-none md:text-[min(46cqi,34svh)] lg:text-[min(46cqi,50svh)] xl:text-[min(46cqi,56svh)]"
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
          </div>

          <div
            data-nf-copy=""
            className="flex flex-col items-start gap-4 lg:grid lg:grid-cols-12 lg:gap-x-12 lg:gap-y-8 xl:col-span-5 xl:flex xl:gap-4"
          >
            <h1
              data-nf-fade=""
              className="text-[min(var(--text-h2),9svh)]/(--text-h2--line-height) tracking-(--text-h2--letter-spacing) uppercase lg:col-span-5 lg:row-span-2 lg:text-h3 lg:tracking-normal"
            >
              {notFound.heading}
            </h1>
            <p
              data-nf-fade=""
              className="max-w-xl text-p2 text-muted md:text-p1 lg:col-span-7 lg:col-start-6"
            >
              {notFound.description}
            </p>
            <div
              data-nf-fade=""
              className="mt-4 self-stretch sm:self-start lg:col-span-7 lg:col-start-6 lg:mt-0 xl:mt-4"
            >
              <Button href={notFound.cta.href} route className="w-full justify-center sm:w-auto">
                {notFound.cta.label}
              </Button>
            </div>
          </div>
        </div>
      </NotFoundMotion>
    </PageShell>
  );
}
