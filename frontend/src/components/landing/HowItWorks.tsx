import { motion } from "framer-motion";

const steps = [
  { title: "Sign Up", desc: "Create an account using secure AWS Cognito in seconds." },
  { title: "Upload or Ask", desc: "Drop PDFs, JSON, or text — or ask direct questions." },
  { title: "CoreX Thinks", desc: "Your agent analyzes, routes, and processes intelligently." },
  { title: "Get Insights", desc: "Instant summaries, data extraction, actions, and answers." },
];

export default function HowItWorks() {
  return (
    <section id="how" className="py-28 px-6 max-w-7xl mx-auto">
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-4xl font-bold text-center mb-16"
      >
        How It Works
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {steps.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            viewport={{ once: true }}
            className="relative group"
          >
            {/* Glow */}
            <div className="absolute inset-0 rounded-2xl bg-purple-500/20 blur-xl opacity-0 group-hover:opacity-40 transition duration-500"></div>

            {/* Card */}
            <div className="
              relative z-10 p-8 rounded-2xl 
              bg-white/5 backdrop-blur-xl border border-white/10
              shadow-[0_0_25px_-8px_rgba(0,0,0,0.6)]
              hover:shadow-[0_0_40px_-5px_rgba(124,58,237,0.5)]
              transition-all duration-300 text-center
            ">
              <div className="text-purple-400 text-3xl font-bold mb-3">{i + 1}</div>
              <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
              <p className="text-gray-400 text-sm">{s.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
