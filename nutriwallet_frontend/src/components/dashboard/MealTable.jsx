import { Utensils } from "lucide-react";
import SectionCard from "./SectionCard";

export default function MealTable({ meals }) {
  const recentMeals = meals.slice(0, 3);

  return (
    <SectionCard title="Các bữa ăn gần đây" icon={Utensils}>
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/80 dark:bg-slate-800/50">
            <tr>
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Tên món
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Thời gian ăn
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Calo
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Đạm
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Tinh bột
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Chất béo
              </th>
            </tr>
          </thead>

          <tbody>
            {recentMeals.map((meal) => (
              <tr
                key={`${meal.name}-${meal.time}`}
                className="border-t border-slate-200 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
              >
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={meal.image}
                      alt={meal.name}
                      className="h-6 w-6 rounded-lg object-cover"
                    />
                    <span className="text-[13px] font-medium text-slate-900 sm:text-sm dark:text-slate-200">
                      {meal.name}
                    </span>
                  </div>
                </td>

                <td className="whitespace-pre-line px-3 py-2 text-[13px] text-slate-500 sm:text-sm dark:text-slate-400">
                  {meal.time}
                </td>
                <td className="px-3 py-2 text-[13px] font-medium text-slate-700 sm:text-sm dark:text-slate-300">
                  {meal.calories}
                </td>
                <td className="px-3 py-2 text-[13px] font-medium text-slate-700 sm:text-sm dark:text-slate-300">
                  {meal.protein}
                </td>
                <td className="px-3 py-2 text-[13px] font-medium text-slate-700 sm:text-sm dark:text-slate-300">
                  {meal.carb}
                </td>
                <td className="px-3 py-2 text-[13px] font-medium text-slate-700 sm:text-sm dark:text-slate-300">
                  {meal.fat}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
