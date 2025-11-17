import { motion } from "framer-motion";

const cases = [
  { title: "Students", desc: "Notes, summaries, explanations, research, and PDF analysis." },
  { title: "Developers", desc: "JSON parsing, debugging, documentation, automation workflows." },
  { title: "Professionals", desc: "Emails, reports, document automation, insights extraction." },
];

export default function UseCases() {
  return (
    <section id="usecases" className="py-28 px-6 max-w-7xl mx-auto">
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-4xl font-bold text-center mb-16"
      >
        Who Uses CoreX?
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {cases.map((c, i) => (
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
              shadow-[0_0_30px_-10px_rgba(0,0,0,0.6)]
              hover:shadow-[0_0_40px_-5px_rgba(124,58,237,0.5)]
              transition-all duration-300
            ">
              <h3 className="text-xl font-semibold mb-3">{c.title}</h3>
              <p className="text-gray-400">{c.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
