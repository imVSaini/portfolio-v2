import type { ReactNode } from "react";

import { ArticleInline } from "@/components/article/ArticleInline";
import { CodeBlock } from "@/components/article/CodeBlock";
import { QuoteIcon } from "@/components/article/QuoteIcon";
import { SparkIcon } from "@/components/ui/SparkIcon";
import { getHeadingId } from "@/lib/article";
import { cn } from "@/lib/cn";
import {
  getCodeSample,
  getDiagram,
  getInlineText,
  isOneOf,
  type ArticleDiagram,
  type ArticleNode,
} from "@/lib/markdoc";

type DiagramProps<Name extends string> = Omit<ArticleDiagram, "name"> & { name: Name };

type BlockProps<Name extends string> = {
  node: ArticleNode;
  diagramNames: readonly Name[];
  Diagram: (props: DiagramProps<Name>) => ReactNode;
  decisions: ReactNode;
};

function Block<Name extends string>({ node, diagramNames, Diagram, decisions }: BlockProps<Name>) {
  switch (node.type) {
    case "heading":
      return (
        <h2 id={getHeadingId(getInlineText(node))} className="mt-6 scroll-mt-8 text-h4">
          <ArticleInline node={node} />
        </h2>
      );
    case "paragraph":
      return (
        <p>
          <ArticleInline node={node} />
        </p>
      );
    case "list":
      return (
        <ul className="flex flex-col gap-3">
          {node.children.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span aria-hidden="true" className="flex h-lh shrink-0 items-center text-accent">
                <SparkIcon className="size-[0.7em]" />
              </span>
              <span>
                <ArticleInline node={item} />
              </span>
            </li>
          ))}
        </ul>
      );
    case "blockquote":
      return (
        <blockquote className="my-2 flex flex-col gap-3 font-display text-h4 font-medium sm:flex-row sm:gap-5">
          <QuoteIcon aria-hidden="true" className="size-[1.4em] shrink-0 text-accent sm:-mt-0.5" />
          {node.children.map((paragraph, i) => (
            <p key={i}>
              <ArticleInline node={paragraph} />
            </p>
          ))}
        </blockquote>
      );
    case "fence": {
      const { language, code } = getCodeSample(node);
      return <CodeBlock language={language} code={code} />;
    }
    case "tag": {
      if (node.tag === "decisions") return decisions;
      const { name, caption, alt } = getDiagram(node);
      if (!isOneOf(diagramNames, name)) throw new Error(`Unknown diagram: ${name}`);
      return <Diagram name={name} caption={caption} alt={alt} />;
    }
    default:
      throw new Error(`Article bodies do not render \`${node.type}\` nodes.`);
  }
}

type ArticleBodyProps<Name extends string> = {
  ast: ArticleNode;
  diagramNames: readonly Name[];
  Diagram: (props: DiagramProps<Name>) => ReactNode;
  decisions?: ReactNode;
  className?: string;
};

export function ArticleBody<Name extends string>({
  ast,
  diagramNames,
  Diagram,
  decisions,
  className,
}: ArticleBodyProps<Name>) {
  return (
    <div data-article-body className={cn("flex min-w-0 flex-col gap-6 text-prose", className)}>
      {ast.children.map((node, i) => (
        <Block
          key={i}
          node={node}
          diagramNames={diagramNames}
          Diagram={Diagram}
          decisions={decisions}
        />
      ))}
    </div>
  );
}
