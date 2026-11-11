import Link from "next/link";

import { PostAuthor } from "@/components/blog/PostAuthor";
import { PostCover } from "@/components/blog/PostCover";
import { PostMeta } from "@/components/blog/PostMeta";
import type { Post } from "@/data/posts";

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="group relative flex flex-col gap-5">
      <PostCover post={post} sizes="(min-width: 64rem) 30vw, (min-width: 40rem) 46vw, 100vw" />
      <PostMeta post={post} />
      <div className="flex flex-col gap-3">
        <h3 className="text-h4">
          <Link
            href={`/blog/${post.slug}`}
            className="rounded-md transition-colors duration-300 after:absolute after:inset-0 group-intent:text-accent"
          >
            {post.title}
          </Link>
        </h3>
        <p className="line-clamp-3 text-p2 text-muted">{post.excerpt}</p>
      </div>
      <div className="mt-auto pt-1">
        <PostAuthor post={post} />
      </div>
    </article>
  );
}
