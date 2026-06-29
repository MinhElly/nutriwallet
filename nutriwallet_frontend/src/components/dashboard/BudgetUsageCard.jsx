import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "../../hooks/useTheme";

export default function BudgetUsageCard({
  budgetSummary,
  budgetUsage,
}) {
  const { theme } = useTheme();

  return (
    <div className="group h-full rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 xl:p-5 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-[14px] font-semibold text-slate-900 sm:text-[15px] dark:text-slate-100">
        Mức sử dụng ngân sách
      </h3>

      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-[90px_1fr] sm:items-center">
        <div className="relative mx-auto h-[72px] w-[72px] shrink-0 sm:h-[90px] sm:w-[90px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              data={budgetUsage}
              innerRadius="76%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar
                dataKey="value"
                cornerRadius={16}
                background={{ fill: theme === "dark" ? "#1e293b" : "#e2e8f0" }}
              />
            </RadialBarChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex items-center justify-center text-base font-bold text-slate-900 sm:text-lg dark:text-white">
            {budgetSummary.usedPercent}%
          </div>
        </div>

        <div className="space-y-2.5 text-[13px] sm:text-sm">
          <div>
            <p className="text-[13px] text-slate-500 sm:text-sm dark:text-slate-400">Đã chi</p>
            <p className="mt-0.5 text-[13px] font-semibold text-emerald-600 sm:text-[15px] dark:text-emerald-400">
              {budgetSummary.spent}
            </p>
          </div>

          <div>
            <p className="text-[13px] text-slate-500 sm:text-sm dark:text-slate-400">Còn lại</p>
            <p className="mt-0.5 text-[13px] font-semibold text-slate-900 sm:text-[15px] dark:text-slate-200">
              {budgetSummary.remaining}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
