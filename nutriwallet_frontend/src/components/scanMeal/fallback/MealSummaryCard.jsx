
import { Utensils, Scale, MessageSquarePlus, AlertTriangle } from "lucide-react";

export default function MealSummaryCard({
  foodName,
  servingSize,
  customServingSize,
  toppings,
  warnings,
}) {
  const getServingLabel = () => {
    if (servingSize === "small") return "Cỡ nhỏ (Ít)";
    if (servingSize === "medium") return "Vừa (Tiêu chuẩn)";
    if (servingSize === "large") return "Cỡ lớn (Nhiều)";
    if (servingSize === "custom" && customServingSize) return `${customServingSize}g`;
    return "Không xác định";
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="text-center">
        <h3 className="text-lg font-bold text-slate-950 dark:text-white">
          Xác nhận bữa ăn
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Kiểm tra lại thông tin trước khi lưu.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            <Utensils size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">
              Món ăn
            </p>
            <p className="text-lg font-bold text-slate-950 dark:text-white">
              {foodName || "Chưa xác định"}
            </p>
          </div>
        </div>

        <hr className="my-4 border-slate-100 dark:border-slate-800" />

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Scale className="mt-0.5 text-slate-400 shrink-0" size={18} />
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Khẩu phần
              </p>
              <p className="font-semibold text-slate-900 dark:text-slate-200">
                {getServingLabel()}
              </p>
            </div>
          </div>

          {toppings && (
            <div className="flex items-start gap-3">
              <MessageSquarePlus className="mt-0.5 text-slate-400 shrink-0" size={18} />
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Ghi chú thêm
                </p>
                <p className="font-semibold text-slate-900 dark:text-slate-200">
                  {toppings}
                </p>
              </div>
            </div>
          )}

          {warnings && warnings.length > 0 && (
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 text-rose-500 shrink-0" size={18} />
              <div>
                <p className="text-xs font-semibold text-rose-500">
                  Lưu ý sức khỏe
                </p>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  {warnings.map((w, idx) => (
                    <li key={idx} className="text-sm font-medium text-rose-700 dark:text-rose-400">
                      {w.title}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
