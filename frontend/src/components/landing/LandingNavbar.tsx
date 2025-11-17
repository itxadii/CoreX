import { useEffect, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import corexLogo from "../../assets/corex.png";

export default function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Hide navbar on scroll down, show on scroll up
  useEffect(() => {
    let lastScroll = 0;

    const handleScroll = () => {
      const current = window.scrollY;

      if (current > lastScroll && current > 80) {
        setHidden(true); // scrolling down
      } else {
        setHidden(false); // scrolling up
      }

      lastScroll = current;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* NAVBAR */}
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: hidden ? -100 : 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full fixed top-0 left-0 z-50 backdrop-blur-xl bg-black/20 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src={corexLogo}
              className="w-24 h-11 rounded-xl object-cover"
              alt="CoreX Logo"
            />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a
              href="#features"
              className="text-gray-300 hover:text-white transition"
            >
              Features
            </a>
            <a
              href="#usecases"
              className="text-gray-300 hover:text-white transition"
            >
              Use Cases
            </a>
            <a href="/login" className="text-gray-300 hover:text-white transition">
              Login
            </a>

            <a
              href="/signup"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium transition"
            >
              Get Started
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white text-2xl"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </motion.nav>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Dark overlay behind menu */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Slide-down mobile menu */}
            <motion.div
              initial={{ y: -250, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -250, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="md:hidden fixed top-0 left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/10 z-50 py-6 px-6"
            >
              <div className="flex flex-col gap-6 pt-10 text-lg">

                <a
                  href="#features"
                  className="text-gray-300 hover:text-white transition"
                  onClick={() => setMobileOpen(false)}
                >
                  Features
                </a>

                <a
                  href="#usecases"
                  className="text-gray-300 hover:text-white transition"
                  onClick={() => setMobileOpen(false)}
                >
                  Use Cases
                </a>

                <a
                  href="/login"
                  className="text-gray-300 hover:text-white transition"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </a>

                <a
                  href="/signup"
                  className="px-4 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg text-center font-medium transition"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started
                </a>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
