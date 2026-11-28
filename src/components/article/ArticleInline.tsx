import { getInlineText, getStringAttribute, type ArticleNode } from "@/lib/markdoc";

const LINK =
  "underline decoration-line-strong underline-offset-4 transition-colors duration-300 intent:text-accent intent:decoration-accent";

function Part({ node }: { node: ArticleNode }) {
  switch (node.type) {
    case "text":
      return getStringAttribute(node, "content");
    case "softbreak":
      return " ";
    case "code":
      return (
        <code className="rounded-md border border-line bg-surface px-1.5 py-0.5 font-mono text-[0.85em]">
          {getStringAttribute(node, "content")}
        </code>
      );
    case "strong":
      return (
        <strong className="font-semibold">
          <ArticleInline node={node} />
        </strong>
      );
    case "em":
      return (
        <em>
          <ArticleInline node={node} />
        </em>
      );
    case "link": {
      const href = getStringAttribute(node, "href");
      if (!/^https?:\/\//.test(href)) {
        return (
          <a href={href} className={LINK}>
            <ArticleInline node={node} />
          </a>
        );
      }
      return (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={`${getInlineText(node).replaceAll("`", "")} (opens in a new tab)`}
          className={LINK}
        >
          <ArticleInline node={node} />
        </a>
      );
    }
    default:
      return <ArticleInline node={node} />;
  }
}

type ArticleInlineProps = {
  node: ArticleNode;
};

export function ArticleInline({ node }: ArticleInlineProps) {
  return node.children.map((child, i) => <Part key={i} node={child} />);
}
