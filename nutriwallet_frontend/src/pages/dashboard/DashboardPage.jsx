import { useMemo, useState } from "react";
import { Leaf, Menu, Wallet } from "lucide-react";
import {
  getDashboardSnapshot,
} from "../../data/dashboardData";
import AccountCard from "../../components/dashboard/AccountCard";
import BudgetUsageCard from "../../components/dashboard/BudgetUsageCard";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import ExpenseSummaryCard from "../../components/dashboard/ExpenseSummaryCard";
import ExpenseTable from "../../components/dashboard/ExpenseTable";
import MealSummaryCard from "../../components/dashboard/MealSummaryCard";
import MealTable from "../../components/dashboard/MealTable";
import RecommendationCard from "../../components/dashboard/RecommendationCard";
import Sidebar from "../../components/dashboard/Sidebar";

export default function DashboardPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState("1 tháng qua");
  const dashboardSnapshot = useMemo(
    () => getDashboardSnapshot(selectedDate, selectedPeriod),
    [selectedDate, selectedPeriod],
  );

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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar />

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 xl:hidden">
            <button
              type="button"
              aria-label="Đóng menu"
              className="absolute inset-0 cursor-pointer bg-slate-900/30 backdrop-blur-[1px]"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative z-10 h-full w-fit">
              <Sidebar mobile onClose={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 px-4 py-4 xl:px-6 xl:py-5">
          <div className="mb-4 flex items-center justify-between xl:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm shadow-emerald-200/70">
                <Leaf size={18} strokeWidth={1.9} />
              </div>
              <div>
                <p className="text-[15px] font-semibold tracking-tight text-slate-900">
                  NutriWallet AI
                </p>
                <p className="text-xs text-slate-500">Bảng điều khiển</p>
              </div>
            </div>

            <button
              type="button"
              aria-label="Mở menu"
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm shadow-slate-200/30 transition-colors hover:bg-slate-50"
            >
              <Menu size={18} strokeWidth={1.9} />
            </button>
          </div>

          <DashboardHeader
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />

          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/50 xl:p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 sm:h-10 sm:w-10">
                  <Wallet size={18} strokeWidth={1.9} />
                </div>

                <button
                  type="button"
                  className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
                >
                  ...
                </button>
              </div>

              <h3 className="mt-3 text-[14px] font-semibold text-slate-900 sm:text-[15px]">
                Ngân sách hiện tại
              </h3>

              <div className="mt-3 flex flex-1 flex-col justify-between space-y-3 text-[13px] sm:text-sm">
                <div>
                  <p className="text-[13px] text-slate-500 sm:text-sm">Số tiền</p>
                  <p className="mt-1 break-words text-[1.15rem] font-bold tracking-tight text-slate-900 sm:text-[2rem]">
                    {budgetSummary.amount}
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <p className="text-[13px] text-slate-500 sm:text-sm">Kỳ hạn</p>
                    <p className="mt-0.5 text-[13px] font-medium text-slate-700 sm:text-sm">
                      {budgetSummary.period}
                    </p>
                  </div>

                  <div>
                    <p className="text-[13px] text-slate-500 sm:text-sm">Thời gian</p>
                    <p className="mt-0.5 text-[13px] font-medium text-slate-700 sm:text-sm">
                      {budgetSummary.duration}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-[13px] text-slate-500 sm:text-sm">
                        Ngưỡng cảnh báo
                      </p>
                      <span className="text-[13px] font-semibold text-emerald-600 sm:text-sm">
                        {budgetSummary.warningThreshold}%
                      </span>
                    </div>

                    <div className="mt-1.5 h-1 rounded-full bg-slate-100">
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
            <RecommendationCard />
          </div>

          <div className="mt-3">
            <AccountCard />
          </div>
        </main>
      </div>
    </div>
  );
}
