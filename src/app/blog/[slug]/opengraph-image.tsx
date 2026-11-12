import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";

import { OgCard } from "@/components/seo/OgCard";
import { posts } from "@/data/posts";
import { site } from "@/data/site";
import { getAssetUrl } from "@/lib/asset";
import { getOgFonts, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";
import { formatPostDate } from "@/lib/posts";

function findPost(slug: string) {
  return posts.find((post) => post.slug === slug);
}

export function generateImageMetadata({ params }: { params: { slug: string } }) {
  const post = findPost(params.slug);
  return [
    { id: "card", alt: post?.title ?? site.name, size: OG_SIZE, contentType: OG_CONTENT_TYPE },
  ];
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) notFound();

  if (post.cover) {
    return new ImageResponse(
      <img src={getAssetUrl(post.cover)} alt="" width={OG_SIZE.width} height={OG_SIZE.height} />,
      OG_SIZE,
    );
  }

  return new ImageResponse(
    <OgCard
      label={post.topic}
      title={post.title}
      meta={`${formatPostDate(post.date)} · ${post.readMinutes} min read`}
      path="/blog"
    />,
    { ...OG_SIZE, fonts: await getOgFonts() },
  );
}
