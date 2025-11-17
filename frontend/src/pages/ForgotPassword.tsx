import { useState } from "react";
import { resetPassword, confirmResetPassword } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const sendCode = async () => {
    setError("");

    try {
      await resetPassword({ username: email });
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to send reset code");
    }
  };

  const confirm = async () => {
    setError("");

    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword,
      });

      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
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
      <div className="fixed inset-0 bg-gradient-to-br from-black/80 via-black/60 to-purple-900/40 -z-5" />

      {/* Card Container */}
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
          {step === 1 && (
            <>
              <h2 className="text-3xl mb-6 font-semibold text-center">
                Reset Password
              </h2>

              {/* Email */}
              <input
                className="
                  w-full p-3 mb-4 bg-black/40 border border-white/10 
                  rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500
                "
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {/* Submit */}
              <button
                onClick={sendCode}
                className="
                  w-full py-3 bg-purple-600 hover:bg-purple-500 
                  rounded-lg font-medium transition-all
                "
              >
                Send Code
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-3xl mb-6 font-semibold text-center">
                Enter Confirmation Code
              </h2>

              {/* Code */}
              <input
                className="
                  w-full p-3 mb-4 bg-black/40 border border-white/10 
                  rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500
                "
                placeholder="Confirmation Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />

              {/* New Password */}
              <input
                type="password"
                className="
                  w-full p-3 mb-4 bg-black/40 border border-white/10 
                  rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500
                "
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <button
                onClick={confirm}
                className="
                  w-full py-3 bg-purple-600 hover:bg-purple-500 
                  rounded-lg font-medium transition-all
                "
              >
                Confirm Reset
              </button>
            </>
          )}

          {/* Error Message */}
          {error && (
            <p className="text-red-400 text-sm mt-4">{error}</p>
          )}

          {/* Back to login */}
          <p className="text-xs text-center text-gray-400 mt-4">
            Remember your password?{" "}
            <a href="/login" className="text-purple-400 hover:underline">
              Sign In
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
