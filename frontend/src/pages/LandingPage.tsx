import LandingNavbar from "../components/landing/LandingNavbar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import HowItWorks from "../components/landing/HowItWorks";
import UseCases from "../components/landing/UseCases";
import Footer from "../components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* background video (put file in public/hero-bg.mp4) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover"
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>


      {/* subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-purple-900/20" />

      {/* page content */}
      <div className="relative z-20">
        <LandingNavbar />
        <main>
          <Hero />
          <Features />
          <HowItWorks />
          <UseCases />
        </main>
        <Footer />
      </div>
    </div>
  );
}
