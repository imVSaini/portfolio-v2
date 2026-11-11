import type { ReactNode } from "react";

import { AuthorAvatar } from "@/components/blog/AuthorAvatar";
import { CalendarIcon, ClockIcon } from "@/components/blog/PostIcons";
import type { Post } from "@/data/posts";
import { site } from "@/data/site";
import { formatPostDate } from "@/lib/posts";

type PostAuthorProps = {
  post: Post;
  showDate?: boolean;
};

function Detail({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted">
      {icon}
      {children}
    </span>
  );
}

export function PostAuthor({ post, showDate = false }: PostAuthorProps) {
  const updated = post.updatedAt && post.updatedAt !== post.date ? post.updatedAt : null;
  const icon = "size-3.5 shrink-0";

  return (
    <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-p3">
      <span className="inline-flex items-center gap-3">
        <AuthorAvatar />
        <span className="font-medium">{site.name}</span>
      </span>
      {showDate && (
        <Detail icon={<CalendarIcon aria-hidden="true" className={icon} />}>
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          {updated && (
            <span>
              , updated <time dateTime={updated}>{formatPostDate(updated)}</time>
            </span>
          )}
        </Detail>
      )}
      <Detail icon={<ClockIcon aria-hidden="true" className={icon} />}>
        {post.readMinutes} min read
      </Detail>
    </p>
  );
}
