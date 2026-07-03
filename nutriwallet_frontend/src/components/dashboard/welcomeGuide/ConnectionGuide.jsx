import { CheckCircle2, MessageCircle, Send, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

const guideIcons = [MessageCircle, Send, MessageCircle, ShieldCheck, CheckCircle2];

function TimelineStep({ index, label, isLast }) {
  const Icon = guideIcons[index] ?? CheckCircle2;

  return (
    <div className="flex gap-4">
      <div className="flex w-8 flex-col items-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white shadow-[0_14px_24px_-14px_rgba(16,185,129,0.85)]">
          {index + 1}
        </div>
        {!isLast ? <div className="mt-2 h-full min-h-8 w-px bg-emerald-100" /> : null}
      </div>

      <div className="flex-1 pb-4">
        <div className="rounded-[22px] border border-slate-200/80 bg-white/92 px-4 py-3 shadow-[0_18px_32px_-32px_rgba(15,23,42,0.3)]">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(16,185,129,0.14),rgba(59,130,246,0.1))] text-emerald-600">
              <Icon size={18} strokeWidth={2.1} />
            </div>
            <p className="pt-1 text-sm font-medium leading-6 text-slate-700">
              {label}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConnectionIllustration() {
  return (
    <div className="relative mx-auto flex h-[310px] w-full max-w-[360px] items-center justify-center">
      <div className="absolute inset-x-12 bottom-10 top-16 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.14),transparent_72%)] blur-3xl" />

      <motion.div
        animate={{ y: [-6, 8, -6] }}
        transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
        className="relative w-full max-w-[310px] rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_24px_70px_-34px_rgba(15,23,42,0.36)]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(16,185,129,0.14),rgba(59,130,246,0.1))] text-emerald-600">
            <ShieldCheck size={20} strokeWidth={2.1} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Kết nối Messenger</p>
            <p className="text-xs text-slate-500">Lấy mã và xác nhận liên kết</p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
            Nhắn tin cho Chatbot
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
            Nhập mã xác thực
          </div>
          <div className="rounded-2xl bg-[linear-gradient(135deg,#22c55e,#10b981)] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_30px_-18px_rgba(16,185,129,0.7)]">
            Xác nhận liên kết
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ConnectionGuide({
  guideSteps,
  highlightedActionLabel,
  note,
  onGoToSettings,
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
      <ConnectionIllustration />

      <div className="space-y-5">
        <div className="rounded-[26px] border border-slate-200/80 bg-white/82 p-5 shadow-[0_22px_48px_-34px_rgba(15,23,42,0.3)] backdrop-blur-xl">
          {guideSteps.map((step, index) => (
            <TimelineStep
              key={step}
              index={index}
              label={step}
              isLast={index === guideSteps.length - 1}
            />
          ))}
        </div>

        <div className="space-y-3">
          <motion.button
            type="button"
            onClick={onGoToSettings}
            whileTap={{ scale: 0.98 }}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#22c55e,#10b981)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_30px_-18px_rgba(16,185,129,0.65)] transition-transform hover:-translate-y-0.5 sm:w-auto"
          >
            <CheckCircle2 size={16} strokeWidth={2} />
            {highlightedActionLabel}
          </motion.button>

          <p className="text-sm leading-6 text-slate-500">
            {note}
          </p>
        </div>
      </div>
    </div>
  );
}
