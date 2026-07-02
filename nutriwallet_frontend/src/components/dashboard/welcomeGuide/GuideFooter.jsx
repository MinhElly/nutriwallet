import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export default function GuideFooter({
  currentStep,
  totalSteps,
  secondaryActionLabel,
  primaryActionLabel,
  onSecondaryAction,
  onPrimaryAction,
}) {
  return (
    <div className="border-t border-slate-200/80 bg-white/80 px-5 py-4 backdrop-blur-xl sm:px-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }, (_, index) => (
            <span
              key={index}
              className={`rounded-full transition-all duration-300 ${
                index === currentStep
                  ? "h-1.5 w-7 bg-emerald-500"
                  : "h-1.5 w-3 bg-slate-200"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <button
            type="button"
            onClick={onSecondaryAction}
            className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900"
          >
            {secondaryActionLabel}
          </button>

          <motion.button
            type="button"
            onClick={onPrimaryAction}
            whileTap={{ scale: 0.98 }}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#22c55e,#10b981)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_30px_-18px_rgba(16,185,129,0.65)] transition-transform hover:-translate-y-0.5"
          >
            {primaryActionLabel}
            <ArrowRight size={15} strokeWidth={2.2} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
