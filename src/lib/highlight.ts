import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";

export type CodeToken = {
  content: string;
  light?: string;
  dark?: string;
  italic: boolean;
};

const THEMES = { light: "light-plus", dark: "dark-plus" } as const;

const highlighter = createHighlighterCore({
  themes: [import("shiki/themes/light-plus.mjs"), import("shiki/themes/dark-plus.mjs")],
  langs: [
    import("shiki/langs/markdown.mjs"),
    import("shiki/langs/python.mjs"),
    import("shiki/langs/sql.mjs"),
    import("shiki/langs/ts.mjs"),
    import("shiki/langs/tsx.mjs"),
    import("shiki/langs/yaml.mjs"),
  ],
  engine: createOnigurumaEngine(import("shiki/wasm")),
});

/**
 * Splits code into coloured tokens, line by line, with VS Code's Light+ and Dark+ colours.
 *
 * @param code - The sample, without a trailing newline.
 * @param language - A language the highlighter loads (`markdown`, `python`, `sql`, `ts`, `tsx`, `yaml`).
 * @returns One array of tokens per line.
 *
 * @example
 * ```ts
 * const lines = await highlightCode(code, "python");
 * ```
 */
export async function highlightCode(code: string, language: string): Promise<CodeToken[][]> {
  "use cache";

  const shiki = await highlighter;
  if (!shiki.getLoadedLanguages().includes(language)) {
    throw new Error(
      `Code samples in \`${language}\` need the language added in src/lib/highlight.ts.`,
    );
  }
  const plain = {
    light: shiki.getTheme(THEMES.light).fg.toLowerCase(),
    dark: shiki.getTheme(THEMES.dark).fg.toLowerCase(),
  };
  const { tokens } = shiki.codeToTokens(code, {
    lang: language,
    themes: THEMES,
    defaultColor: false,
    includeExplanation: "scopeName",
  });

  return tokens.map((line) =>
    line.map((token) => {
      const light = token.htmlStyle?.["--shiki-light"]?.toLowerCase();
      const dark = token.htmlStyle?.["--shiki-dark"]?.toLowerCase();
      const coloured = light !== plain.light || dark !== plain.dark;
      return {
        content: token.content,
        ...(coloured && light && { light }),
        ...(coloured && dark && { dark }),
        italic: Boolean(
          token.explanation?.some(({ scopes }) =>
            scopes.some(({ scopeName }) => scopeName.startsWith("comment")),
          ),
        ),
      };
    }),
  );
}
