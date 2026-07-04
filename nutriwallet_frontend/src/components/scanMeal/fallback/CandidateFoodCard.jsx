
import { CheckCircle2, ChevronRight } from "lucide-react";

export default function CandidateFoodCard({ food, isSelected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 ${
        isSelected
          ? "border-emerald-500 bg-emerald-50 shadow-md dark:border-emerald-500/50 dark:bg-emerald-950/30"
          : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-800"
      }`}
    >
      <div className="flex items-center gap-4">
        {food.thumbnail ? (
          <img
            src={food.thumbnail}
            alt={food.name}
            className="h-14 w-14 rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
            <span className="text-xl font-bold uppercase">{food.name.charAt(0)}</span>
          </div>
        )}
        <div>
          <h4 className="font-bold text-slate-950 dark:text-white">
            {food.name}
          </h4>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Độ tin cậy: {Math.round(food.confidence)}%
          </p>
        </div>
      </div>
      
      {isSelected ? (
        <CheckCircle2 className="text-emerald-500" size={24} />
      ) : (
        <ChevronRight className="text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-slate-600" size={20} />
      )}
    </button>
  );
}
