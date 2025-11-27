import { useState, useEffect } from "react";
import { signIn, getCurrentUser, signInWithRedirect } from "aws-amplify/auth"; // Import signInWithRedirect
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaGoogle } from "react-icons/fa"; // Install: npm install react-icons

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      try {
        await getCurrentUser();
        navigate("/chat");
      } catch {
        // Not logged in
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignIn = async () => {
    setError("");
    try {
      await signIn({ username: email, password });
      navigate("/chat");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to sign in");
    }
  };

  // --- HANDLER FOR GOOGLE SIGN IN ---
  const handleGoogleSignIn = async () => {
    try {
      // This redirects the browser to Google -> Cognito -> Your App
      await signInWithRedirect({ provider: "Google" });
    } catch (err: any) {
      console.error("Google Sign In Error:", err);
      setError(err.message);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden text-white">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover -z-10"
      >
        <source src="/auth-bg.mp4" type="video/mp4" />
      </video>

      <div className="fixed inset-0 bg-gradient-to-br from-black/85 via-black/60 to-purple-900/40 -z-5" />

      <div className="flex justify-center items-center h-full px-4">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="
            w-full max-w-md p-8 rounded-2xl
            bg-white/5 backdrop-blur-2xl border border-white/10
            shadow-[0_0_40px_-10px_rgba(0,0,0,0.8)]
          "
        >
          <h2 className="text-3xl mb-6 font-serif text-center">
            Sign in to <span className="text-sky-300">CoreX</span>
          </h2>

          <input
            type="email"
            className="w-full p-3 mb-4 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="w-full p-3 mb-4 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

          <button
            onClick={handleSignIn}
            className="w-full bg-purple-600 hover:bg-purple-500 transition-all py-3 rounded-lg font-medium"
          >
            Sign In
          </button>

          {/* --- DIVIDER --- */}
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="mx-3 text-gray-400 text-sm">OR</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* --- GOOGLE BUTTON --- */}
          <button
            onClick={handleGoogleSignIn}
            className="
              w-full flex items-center justify-center gap-3 
              bg-white text-black hover:bg-gray-100 
              transition-all py-3 rounded-lg font-medium
            "
          >
            <FaGoogle size={18} />
            <span>Sign in with Google</span>
          </button>

          <p className="text-xs text-center text-gray-400 mt-3">
            <a href="/forgot-password" className="text-purple-400 hover:underline">
              Forgot password?
            </a>
          </p>

          <p className="text-xs text-center text-gray-400 mt-4">
            Don't have an account?{" "}
            <a href="/signup" className="text-purple-400 hover:underline">
              Create one
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}