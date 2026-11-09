import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["h1", "h2", "h3", "h4", "p1", "p2", "p3", "p4"] }],
    },
  },
});

/**
 * Joins class names and resolves Tailwind conflicts, aware of the custom `text-h*` and `text-p*`
 * sizes.
 *
 * @param inputs - Class names, arrays or `{ class: condition }` objects, as accepted by `clsx`.
 * @returns One class string in which later conflicting utilities win.
 *
 * @example
 * ```ts
 * cn("text-p2 text-muted", isActive && "text-accent");
 * // => "text-p2 text-accent" when active
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
