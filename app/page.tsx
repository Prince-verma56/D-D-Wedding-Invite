import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { StorySection } from "@/components/sections/StorySection";
import { CelebrationSection } from "@/components/sections/CelebrationSection";
import { GallerySection } from "@/components/sections/GallerySection";
import { VenueSection } from "@/components/sections/VenueSection";
import { InvitationSection } from "@/components/sections/InvitationSection";
import { WeddingExperience } from "@/components/wedding/WeddingExperience";
import { AnimationProvider } from "@/components/animations/AnimationProvider";

export default function Home() {
  return (
    <WeddingExperience>
      <AnimationProvider>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <Navbar />
        <main id="main-content">
          <HeroSection />
          <StorySection />
          <CelebrationSection />
          <GallerySection />
          <VenueSection />
          <InvitationSection />
        </main>
        <Footer />
      </AnimationProvider>
    </WeddingExperience>
  );
}
