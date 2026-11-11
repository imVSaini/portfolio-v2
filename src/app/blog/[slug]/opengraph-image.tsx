import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";

import { wordmark } from "@/components/ui/wordmark";
import { posts } from "@/data/posts";
import { site } from "@/data/site";
import { getAssetUrl } from "@/lib/asset";
import { formatPostDate } from "@/lib/posts";

const size = { width: 1200, height: 630 };
const contentType = "image/png";

/** Satori can't paint CSS variables, so the palette is spelled out once here. */
const PALETTE = {
  paper: "#f3e7d2",
  ink: "#1e1d1d",
  muted: "rgba(30, 29, 29, 0.62)",
  line: "#ccc3ab",
  bands: ["#ffca18", "#ffa81b", "#ff6200", "#eb3132", "#cc3566"],
} as const;

/** The brand mark's bands inside its 200-unit square, top to bottom. */
const MARK_BANDS = [
  { y: 100, height: 36 },
  { y: 136, height: 24 },
  { y: 160, height: 18 },
  { y: 178, height: 13 },
  { y: 191, height: 9 },
] as const;

const monogram = wordmark.letters.flatMap((letter) => ("mono" in letter ? [letter.mono] : []));

function findPost(slug: string) {
  return posts.find((post) => post.slug === slug);
}

function titleSize(title: string) {
  if (title.length <= 50) return 76;
  if (title.length <= 75) return 66;
  return 58;
}

async function loadFont(file: string) {
  "use cache";
  const data = await readFile(join(process.cwd(), "src/app/fonts", file));
  return new Uint8Array(data).buffer;
}

export function generateImageMetadata({ params }: { params: { slug: string } }) {
  const post = findPost(params.slug);
  return [{ id: "card", alt: post?.title ?? site.name, size, contentType }];
}

function BrandMark() {
  return (
    <div
      style={{
        display: "flex",
        overflow: "hidden",
        border: `2px solid ${PALETTE.line}`,
        borderRadius: 16,
      }}
    >
      <svg width="56" height="56" viewBox="0 0 200 200">
        <rect width="200" height="200" fill={PALETTE.paper} />
        {MARK_BANDS.map(({ y, height }, i) => (
          <rect key={y} y={y} width="200" height={height} fill={PALETTE.bands[i]} />
        ))}
        <g transform="translate(33.1 58.5) scale(2.6)" fill={PALETTE.ink}>
          {monogram.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <rect y="116.5" width="200" height="2.5" fill={PALETTE.bands[0]} />
        <rect y="123.5" width="200" height="3" fill={PALETTE.bands[0]} />
      </svg>
    </div>
  );
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) notFound();

  if (post.cover) {
    return new ImageResponse(
      <img src={getAssetUrl(post.cover)} alt="" width={size.width} height={size.height} />,
      size,
    );
  }

  const [display, sans] = await Promise.all([
    loadFont("clash-display-600.ttf"),
    loadFont("satoshi-500.ttf"),
  ]);

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: PALETTE.paper,
        color: PALETTE.ink,
        fontFamily: "Satoshi",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flexGrow: 1,
          padding: "64px 72px 56px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <BrandMark />
            <span style={{ fontFamily: "Clash Display", fontSize: 28, letterSpacing: 1 }}>
              {site.name.toUpperCase()}
            </span>
          </div>
          <span
            style={{
              border: `2px solid ${PALETTE.line}`,
              borderRadius: 999,
              padding: "8px 22px",
              fontFamily: "Clash Display",
              fontSize: 20,
              letterSpacing: 2,
              color: PALETTE.muted,
            }}
          >
            {post.topic.toUpperCase()}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            columnGap: "0.26em",
            fontFamily: "Clash Display",
            fontSize: titleSize(post.title),
            lineHeight: 1.06,
            letterSpacing: -1.5,
            maxWidth: 1020,
          }}
        >
          {post.title.split(" ").map((word, i) => (
            <span key={i} style={{ whiteSpace: "nowrap" }}>
              {word}
            </span>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 26,
            color: PALETTE.muted,
          }}
        >
          <span>
            {formatPostDate(post.date)} · {post.readMinutes} min read
          </span>
          <span
            style={{
              fontFamily: "Clash Display",
              fontSize: 22,
              letterSpacing: 2,
              color: PALETTE.ink,
            }}
          >
            {`${new URL(site.url).host.replace(/^www\./, "")}/blog`.toUpperCase()}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        {[10, 7, 5, 4, 3].map((height, i) => (
          <div key={height} style={{ display: "flex", height, background: PALETTE.bands[i] }} />
        ))}
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Clash Display", data: display, weight: 600, style: "normal" },
        { name: "Satoshi", data: sans, weight: 500, style: "normal" },
      ],
    },
  );
}
