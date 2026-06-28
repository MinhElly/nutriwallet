import { useState } from "react";
import { Leaf, Menu, Search, User } from "lucide-react";
import Sidebar from "../../components/dashboard/Sidebar";
import MealHistoryTable from "../../components/meal/MealHistoryTable";
import { userInfo } from "../../data/dashboardData";

function MealHistoryPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
                <p className="text-sm font-semibold tracking-tight text-slate-900 sm:text-[15px]">
                  NutriWallet AI
                </p>
                <p className="text-xs text-slate-500">Lịch sử bữa ăn</p>
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

          <header className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-[2rem] font-bold leading-tight text-slate-950 sm:text-3xl xl:text-4xl">
                  Lịch sử bữa ăn
                </h1>
                <p className="mt-2 max-w-xl text-[15px] leading-7 text-slate-500 xl:text-base">
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
              <div className="flex h-12 w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 sm:w-[360px]">
                <Search size={18} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bữa ăn..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full cursor-text bg-transparent text-sm outline-none placeholder:text-slate-400"
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
        </main>
      </div>
    </div>
  );
}

export default MealHistoryPage;
