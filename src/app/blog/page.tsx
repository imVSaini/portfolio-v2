import type { Metadata } from "next";
import Link from "next/link";

import { PostAuthor } from "@/components/blog/PostAuthor";
import { PostCard } from "@/components/blog/PostCard";
import { PostCover } from "@/components/blog/PostCover";
import { PostMeta } from "@/components/blog/PostMeta";
import { PageShell } from "@/components/layout/PageShell";
import { RevealText } from "@/components/motion/RevealText";
import { JsonLd } from "@/components/seo/JsonLd";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { blog, feedAlternates } from "@/data/blog";
import { posts, type Post } from "@/data/posts";
import { site } from "@/data/site";
import { getBlogJsonLd } from "@/lib/jsonLd";

const { title, description } = blog;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/blog", types: feedAlternates },
  openGraph: {
    type: "website",
    url: "/blog",
    title: `${title} — ${site.name}`,
    description,
    siteName: site.name,
    locale: "en_IN",
    images: [site.ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} — ${site.name}`,
    description,
    images: [site.ogImage],
  },
};

function FeaturedPost({ post }: { post: Post }) {
  return (
    <article className="group relative grid gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="relative lg:col-span-7">
        <PostCover
          post={post}
          sizes="(min-width: 64rem) 58vw, 100vw"
          eager
          className="lg:absolute lg:inset-0 lg:aspect-auto"
        />
        <div aria-hidden="true" className="hidden aspect-video lg:block" />
      </div>
      <div className="flex flex-col gap-5 lg:col-span-5 lg:self-center">
        <PostMeta post={post} />
        <h3 className="text-h3 lg:text-[clamp(1.5rem,2.6vw,2.5rem)]">
          <Link
            href={`/blog/${post.slug}`}
            className="rounded-md transition-colors duration-300 after:absolute after:inset-0 group-intent:text-accent"
          >
            {post.title}
          </Link>
        </h3>
        <p className="line-clamp-3 text-p1 text-muted">{post.excerpt}</p>
        <PostAuthor post={post} />
      </div>
    </article>
  );
}

export default function BlogPage() {
  const [featured, ...rest] = posts;

  return (
    <>
      <JsonLd nodes={getBlogJsonLd(posts)} />
      <PageShell>
        <main
          id="main"
          className="container-page flex flex-col gap-16 pt-34 pb-16 md:gap-24 md:pt-42 md:pb-40"
        >
          <div className="flex flex-col gap-6">
            <SectionLabel>Blog</SectionLabel>
            <RevealText as="h1" on="load" className="text-h2 uppercase">
              Notes from{" "}
              <span className="text-stroke-faded-black dark:text-stroke-manila-light">
                production.
              </span>
            </RevealText>
            <p className="max-w-2xl text-p1 text-muted">
              What I learn building and running SaaS products: architecture decisions, performance
              work and the frontend details that make them feel finished.
            </p>
          </div>

          {featured ? (
            <section aria-labelledby="latest-posts" className="flex flex-col gap-10 md:gap-14">
              <h2 id="latest-posts" className="sr-only">
                Latest posts
              </h2>

              <FeaturedPost post={featured} />

              {rest.length > 0 && (
                <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post) => (
                    <li key={post.slug} className="flex">
                      <PostCard post={post} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : (
            <p className="border-t border-line pt-8 text-p1 text-muted">
              Nothing published yet. The first post is on its way.
            </p>
          )}
        </main>
      </PageShell>
    </>
  );
}
