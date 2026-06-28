import { Utensils } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import StatCard from "./StatCard";

export default function MealSummaryCard({
  mealSummary,
  mealTrend,
}) {
  return (
    <StatCard title="Tổng số bữa ăn" icon={Utensils}>
      <div className="mt-3">
        <p className="text-[1.45rem] font-bold tracking-tight text-slate-900 sm:text-[2.1rem] dark:text-white">
          {mealSummary.totalMeals}
        </p>
        <p className="mt-0.5 text-[13px] text-slate-500 sm:text-sm dark:text-slate-400">
          {mealSummary.helperText}
        </p>

        <p className="mt-3 text-[13px] text-slate-500 sm:mt-4 sm:text-sm dark:text-slate-400">
          Tổng calo
        </p>
        <p className="mt-0.5 text-[13px] font-semibold text-slate-900 sm:text-[15px] dark:text-slate-200">
          {mealSummary.totalCalories}
        </p>

        <div className="mt-2.5 h-7 sm:mt-3 sm:h-8">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mealTrend}>
              <Line
                type="natural"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                strokeLinecap="round"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </StatCard>
  );
}
