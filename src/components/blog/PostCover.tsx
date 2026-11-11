import Image from "next/image";

import { PostArt } from "@/components/blog/PostArt";
import type { Post } from "@/data/posts";
import type { ProjectTint } from "@/data/projects";
import { getAssetUrl } from "@/lib/asset";
import { cn } from "@/lib/cn";

const tints: Record<ProjectTint, string> = {
  orange: "bg-orange text-manila-light",
  gold: "bg-gold text-faded-black",
  magenta: "bg-magenta text-manila-light",
  red: "bg-red text-manila-light",
  soot: "bg-soot text-manila-light",
};

const zoom =
  "transition-transform duration-700 ease-out-expo motion-reduce:transition-none group-intent:scale-105";

type PostCoverProps = {
  post: Post;
  sizes: string;
  eager?: boolean;
  className?: string;
};

export function PostCover({ post, sizes, eager = false, className }: PostCoverProps) {
  return (
    <div
      className={cn(
        "relative aspect-video overflow-hidden rounded-2xl corner-squircle",
        tints[post.tint],
        className,
      )}
    >
      {post.cover ? (
        <Image
          src={getAssetUrl(post.cover)}
          alt=""
          fill
          sizes={sizes}
          {...(eager && { loading: "eager", fetchPriority: "high" })}
          className={cn("object-cover", zoom)}
        />
      ) : (
        <PostArt name={post.art} className={cn("absolute inset-0", zoom)} />
      )}
    </div>
  );
}
