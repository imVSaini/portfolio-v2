import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { OverscrollReveal } from "@/components/layout/OverscrollReveal";
import { SmoothScroll } from "@/components/scroll/SmoothScroll";
import { Approach } from "@/components/sections/Approach";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Hero } from "@/components/sections/Hero";
import { Skills } from "@/components/sections/Skills";
import { Work } from "@/components/sections/Work";

export default function Home() {
  return (
    <>
      <Header />
      <OverscrollReveal>
        <main id="main">
          <Hero />
          <Approach />
          <Work />
          <Experience />
          <Skills />
          <Contact />
        </main>
        <Footer />
      </OverscrollReveal>
      {/* Last, so Locomotive starts only after the page it decorates (is-inview) has hydrated. */}
      <SmoothScroll />
    </>
  );
}
