import type { ReactNode } from "react";

import { CopyButton } from "@/components/ui/CopyButton";

/** Groups, in order: comment, string (with any prefix), decorator, JSX tag, word, number. */
const TOKEN =
  /(#.*$|--.*$|\/\/.*$)|((?:\b[fbru]{1,2})?(?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`))|(@\w+)|(<\/?[A-Za-z][\w.]*|\/?>)|([A-Za-z_]\w*)|(\b\d+(?:\.\d+)?\b)/g;

const CONTROL = new Set([
  "as",
  "await",
  "break",
  "catch",
  "continue",
  "else",
  "except",
  "export",
  "finally",
  "for",
  "from",
  "if",
  "import",
  "in",
  "raise",
  "return",
  "throw",
  "try",
  "while",
  "with",
  "yield",
]);

const KEYWORDS = new Set([
  "async",
  "class",
  "const",
  "def",
  "False",
  "false",
  "function",
  "lambda",
  "let",
  "new",
  "None",
  "null",
  "self",
  "this",
  "True",
  "true",
  "undefined",
  "var",
]);

const PYTHON_TYPES = new Set([
  "bool",
  "bytes",
  "dict",
  "float",
  "int",
  "list",
  "set",
  "str",
  "tuple",
]);

const SQL_TYPES = new Set(["bigserial", "int", "jsonb", "text", "timestamptz", "uuid"]);

const COLORS = {
  comment: "text-code-comment italic",
  string: "text-code-string",
  keyword: "text-code-keyword",
  control: "text-code-control",
  number: "text-code-number",
  function: "text-code-function",
  type: "text-code-type",
  variable: "text-code-variable",
  punctuation: "text-code-punctuation",
} as const;

type Color = keyof typeof COLORS;

function classifyWord(word: string, before: string, after: string, language: string): Color | null {
  if (language === "yaml") {
    if (/^[\w-]*:(\s|$)/.test(after)) return "keyword";
    return word === "true" || word === "false" ? "number" : null;
  }
  if (language === "sql") {
    if (/^[A-Z]+$/.test(word) || SQL_TYPES.has(word)) return "keyword";
    return after.startsWith("(") ? "function" : null;
  }
  if (CONTROL.has(word)) return "control";
  if (KEYWORDS.has(word)) return "keyword";
  const declared = /\b(class|def|function)\s+$/.exec(before)?.[1];
  if (declared) return declared === "class" ? "type" : "function";
  if (after.startsWith("(")) return "function";
  if (PYTHON_TYPES.has(word) || /^[A-Z]/.test(word)) return "type";
  return "variable";
}

function highlight(line: string, language: string) {
  const parts: ReactNode[] = [];
  let cursor = 0;

  for (const match of line.matchAll(TOKEN)) {
    const [text, comment, string, decorator, tag, word, number] = match;
    const before = line.slice(0, match.index);
    const after = line.slice(match.index + text.length);
    let color: Color | null = null;

    if (comment && language === "yaml" && !comment.startsWith("#")) continue;
    if (comment) color = "comment";
    else if (string) color = "string";
    else if (decorator) color = "function";
    else if (number) color = "number";
    else if (tag) {
      if (language !== "tsx" || before.endsWith("=")) continue;
      const [, bracket = "", name = ""] = /^(<\/?|\/?>)(.*)$/.exec(tag) ?? [];
      const nameColor = /^[A-Z]/.test(name) ? COLORS.type : COLORS.keyword;
      if (match.index > cursor) parts.push(line.slice(cursor, match.index));
      parts.push(
        <span key={match.index}>
          <span className={COLORS.punctuation}>{bracket}</span>
          {name && <span className={nameColor}>{name}</span>}
        </span>,
      );
      cursor = match.index + text.length;
      continue;
    } else if (word) {
      color = classifyWord(word, before, after, language);
    }

    if (!color) continue;
    if (match.index > cursor) parts.push(line.slice(cursor, match.index));
    parts.push(
      <span key={match.index} className={COLORS[color]}>
        {text}
      </span>,
    );
    cursor = match.index + text.length;
  }
  if (cursor < line.length) parts.push(line.slice(cursor));

  return parts;
}

type CodeBlockProps = {
  language: string;
  code: string;
};

export function CodeBlock({ language, code }: CodeBlockProps) {
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
          {code.split("\n").map((line, i) => (
            <span key={i} className="grid grid-cols-[2.75rem_1fr] gap-4 pr-5">
              <span aria-hidden="true" className="text-right text-code-gutter select-none">
                {i + 1}
              </span>
              <span>{line ? highlight(line, language) : " "}</span>
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}
