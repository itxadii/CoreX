import { useState, useEffect } from "react";
import { signUp, confirmSignUp, resendSignUpCode, signInWithRedirect } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaGoogle } from "react-icons/fa";

export default function SignupPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");

  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [error, setError] = useState("");

  // Restore state on load
  useEffect(() => {
    const savedEmail = localStorage.getItem("pendingSignupEmail");
    const savedNeedsConfirm = localStorage.getItem("needsConfirmation");

    if (savedEmail) setEmail(savedEmail);
    if (savedNeedsConfirm === "true") setNeedsConfirmation(true);
  }, []);

  // --- GOOGLE HANDLER ---
  const handleGoogleSignIn = async () => {
    try {
      // This triggers the same flow as Login (User created automatically in Cognito)
      await signInWithRedirect({ provider: "Google" });
    } catch (err: any) {
      console.error("Google Sign Up Error:", err);
      setError(err.message);
    }
  };

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

      startConfirmationFlow();
      
    } catch (err: any) {
      if (err.name === "UsernameExistsException" || err.message.includes("exists")) {
        try {
          await resendSignUpCode({ username: email });
          startConfirmationFlow();
          alert("Account already exists. A new code has been sent to your email.");
        } catch (resendErr: any) {
          setError(resendErr.message);
        }
      } else {
        setError(err.message || "Signup failed");
      }
    }
  };

  const startConfirmationFlow = () => {
    localStorage.setItem("pendingSignupEmail", email);
    localStorage.setItem("needsConfirmation", "true");
    setNeedsConfirmation(true);
  };

  const handleConfirm = async () => {
    setError("");
    try {
      await confirmSignUp({
        username: email,
        confirmationCode: code,
      });

      localStorage.removeItem("pendingSignupEmail");
      localStorage.removeItem("needsConfirmation");

      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Confirmation failed");
    }
  };

  const handleResendCode = async () => {
    setError("");
    try {
      await resendSignUpCode({ username: email });
      alert(`Code resent to ${email}`);
    } catch (err: any) {
      setError(err.message || "Failed to resend code");
    }
  };

  const handleBackToSignup = () => {
    localStorage.removeItem("pendingSignupEmail");
    localStorage.removeItem("needsConfirmation");
    
    setNeedsConfirmation(false);
    setError("");
    setCode("");
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

      <div className="fixed inset-0 bg-gradient-to-br from-black/80 via-black/60 to-purple-900/40 -z-5"></div>

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

          {/* STEP 1 — SIGNUP FORM */}
          {!needsConfirmation && (
            <>
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
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <input
                type="password"
                className="w-full p-3 mb-4 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                onClick={handleSignup}
                className="w-full bg-purple-600 hover:bg-purple-500 py-3 rounded-lg font-medium transition-all"
              >
                Submit
              </button>

              {/* --- OR DIVIDER --- */}
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
                <span>Sign up with Google</span>
              </button>
            </>
          )}

          {/* STEP 2 — ENTER CONFIRMATION CODE */}
          {needsConfirmation && (
            <>
              <div className="text-sm text-center mb-4 text-gray-300">
                Code sent to <span className="text-purple-300">{email}</span>
              </div>

              <input
                className="w-full p-3 mb-4 bg-black/40 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter confirmation code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />

              <button
                onClick={handleConfirm}
                className="w-full bg-purple-600 hover:bg-purple-500 py-3 rounded-lg font-medium transition-all mb-3"
              >
                Confirm
              </button>

              <div className="flex justify-between mt-4 text-sm">
                <button
                  onClick={handleBackToSignup}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ← Change Email
                </button>
                
                <button
                  onClick={handleResendCode}
                  className="text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Resend Code
                </button>
              </div>
            </>
          )}

          {error && (
            <p className="text-red-400 text-sm mt-4 text-center">{error}</p>
          )}

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