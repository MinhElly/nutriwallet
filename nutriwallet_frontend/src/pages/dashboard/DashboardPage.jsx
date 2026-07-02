import { Wallet } from "lucide-react";
import { useDashboardData } from "../../hooks/useDashboardData";
import AccountCard from "../../components/dashboard/AccountCard";
import BudgetUsageCard from "../../components/dashboard/BudgetUsageCard";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import ExpenseSummaryCard from "../../components/dashboard/ExpenseSummaryCard";
import ExpenseTable from "../../components/dashboard/ExpenseTable";
import MealSummaryCard from "../../components/dashboard/MealSummaryCard";
import MealTable from "../../components/dashboard/MealTable";
import RecommendationCard from "../../components/dashboard/RecommendationCard";
import AppShell from "../../components/layout/AppShell";

export default function DashboardPage() {
  const {
    selectedDate,
    setSelectedDate,
    selectedPeriod,
    setSelectedPeriod,
    snapshot: dashboardSnapshot,
    aiRecommendations,
    loading,
    error,
  } = useDashboardData();

  const {
    budgetSummary,
    budgetUsage,
    mealSummary,
    expenseSummary,
    mealTrend,
    expenseTrend,
    meals,
    expenses,
  } = dashboardSnapshot;

  return (
    <AppShell pageLabel="Bảng điều khiển">
      <DashboardHeader
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
      />

      {(loading || error) && (
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          {loading ? "Đang tải dữ liệu dashboard..." : error}
        </p>
      )}

      <section className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 xl:p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 sm:h-10 sm:w-10 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Wallet size={18} strokeWidth={1.9} />
            </div>

            <button
              type="button"
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              ...
            </button>
          </div>

          <h3 className="mt-3 text-[14px] font-semibold text-slate-900 sm:text-[15px] dark:text-slate-100">
            Ngân sách hiện tại
          </h3>

          <div className="mt-3 flex flex-1 flex-col justify-between space-y-3 text-[13px] sm:text-sm">
            <div>
              <p className="text-[13px] text-slate-500 sm:text-sm dark:text-slate-400">Số tiền</p>
              <p className="mt-1 break-words text-[1.15rem] font-bold tracking-tight text-slate-900 sm:text-[2rem] dark:text-white">
                {budgetSummary.amount}
              </p>
            </div>

            <div className="space-y-2.5">
              <div>
                <p className="text-[13px] text-slate-500 sm:text-sm dark:text-slate-400">Kỳ hạn</p>
                <p className="mt-0.5 text-[13px] font-medium text-slate-700 sm:text-sm dark:text-slate-300">
                  {budgetSummary.period}
                </p>
              </div>

              <div>
                <p className="text-[13px] text-slate-500 sm:text-sm dark:text-slate-400">Thời gian</p>
                <p className="mt-0.5 text-[13px] font-medium text-slate-700 sm:text-sm dark:text-slate-300">
                  {budgetSummary.duration}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[13px] text-slate-500 sm:text-sm dark:text-slate-400">
                    Ngưỡng cảnh báo
                  </p>
                  <span className="text-[13px] font-semibold text-emerald-600 sm:text-sm dark:text-emerald-400">
                    {budgetSummary.warningThreshold}%
                  </span>
                </div>

                <div className="mt-1.5 h-1 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${budgetSummary.warningThreshold}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <BudgetUsageCard
          budgetSummary={budgetSummary}
          budgetUsage={budgetUsage}
        />
        <MealSummaryCard mealSummary={mealSummary} mealTrend={mealTrend} />
        <ExpenseSummaryCard
          expenseSummary={expenseSummary}
          expenseTrend={expenseTrend}
        />
      </section>

      <section className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-2">
        <MealTable meals={meals} />
        <ExpenseTable expenses={expenses} />
      </section>

      <div className="mt-3">
        <RecommendationCard items={aiRecommendations} />
      </div>

      <div className="mt-3">
        <AccountCard />
      </div>
    </AppShell>
  );
}
