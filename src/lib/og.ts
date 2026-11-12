import { readFile } from "node:fs/promises";
import { join } from "node:path";

/** Pixel size of every generated link-preview card. */
export const OG_SIZE = { width: 1200, height: 630 } as const;

export const OG_CONTENT_TYPE = "image/png";

type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 500 | 600;
  style: "normal";
};

async function loadFont(file: string) {
  "use cache";
  const data = await readFile(join(process.cwd(), "src/app/fonts", file));
  return new Uint8Array(data).buffer;
}

/**
 * Loads the display and body fonts a generated link-preview card is set in.
 *
 * @returns The fonts in the shape `ImageResponse` takes.
 * @example
 * ```tsx
 * new ImageResponse(<OgCard {...card} />, { ...OG_SIZE, fonts: await getOgFonts() });
 * ```
 */
export async function getOgFonts(): Promise<OgFont[]> {
  const [display, sans] = await Promise.all([
    loadFont("clash-display-600.ttf"),
    loadFont("satoshi-500.ttf"),
  ]);

  return [
    { name: "Clash Display", data: display, weight: 600, style: "normal" },
    { name: "Satoshi", data: sans, weight: 500, style: "normal" },
  ];
}
