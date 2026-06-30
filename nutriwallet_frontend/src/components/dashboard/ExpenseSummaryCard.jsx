import { ReceiptText } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import StatCard from "./StatCard";

export default function ExpenseSummaryCard({
  expenseSummary,
  expenseTrend,
}) {
  return (
    <StatCard
      title="Tổng chi tiêu"
      icon={ReceiptText}
      iconClass="bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400"
    >
      <div className="mt-3">
        <p className="text-[1.45rem] font-bold tracking-tight text-slate-900 sm:text-[2.1rem] dark:text-white">
          {expenseSummary.totalExpenses}
        </p>
        <p className="mt-0.5 text-[13px] text-slate-500 sm:text-sm dark:text-slate-400">
          {expenseSummary.helperText}
        </p>

        <p className="mt-3 text-[13px] text-slate-500 sm:mt-4 sm:text-sm dark:text-slate-400">
          Tổng số tiền
        </p>
        <p className="mt-0.5 text-[13px] font-semibold text-slate-900 sm:text-[15px] dark:text-slate-200">
          {expenseSummary.totalAmount}
        </p>

        <div className="mt-2.5 h-7 sm:mt-3 sm:h-8">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={expenseTrend}>
              <Line
                type="natural"
                dataKey="value"
                stroke="#38bdf8"
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
