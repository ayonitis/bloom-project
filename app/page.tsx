import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GardenHero } from "@/components/scene/GardenHero";
import {
  FeaturesSection,
  AboutSection,
  RoadmapSection,
  CommunitySection,
} from "@/components/scene/ScrollGarden";
import { FinalCta } from "@/components/scene/FinalCta";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="relative">
        <GardenHero />
        <FeaturesSection />
        <AboutSection />
        <RoadmapSection />
        <CommunitySection />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
