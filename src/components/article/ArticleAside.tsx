"use client";

import { Collapsible } from "@base-ui/react/collapsible";

import { ArticleShare } from "@/components/article/ArticleShare";
import { ArticleToc } from "@/components/article/ArticleToc";
import { cn } from "@/lib/cn";

type ArticleAsideProps = {
  headings: string[];
  share: { url: string; title: string };
};

export function ArticleAside({ headings, share }: ArticleAsideProps) {
  const hasContents = headings.length > 0;

  return (
    <>
      <Collapsible.Root className="border-y border-line lg:hidden">
        <Collapsible.Trigger className="group flex min-h-12 w-full cursor-pointer items-center justify-between gap-4 text-left font-display text-p4 font-medium tracking-wide text-muted uppercase transition-colors duration-300 data-panel-open:text-faded-black dark:data-panel-open:text-manila-light intent:text-faded-black dark:intent:text-manila-light">
          {hasContents ? "On this page" : "Share"}
          <span
            aria-hidden="true"
            className="grid size-11 shrink-0 place-items-center text-muted transition-colors duration-300 group-data-panel-open:text-accent group-intent:text-accent"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              className="size-5"
            >
              <path d="M1 10h18" />
              <path
                data-toggle-bar
                d="M10 1v18"
                className="origin-center transition-[scale] duration-500 ease-out-expo group-data-panel-open:scale-y-0 motion-reduce:transition-none"
              />
            </svg>
          </span>
        </Collapsible.Trigger>
        <Collapsible.Panel className="h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-500 ease-out-expo motion-reduce:transition-none starting-style:h-0 ending-style:h-0">
          <div className="flex flex-col gap-8 pt-2 pb-8">
            {hasContents && <ArticleToc headings={headings} showLabel={false} />}
            <ArticleShare
              url={share.url}
              title={share.title}
              className={cn("flex-col items-start", hasContents && "border-t border-line pt-8")}
            />
          </div>
        </Collapsible.Panel>
      </Collapsible.Root>

      <div className="hidden flex-col gap-10 lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:flex">
        {hasContents && <ArticleToc headings={headings} />}
        <ArticleShare
          url={share.url}
          title={share.title}
          className="flex-col items-start border-t border-line pt-8"
        />
      </div>
    </>
  );
}
