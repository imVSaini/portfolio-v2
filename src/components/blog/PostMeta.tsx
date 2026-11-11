import type { Post } from "@/data/posts";
import { formatPostDate } from "@/lib/posts";

export function PostMeta({ post }: { post: Post }) {
  return (
    <p className="flex flex-wrap items-center gap-3 text-p4 text-muted">
      <span className="rounded-full border border-line-strong px-3 py-1 font-display font-medium tracking-wide uppercase">
        {post.topic}
      </span>
      <time dateTime={post.date}>{formatPostDate(post.date)}</time>
      {post.updatedAt && post.updatedAt !== post.date && (
        <span>
          Updated <time dateTime={post.updatedAt}>{formatPostDate(post.updatedAt)}</time>
        </span>
      )}
    </p>
  );
}
