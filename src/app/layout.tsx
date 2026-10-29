import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { site } from "@/data/site";
import { appearanceScript, THEME_COLORS } from "@/lib/appearance";

import "./globals.css";

const clash = localFont({
  variable: "--font-clash",
  display: "swap",
  src: [
    { path: "./fonts/clash-display-400.woff2", weight: "400" },
    { path: "./fonts/clash-display-500.woff2", weight: "500" },
    { path: "./fonts/clash-display-600.woff2", weight: "600" },
    { path: "./fonts/clash-display-700.woff2", weight: "700" },
  ],
});

const satoshi = localFont({
  variable: "--font-satoshi",
  display: "swap",
  src: [
    { path: "./fonts/satoshi-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/satoshi-400-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/satoshi-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/satoshi-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/satoshi-900.woff2", weight: "900", style: "normal" },
  ],
});

const title = `${site.name} — ${site.role}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: `%s — ${site.name}` },
  description: site.description,
  authors: [{ name: site.name, url: site.url }],
  keywords: [
    "Vaibhav Kumar Saini",
    "Full-Stack Engineer",
    "Lead Software Engineer",
    "FastAPI",
    "Next.js",
    "Bengaluru",
  ],
  openGraph: {
    type: "website",
    url: site.url,
    title,
    description: site.description,
    siteName: site.name,
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image", title, description: site.description },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: THEME_COLORS.light,
  colorScheme: "light dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-accent="orange"
      data-tone="soft"
      className={`${clash.variable} ${satoshi.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: appearanceScript }} />
      </head>
      <body className="min-w-80">
        <a
          href="#main"
          className="fixed top-3 left-3 z-50 -translate-y-24 rounded-md bg-accent px-4 py-2 font-display text-p3 text-faded-black transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
