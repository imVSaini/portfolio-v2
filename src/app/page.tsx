import type { Metadata } from "next";

import { PageShell } from "@/components/layout/PageShell";
import { Preloader } from "@/components/layout/Preloader";
import { Approach } from "@/components/sections/Approach";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Hero } from "@/components/sections/Hero";
import { Skills } from "@/components/sections/Skills";
import { Work } from "@/components/sections/Work";
import { JsonLd } from "@/components/seo/JsonLd";
import { feedAlternates } from "@/data/blog";
import { getHomeJsonLd } from "@/lib/jsonLd";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    types: { ...feedAlternates, "text/markdown": "/index.md" },
  },
};

export default function Home() {
  return (
    <>
      <JsonLd nodes={getHomeJsonLd()} />
      <Preloader />
      <PageShell>
        <main id="main">
          <Hero />
          <Approach />
          <Work />
          <Experience />
          <Skills />
          <Contact />
        </main>
      </PageShell>
    </>
  );
}
