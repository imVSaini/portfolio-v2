"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";

import { scrollToAnchor } from "@/lib/scrollToAnchor";

type ScrollLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: `#${string}` };

/** In-page anchor that glides through the smooth scroller instead of jumping. */
export function ScrollLink({ href, onClick, ...props }: ScrollLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    scrollToAnchor(href);
    history.replaceState(null, "", href === "#top" ? location.pathname : href);
  };

  return <a href={href} onClick={handleClick} {...props} />;
}
