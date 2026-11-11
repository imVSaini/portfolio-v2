import type { SVGProps } from "react";

import { CopyButton } from "@/components/ui/CopyButton";
import { LinkedInIcon, XIcon } from "@/components/ui/SocialIcons";
import { cn } from "@/lib/cn";

const button =
  "grid size-10 place-items-center rounded-full border border-line-strong transition-colors duration-300 intent:border-accent intent:bg-accent intent:text-faded-black";

function LinkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

type PostShareProps = {
  url: string;
  title: string;
  label?: string;
  className?: string;
};

export function PostShare({ url, title, label = "Share", className }: PostShareProps) {
  const target = encodeURIComponent(url);
  const networks = [
    {
      name: "LinkedIn",
      Icon: LinkedInIcon,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${target}`,
    },
    {
      name: "X",
      Icon: XIcon,
      href: `https://x.com/intent/tweet?url=${target}&text=${encodeURIComponent(title)}`,
    },
  ];

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <p className="font-display text-p4 font-medium tracking-wide text-muted uppercase">{label}</p>
      <ul className="flex gap-2">
        <li>
          <CopyButton
            text={url}
            label="Copy link"
            idle={<LinkIcon aria-hidden="true" className="size-4" />}
            done={<CheckIcon aria-hidden="true" className="size-4" />}
            className={button}
          />
        </li>
        {networks.map(({ name, Icon, href }) => (
          <li key={name}>
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={`Share on ${name} (opens in a new tab)`}
              className={button}
            >
              <Icon aria-hidden="true" className="size-4" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
