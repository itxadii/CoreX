import { useState, useEffect } from "react";
import { signIn, getCurrentUser } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // ✅ correct place for useEffect
  useEffect(() => {
    const checkUser = async () => {
      try {
        await getCurrentUser();  // if user is logged in
        navigate("/chat");       // redirect
      } catch {
        // user not logged in → stay on login page
      }
    };

    checkUser();
  }, [navigate]); // good practice to include navigate

  const handleSignIn = async () => {
    setError("");

    try {
      const res = await signIn({
        username: email,
        password,
      });

      console.log("Signed in:", res);
      navigate("/chat");

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to sign in");
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden text-white">

      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover -z-10"
      >
        <source src="/auth-bg.mp4" type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-black/85 via-black/60 to-purple-900/40 -z-5" />

      {/* Centered Card */}
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
            className="
              w-full p-3 mb-4 bg-black/40 border border-white/10 
              rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500
            "
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="
              w-full p-3 mb-4 bg-black/40 border border-white/10
              rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500
            "
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

          <button
            onClick={handleSignIn}
            className="
              w-full bg-purple-600 hover:bg-purple-500 
              transition-all py-3 rounded-lg font-medium
            "
          >
            Sign In
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
