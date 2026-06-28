import { useState } from "react";
import { Search, User } from "lucide-react";
import AppShell from "../../components/layout/AppShell";
import MealHistoryTable from "../../components/meal/MealHistoryTable";
import { userInfo } from "../../data/dashboardData";

function MealHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <AppShell pageLabel="Lịch sử bữa ăn">
      <header className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[2rem] font-bold leading-tight text-slate-950 sm:text-3xl xl:text-4xl dark:text-white">
              Lịch sử bữa ăn
            </h1>
            <p className="mt-2 max-w-xl text-[15px] leading-7 text-slate-500 xl:text-base dark:text-slate-400">
              Xem và theo dõi tất cả bữa ăn đã được phân tích.
            </p>
          </div>

          <div className="shrink-0 xl:hidden">
            <button className="flex h-12 w-12 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-emerald-700 shadow-sm shadow-emerald-100/80">
              {userInfo.avatar ? (
                <img
                  src={userInfo.avatar}
                  alt={userInfo.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <User size={20} />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 xl:justify-end">
          <div className="flex h-12 w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 sm:w-[360px] dark:border-slate-800 dark:bg-slate-900">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm bữa ăn..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full cursor-text bg-transparent text-sm outline-none placeholder:text-slate-400 dark:text-slate-100"
            />
          </div>

          <div className="hidden items-center xl:flex">
            <button className="flex h-12 w-12 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-emerald-700 shadow-sm shadow-emerald-100/80">
              {userInfo.avatar ? (
                <img
                  src={userInfo.avatar}
                  alt={userInfo.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <User size={20} />
              )}
            </button>
          </div>
        </div>
      </header>

      <MealHistoryTable searchQuery={searchQuery} />
    </AppShell>
  );
}

export default MealHistoryPage;
