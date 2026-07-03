import { motion } from "motion/react";

export default function FeatureCard({ icon, title, description }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
      className="rounded-[22px] border border-slate-200/80 bg-white/90 p-4 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.28)] backdrop-blur-xl"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(16,185,129,0.16),rgba(59,130,246,0.12))] text-2xl shadow-inner">
          {icon}
        </div>

        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold tracking-[-0.03em] text-slate-900">
            {title}
          </h3>
          <p className="mt-1.5 text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
