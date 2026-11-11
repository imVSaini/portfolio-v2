import type { SVGProps } from "react";

import { AuthorAvatar } from "@/components/blog/AuthorAvatar";
import { socialIcons } from "@/components/ui/SocialIcons";
import { contact } from "@/data/contact";
import { site } from "@/data/site";

const button =
  "grid size-10 place-items-center rounded-full border border-line-strong transition-colors duration-300 intent:border-accent intent:bg-accent intent:text-faded-black";

function MailIcon(props: SVGProps<SVGSVGElement>) {
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
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  );
}

export function PostAuthorCard() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-6 border-t border-line pt-8">
      <div className="flex items-center gap-4">
        <AuthorAvatar className="size-12" />
        <div className="flex flex-col">
          <p className="font-display text-p2 font-medium">{site.name}</p>
          <p className="text-p3 text-muted">{site.role}</p>
        </div>
      </div>

      <ul className="flex gap-2">
        <li>
          <a href={`mailto:${contact.email}`} aria-label={`Email ${site.name}`} className={button}>
            <MailIcon aria-hidden="true" className="size-4" />
          </a>
        </li>
        {contact.links.map(({ label, href }) => {
          const Icon = socialIcons[label];
          return (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${site.name} on ${label} (opens in a new tab)`}
                className={button}
              >
                <Icon aria-hidden="true" className="size-4" />
              </a>
            </li>
          );
        })}
      </ul>
    </footer>
  );
}
