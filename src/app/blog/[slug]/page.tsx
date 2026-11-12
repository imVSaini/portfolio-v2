import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleBody } from "@/components/article/ArticleBody";
import { ArticleShare } from "@/components/article/ArticleShare";
import { ArticleToc } from "@/components/article/ArticleToc";
import { PostAuthor } from "@/components/blog/PostAuthor";
import { PostAuthorCard } from "@/components/blog/PostAuthorCard";
import { PostBreadcrumbs } from "@/components/blog/PostBreadcrumbs";
import { PostCard } from "@/components/blog/PostCard";
import { PostCover } from "@/components/blog/PostCover";
import { PostDiagram } from "@/components/blog/PostDiagram";
import { PageShell } from "@/components/layout/PageShell";
import { RevealText } from "@/components/motion/RevealText";
import { RollText } from "@/components/motion/RollText";
import { JsonLd } from "@/components/seo/JsonLd";
import { feedAlternates } from "@/data/blog";
import { posts, type Post } from "@/data/posts";
import { site } from "@/data/site";
import { getPostJsonLd } from "@/lib/jsonLd";
import { getPostMarkdownPath } from "@/lib/llms";

/** Unlisted slugs wait for the full render, so a missing post returns a real 404 status. */
export const ensureStatic = "navigation";
export const instant = false;

/** How many other posts are suggested under an article. */
const RELATED_COUNT = 3;

function findPost(slug: string) {
  return posts.find((post) => post.slug === slug);
}

function relatedPosts(current: Post) {
  const others = posts.filter((post) => post.slug !== current.slug);
  return [
    ...others.filter((post) => post.topic === current.topic),
    ...others.filter((post) => post.topic !== current.topic),
  ].slice(0, RELATED_COUNT);
}

export function generateStaticParams() {
  return posts.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) return {};

  const url = `/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: url,
      types: { ...feedAlternates, "text/markdown": getPostMarkdownPath(post) },
    },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.excerpt,
      siteName: site.name,
      locale: "en_IN",
      publishedTime: post.date,
      ...(post.updatedAt && { modifiedTime: post.updatedAt }),
      authors: [site.name],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) notFound();

  return (
    <PageShell>
      <main id="main" className="container-page pt-28 pb-16 md:pt-34 md:pb-40">
        <div className="mx-auto flex max-w-7xl flex-col gap-20 md:gap-28">
          <PostContent post={post} />
        </div>
      </main>
    </PageShell>
  );
}

function PostContent({ post }: { post: Post }) {
  const url = `${site.url}/blog/${post.slug}`;
  const headings = post.body.flatMap((block) => (block.type === "heading" ? [block.text] : []));
  const related = relatedPosts(post);

  return (
    <>
      <JsonLd nodes={getPostJsonLd(post)} />
      <article className="flex flex-col gap-10 md:gap-14">
        <header className="flex max-w-5xl flex-col gap-6">
          <PostBreadcrumbs post={post} />
          <RevealText as="h1" on="load" className="text-h3">
            {post.title}
          </RevealText>
          <PostAuthor post={post} showDate />
        </header>

        <PostCover
          post={post}
          sizes="(min-width: 90rem) 80rem, 92vw"
          eager
          className="md:aspect-21/9"
        />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <aside className="lg:order-2 lg:col-span-3 lg:col-start-10">
            <div className="flex flex-col gap-10 lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
              {headings.length > 0 && <ArticleToc headings={headings} />}
              <ArticleShare
                url={url}
                title={post.title}
                className="flex-col items-start border-t border-line pt-8"
              />
            </div>
          </aside>
          <div className="flex max-w-prose flex-col gap-12 text-prose lg:col-span-8">
            <ArticleBody blocks={post.body} Diagram={PostDiagram} />

            <PostAuthorCard />
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="more-posts" className="flex flex-col gap-10">
          <div className="flex items-baseline justify-between gap-6 border-t border-line pt-8">
            <h2 id="more-posts" className="text-h4 uppercase">
              Keep reading
            </h2>
            <Link
              href="/blog"
              className="group inline-flex min-h-6 items-center font-display text-p4 font-medium tracking-wide uppercase"
            >
              <RollText text="All posts" />
            </Link>
          </div>
          <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug} className="flex">
                <PostCard post={item} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
