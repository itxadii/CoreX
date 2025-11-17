import { useState } from "react";
import { signUp, confirmSignUp } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function SignupPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");

  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: { email },
        },
      });

      setNeedsConfirmation(true);
    } catch (err: any) {
      setError(err.message || "Signup failed");
    }
  };

  const handleConfirm = async () => {
    setError("");

    try {
      await confirmSignUp({
        username: email,
        confirmationCode: code,
      });

      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Confirmation failed");
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
      <div className="fixed inset-0 bg-gradient-to-br from-black/80 via-black/60 to-purple-900/40 -z-5"></div>

      {/* Auth Card */}
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
            Create Account
          </h2>

          {!needsConfirmation ? (
            <>
              {/* Email */}
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

              {/* Password */}
              <input
                type="password"
                className="
                  w-full p-3 mb-4 bg-black/40 border border-white/10 
                  rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500
                "
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {/* Confirm Password */}
              <input
                type="password"
                className="
                  w-full p-3 mb-4 bg-black/40 border border-white/10 
                  rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500
                "
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              {/* Submit */}
              <button
                onClick={handleSignup}
                className="
                  w-full bg-purple-600 hover:bg-purple-500 
                  py-3 rounded-lg font-medium transition-all
                "
              >
                Submit
              </button>
            </>
          ) : (
            <>
              {/* Confirmation Code */}
              <input
                className="
                  w-full p-3 mb-4 bg-black/40 border border-white/10 
                  rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500
                "
                placeholder="Enter confirmation code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />

              {/* Confirm Button */}
              <button
                onClick={handleConfirm}
                className="
                  w-full bg-purple-600 hover:bg-purple-500 
                  py-3 rounded-lg font-medium transition-all
                "
              >
                Confirm
              </button>
            </>
          )}

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm mt-4">{error}</p>
          )}

          {/* Link to Login */}
          <p className="text-xs text-center text-gray-400 mt-4">
            Already have an account?{" "}
            <a href="/login" className="text-purple-400 hover:underline">
              Sign In
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
