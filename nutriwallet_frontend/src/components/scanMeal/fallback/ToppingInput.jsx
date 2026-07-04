
import { MessageSquarePlus } from "lucide-react";

export default function ToppingInput({ value, onChange }) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="text-center">
        <h3 className="text-lg font-bold text-slate-950 dark:text-white">
          Ghi chú thêm (Tùy chọn)
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Thêm topping hoặc yêu cầu đặc biệt của món ăn.
        </p>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute top-4 left-4 text-slate-400">
          <MessageSquarePlus size={20} />
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ví dụ: Thêm trứng ốp la, ít cơm, không đường..."
          className="min-h-[120px] w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 pl-12 font-semibold text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:border-emerald-500"
        />
      </div>
      
      <div className="flex flex-wrap gap-2">
        {["Ít đường", "Không đá", "Nhiều rau", "Thêm trứng"].map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => {
              const newValue = value ? `${value}, ${suggestion}` : suggestion;
              onChange(newValue);
            }}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400"
          >
            + {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
