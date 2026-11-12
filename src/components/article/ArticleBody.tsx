import type { ReactNode } from "react";

import { CodeBlock } from "@/components/article/CodeBlock";
import { QuoteIcon } from "@/components/article/QuoteIcon";
import { SparkIcon } from "@/components/ui/SparkIcon";
import type { DiagramBlock, TextBlock } from "@/data/article";
import { getHeadingId } from "@/lib/article";
import { cn } from "@/lib/cn";

function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split("`").map((part, i) =>
        i % 2 === 1 ? (
          <code
            key={i}
            className="rounded-md border border-line bg-surface px-1.5 py-0.5 font-mono text-[0.85em]"
          >
            {part}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}

type DiagramProps<Name extends string> = Omit<DiagramBlock<Name>, "type">;

type BlockProps<Name extends string> = {
  block: TextBlock | DiagramBlock<Name>;
  Diagram: (props: DiagramProps<Name>) => ReactNode;
};

function Block<Name extends string>({ block, Diagram }: BlockProps<Name>) {
  switch (block.type) {
    case "heading":
      return (
        <h2 id={getHeadingId(block.text)} className="mt-6 scroll-mt-8 text-h4">
          {block.text}
        </h2>
      );
    case "paragraph":
      return (
        <p>
          <Inline text={block.text} />
        </p>
      );
    case "list":
      return (
        <ul className="flex flex-col gap-3">
          {block.items.map((item) => (
            <li key={item} className="flex gap-3">
              <span aria-hidden="true" className="flex h-lh shrink-0 items-center text-accent">
                <SparkIcon className="size-[0.7em]" />
              </span>
              <span>
                <Inline text={item} />
              </span>
            </li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote className="my-2 flex flex-col gap-3 font-display text-h4 font-medium sm:flex-row sm:gap-5">
          <QuoteIcon aria-hidden="true" className="size-[1.4em] shrink-0 text-accent sm:-mt-0.5" />
          <p>{block.text}</p>
        </blockquote>
      );
    case "code":
      return <CodeBlock language={block.language} code={block.code} />;
    case "diagram":
      return <Diagram name={block.name} caption={block.caption} alt={block.alt} />;
  }
}

type ArticleBodyProps<Name extends string> = {
  blocks: (TextBlock | DiagramBlock<Name>)[];
  Diagram: (props: DiagramProps<Name>) => ReactNode;
  className?: string;
};

export function ArticleBody<Name extends string>({
  blocks,
  Diagram,
  className,
}: ArticleBodyProps<Name>) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-6 text-prose", className)}>
      {blocks.map((block, i) => (
        <Block key={i} block={block} Diagram={Diagram} />
      ))}
    </div>
  );
}
