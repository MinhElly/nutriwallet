import React from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ConfirmationFooter({
  onBack,
  onConfirm,
  isConfirming = false,
  disableConfirm = false,
  confirmText = "Lưu bữa ăn",
}) {
  return (
    <div className="mt-8 flex gap-3">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex h-14 w-1/3 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white font-semibold text-slate-700 transition-colors hover:bg-slate-50 active:scale-[0.98] dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">Quay lại</span>
        </button>
      )}

      <button
        type="button"
        onClick={onConfirm}
        disabled={disableConfirm || isConfirming}
        className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/30 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
      >
        {isConfirming ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <CheckCircle2 size={20} />
        )}
        {isConfirming ? "Đang xử lý..." : confirmText}
      </button>
    </div>
  );
}
