import { AlertTriangle, RefreshCw, ImagePlus } from "lucide-react";

export default function NotFoodErrorCard({ onReset }) {
  return (
    <section className="mx-auto w-full max-w-lg rounded-3xl border border-rose-200 bg-white p-6 shadow-sm dark:border-rose-900/50 dark:bg-slate-900 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-500 dark:bg-rose-500/20">
        <AlertTriangle size={32} />
      </div>
      
      <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-100">
        Ảnh này không giống món ăn
      </h3>
      
      <p className="mb-8 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        Vui lòng tải lên ảnh món ăn rõ hơn để hệ thống có thể phân tích dinh dưỡng chính xác nhất nhé.
      </p>
      
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          onClick={onReset}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white transition hover:bg-emerald-600 active:scale-95"
        >
          <ImagePlus size={18} />
          Đổi ảnh
        </button>
        
        <button
          onClick={onReset}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 active:scale-95"
        >
          <RefreshCw size={18} />
          Thử lại
        </button>
      </div>
    </section>
  );
}
