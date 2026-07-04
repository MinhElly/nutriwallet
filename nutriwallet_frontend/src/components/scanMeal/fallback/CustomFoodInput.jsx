import { useEffect, useRef } from "react";
import { Utensils } from "lucide-react";

export default function CustomFoodInput({ value, onChange }) {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="text-center">
        <h3 className="text-lg font-bold text-slate-950 dark:text-white">
          Đây là món gì?
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Nhập tên món ăn để chúng tôi ghi nhận chính xác hơn.
        </p>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
          <Utensils size={20} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ví dụ: Phở bò, Cơm tấm sườn bì..."
          className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 font-semibold text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-emerald-500"
        />
      </div>
    </div>
  );
}
