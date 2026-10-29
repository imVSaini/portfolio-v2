"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";

import { useScroll } from "@/stores/scroll";

type ScrollLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: `#${string}` };

/** In-page anchor that glides through the smooth scroller instead of jumping. */
export function ScrollLink({ href, onClick, ...props }: ScrollLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    useScroll.getState().scrollTo(href === "#top" ? 0 : href);
    history.replaceState(null, "", href === "#top" ? location.pathname : href);
  };

  return <a href={href} onClick={handleClick} {...props} />;
}
