import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative z-20 pt-36 pb-24 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">

      {/* LEFT */}
      <div className="max-w-xl">
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-bold leading-tight"
        >
          The Smarter,
          <br />
          <span className="text-purple-400">AI-Powered</span>
          <br />
          Workspace Agent
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-gray-300 text-lg mt-6"
        >
          Automate workflows, analyze files, and boost your productivity
          with an intelligent agent built to automate worlflows using natural language processing.
          </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-10 flex gap-4"
        >
          <a
            href="/signup"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium transition"
          >
            Early Access
          </a>

          <a
            href="/login"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg transition"
          >
            Sign In
          </a>
        </motion.div>
      </div>

      {/* RIGHT */}
      {/* <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="mt-16 md:mt-0 w-full md:w-[45%]"
      >
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
          <p className="text-gray-300">
            <span className="text-purple-400">CoreX:</span> “Here’s an example insight…”
          </p>
          <div className="mt-4 h-48 bg-black/20 rounded-xl flex items-center justify-center text-gray-500">
            AI Output Preview
          </div>
        </div>
      </motion.div> */}

    </section>
  );
}
