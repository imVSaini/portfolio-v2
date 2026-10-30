export const THEMES = ["system", "light", "dark"] as const;
export const ACCENTS = ["gold", "orange", "red", "magenta"] as const;
export const TONES = ["soft", "deep"] as const;

export type Theme = (typeof THEMES)[number];
export type Accent = (typeof ACCENTS)[number];
export type Tone = (typeof TONES)[number];

export const STORAGE_KEYS = {
  theme: "vks-theme",
  accent: "vks-accent",
  tone: "vks-tone",
} as const;

export const DEFAULTS = { theme: "system", accent: "gold", tone: "deep" } as const satisfies {
  theme: Theme;
  accent: Accent;
  tone: Tone;
};

/** `<meta name="theme-color">` per resolved surface — the browser chrome follows the page. */
export const THEME_COLORS = { light: "#ebe4c1", soft: "#1e1d1d", deep: "#151414" } as const;

const DARK_QUERY = "(prefers-color-scheme: dark)";

export function prefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia(DARK_QUERY).matches;
}

export function subscribePrefersDark(onChange: () => void): () => void {
  const mql = window.matchMedia(DARK_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

export function resolveDark(theme: Theme): boolean {
  return theme === "dark" || (theme === "system" && prefersDark());
}

export function applyAppearance({
  theme,
  accent,
  tone,
}: {
  theme: Theme;
  accent: Accent;
  tone: Tone;
}): void {
  const root = document.documentElement;
  const dark = resolveDark(theme);
  root.classList.toggle("dark", dark);
  root.dataset.accent = accent;
  root.dataset.tone = tone;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", dark ? THEME_COLORS[tone] : THEME_COLORS.light);
}

/**
 * Runs in <head> before first paint so the stored appearance never flashes.
 * Mirrors `applyAppearance` and keeps following the OS while theme is "system".
 * Also flags `motion-ok` so reveal targets start hidden only when JS motion will run.
 */
export const appearanceScript = `(function(){
var K=${JSON.stringify(STORAGE_KEYS)},D=${JSON.stringify(DEFAULTS)},C=${JSON.stringify(THEME_COLORS)};
var V={theme:${JSON.stringify(THEMES)},accent:${JSON.stringify(ACCENTS)},tone:${JSON.stringify(TONES)}};
function get(k){try{var v=localStorage.getItem(K[k]);return V[k].indexOf(v)>-1?v:D[k]}catch(e){return D[k]}}
var mq=window.matchMedia("${DARK_QUERY}");
function apply(){var r=document.documentElement,t=get("theme"),o=get("tone"),d=t==="dark"||(t==="system"&&mq.matches);
r.classList.toggle("dark",d);r.dataset.accent=get("accent");r.dataset.tone=o;
var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",d?C[o]:C.light)}
apply();mq.addEventListener("change",apply);
var r=document.documentElement;
if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches){r.classList.add("motion-ok");
setTimeout(function(){if(!r.hasAttribute("data-motion-ready"))r.classList.remove("motion-ok")},4000)}
})();`;
