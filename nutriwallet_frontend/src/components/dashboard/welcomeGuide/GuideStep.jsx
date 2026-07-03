const stepIcons = ["💬", "📩", "⌨️", "✅", "✨"];

export default function GuideStep({ index, label, isLast }) {
  return (
    <div className="flex gap-4">
      <div className="flex w-8 flex-col items-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white shadow-[0_12px_24px_-14px_rgba(16,185,129,0.8)]">
          {index + 1}
        </div>
        {!isLast ? <div className="mt-2 h-full min-h-8 w-px bg-emerald-100" /> : null}
      </div>

      <div className="flex-1 pb-4">
        <div className="rounded-[22px] border border-slate-200/80 bg-white/92 px-4 py-3 shadow-[0_18px_32px_-32px_rgba(15,23,42,0.3)]">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(16,185,129,0.14),rgba(59,130,246,0.1))] text-lg">
              {stepIcons[index] ?? "•"}
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
