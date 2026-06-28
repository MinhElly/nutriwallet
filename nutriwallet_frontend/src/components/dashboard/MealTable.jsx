import { Utensils } from "lucide-react";
import SectionCard from "./SectionCard";

export default function MealTable({ meals }) {
  const recentMeals = meals.slice(0, 3);

  return (
    <SectionCard title="Các bữa ăn gần đây" icon={Utensils}>
      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/80">
            <tr>
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Tên món
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Thời gian ăn
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Calo
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Đạm
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Tinh bột
              </th>
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Chất béo
              </th>
            </tr>
          </thead>

          <tbody>
            {recentMeals.map((meal) => (
              <tr
                key={`${meal.name}-${meal.time}`}
                className="border-t border-slate-200 transition-colors hover:bg-slate-50"
              >
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={meal.image}
                      alt={meal.name}
                      className="h-6 w-6 rounded-lg object-cover"
                    />
                    <span className="text-[13px] font-medium text-slate-900 sm:text-sm">
                      {meal.name}
                    </span>
                  </div>
                </td>

                <td className="whitespace-pre-line px-3 py-2 text-[13px] text-slate-500 sm:text-sm">
                  {meal.time}
                </td>
                <td className="px-3 py-2 text-[13px] font-medium text-slate-700 sm:text-sm">
                  {meal.calories}
                </td>
                <td className="px-3 py-2 text-[13px] font-medium text-slate-700 sm:text-sm">
                  {meal.protein}
                </td>
                <td className="px-3 py-2 text-[13px] font-medium text-slate-700 sm:text-sm">
                  {meal.carb}
                </td>
                <td className="px-3 py-2 text-[13px] font-medium text-slate-700 sm:text-sm">
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
