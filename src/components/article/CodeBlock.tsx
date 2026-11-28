import type { CSSProperties } from "react";

import { CopyButton } from "@/components/ui/CopyButton";
import { cn } from "@/lib/cn";
import { highlightCode, type CodeToken } from "@/lib/highlight";

type TokenStyle = CSSProperties & Partial<Record<"--shiki-light" | "--shiki-dark", string>>;

function Token({ token }: { token: CodeToken }) {
  if (!token.light && !token.italic) return token.content;
  const style: TokenStyle = {
    ...(token.light && { "--shiki-light": token.light }),
    ...(token.dark && { "--shiki-dark": token.dark }),
  };
  return (
    <span className={cn(token.light && "code-token", token.italic && "italic")} style={style}>
      {token.content}
    </span>
  );
}

type CodeBlockProps = {
  language: string;
  code: string;
};

export async function CodeBlock({ language, code }: CodeBlockProps) {
  const lines = await highlightCode(code, language);

  return (
    <figure className="my-2 overflow-hidden rounded-2xl border border-code-line bg-code-bg text-code-text corner-squircle">
      <figcaption className="flex items-center gap-4 border-b border-code-line bg-code-bar py-1.5 pr-2 pl-5 font-display text-p4 font-medium tracking-wide text-code-dim uppercase">
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-red" />
          <span className="size-2.5 rounded-full bg-gold" />
          <span className="size-2.5 rounded-full bg-code-line" />
        </span>
        {language}
        <CopyButton
          text={code}
          className="ml-auto rounded-md px-3 py-1.5 tracking-wide uppercase transition-colors duration-300 intent:bg-code-line intent:text-code-text"
        />
      </figcaption>
      <pre
        tabIndex={0}
        aria-label={`${language} code sample`}
        className="overflow-x-auto py-5 font-mono text-p3/relaxed"
      >
        <code className="grid min-w-max">
          {lines.map((tokens, i) => (
            <span key={i} className="grid grid-cols-[2.75rem_1fr] gap-4 pr-5">
              <span aria-hidden="true" className="text-right text-code-gutter select-none">
                {i + 1}
              </span>
              <span>
                {tokens.some((token) => token.content)
                  ? tokens.map((token, j) => <Token key={j} token={token} />)
                  : " "}
              </span>
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}
