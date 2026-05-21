import { Nav } from "@/components/Nav";
import { Hero } from "@/components/hero/Hero";
import { StatsBar } from "@/components/stats/StatsBar";
import { FeatureGrid } from "@/components/features/FeatureGrid";
import { SpecialtiesSection } from "@/components/three/SpecialtiesSection";
import { HowItWorks } from "@/components/process/HowItWorks";
import { FoundersGrid } from "@/components/team/FoundersGrid";
import { Testimonials } from "@/components/testimonials/Testimonials";
import { FinalCTA } from "@/components/cta/FinalCTA";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <StatsBar />
        <FeatureGrid />
        <SpecialtiesSection />
        <HowItWorks />
        <FoundersGrid />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
