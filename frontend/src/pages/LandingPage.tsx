import LandingNavbar from "../components/landing/LandingNavbar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import HowItWorks from "../components/landing/HowItWorks";
import UseCases from "../components/landing/UseCases";
import Footer from "../components/landing/Footer";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // If this succeeds, the user is logged in
        await getCurrentUser();
        navigate("/chat");
      } catch (err) {
        // User is not logged in, stay on landing page
      }
    };

    // 1. Check immediately on mount
    checkAuth();

    // 2. Listen for auth events (Fixes Google Redirect Race Condition)
    const unsubscribe = Hub.listen("auth", ({ payload }) => {
      switch (payload.event) {
        case "signInWithRedirect":
        case "signedIn":
          checkAuth();
          break;
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* background video */}
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