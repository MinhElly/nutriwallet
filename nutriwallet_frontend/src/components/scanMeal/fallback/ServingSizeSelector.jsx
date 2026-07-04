import React from "react";
import { Scale } from "lucide-react";

const SIZES = [
  { id: "small", label: "Ít", description: "Cỡ nhỏ, ăn nhẹ" },
  { id: "medium", label: "Vừa", description: "Khẩu phần tiêu chuẩn" },
  { id: "large", label: "Nhiều", description: "Cỡ lớn, ăn no" },
];

export default function ServingSizeSelector({ value, customValue, onChange, onCustomChange }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="text-center">
        <h3 className="text-lg font-bold text-slate-950 dark:text-white">
          Khẩu phần ăn của bạn?
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Ước lượng khẩu phần giúp tính toán calo chính xác hơn.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {SIZES.map((size) => {
          const isSelected = value === size.id;
          return (
            <button
              key={size.id}
              type="button"
              onClick={() => onChange(size.id)}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-3 text-center transition-all duration-200 hover:-translate-y-0.5 ${
                isSelected
                  ? "border-emerald-500 bg-emerald-50 shadow-md dark:border-emerald-500/50 dark:bg-emerald-950/30"
                  : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-800"
              }`}
            >
              <span className={`text-sm font-bold ${isSelected ? "text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-200"}`}>
                {size.label}
              </span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
                {size.description}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        <span className="mx-4 flex-shrink-0 text-sm font-medium text-slate-400">
          hoặc nhập số gam cụ thể
        </span>
        <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
          <Scale size={20} />
        </div>
        <input
          type="number"
          min="0"
          value={customValue || ""}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder="Nhập số gam (vd: 200)"
          className={`h-14 w-full rounded-2xl border bg-white pl-12 pr-12 font-semibold text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:bg-slate-900 dark:text-white dark:focus:border-emerald-500 ${
            value === "custom" 
              ? "border-emerald-500 dark:border-emerald-500/50" 
              : "border-slate-200 dark:border-slate-800"
          }`}
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 font-medium">
          g
        </div>
      </div>
    </div>
  );
}
