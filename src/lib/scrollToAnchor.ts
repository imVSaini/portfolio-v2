import { useScroll } from "@/stores/scroll";

/**
 * Scrolls to an in-page anchor and moves keyboard focus there, as native fragment navigation
 * would. `#top` goes to the start of the document, so the next Tab reaches the skip link.
 *
 * @param href - In-page anchor to travel to.
 *
 * @example
 * ```ts
 * scrollToAnchor("#work");
 * ```
 */
export function scrollToAnchor(href: `#${string}`): void {
  const toTop = href === "#top";
  useScroll.getState().scrollTo(toTop ? 0 : href);

  const target = toTop ? document.body : document.getElementById(href.slice(1));
  if (!target) return;
  if (!target.hasAttribute("tabindex")) {
    target.setAttribute("tabindex", "-1");
    target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
  }
  target.focus({ preventScroll: true });
}
