
import CandidateFoodCard from "./CandidateFoodCard";
import { Search } from "lucide-react";

export default function CandidateFoodSelector({
  candidates,
  selectedFood,
  onSelectFood,
  onSelectNone,
}) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="text-center">
        <h3 className="text-lg font-bold text-slate-950 dark:text-white">
          Chúng tôi chưa chắc chắn về món ăn này
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Vui lòng giúp chúng tôi xác nhận đây là món gì:
        </p>
      </div>

      <div className="space-y-3">
        {candidates.map((food, idx) => (
          <CandidateFoodCard
            key={idx}
            food={food}
            isSelected={selectedFood?.name === food.name}
            onClick={() => onSelectFood(food)}
          />
        ))}
      </div>

      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        <span className="mx-4 flex-shrink-0 text-sm font-medium text-slate-400">
          hoặc
        </span>
        <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
      </div>

      <button
        type="button"
        onClick={onSelectNone}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 font-semibold text-slate-600 transition-colors hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400"
      >
        <Search size={18} />
        Không có món nào đúng
      </button>
    </div>
  );
}
