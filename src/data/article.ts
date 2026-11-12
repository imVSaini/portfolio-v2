/** Paragraph and list text may wrap inline code in backticks. */
export type TextBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "code"; language: string; code: string };

export type DiagramBlock<Name extends string> = {
  type: "diagram";
  name: Name;
  caption: string;
  alt: string;
};

export function h2(text: string): TextBlock {
  return { type: "heading", text };
}

export function p(text: string): TextBlock {
  return { type: "paragraph", text };
}

export function ul(...items: string[]): TextBlock {
  return { type: "list", items };
}

export function quote(text: string): TextBlock {
  return { type: "quote", text };
}

export function code(language: string, source: string): TextBlock {
  return { type: "code", language, code: source.trim() };
}
