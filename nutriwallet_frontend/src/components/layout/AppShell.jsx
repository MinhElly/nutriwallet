import { Leaf, Menu, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import Sidebar from "../dashboard/Sidebar";

export default function AppShell({ pageLabel, children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Khởi tạo state từ localStorage để giữ trạng thái khi chuyển trang
  const [isLocked, setIsLocked] = useState(() => {
    const saved = localStorage.getItem("sidebar_locked");
    return saved === "true";
  });

  const { theme, toggleTheme } = useTheme();

  // Cập nhật localStorage mỗi khi trạng thái isLocked thay đổi
  const handleToggleLock = () => {
    setIsLocked((prev) => {
      const nextState = !prev;
      localStorage.setItem("sidebar_locked", String(nextState));
      return nextState;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-screen">
        {/* Truyền thuộc tính khóa và hàm xử lý đã lưu vào localStorage */}
        <Sidebar isLocked={isLocked} onToggleLock={handleToggleLock} />

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 xl:hidden">
            <button
              type="button"
              aria-label="Đóng menu"
              className="absolute inset-0 cursor-pointer bg-slate-900/30 backdrop-blur-[1px] dark:bg-slate-950/60"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative z-10 h-full w-fit">
              <Sidebar mobile onClose={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 px-4 py-4 xl:py-5 xl:px-6">
          <div className="mb-4 flex items-center justify-between px-2">
            <div className="flex items-center gap-2.5 xl:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm shadow-emerald-200/70 dark:shadow-none">
                <Leaf size={18} strokeWidth={1.9} />
              </div>
              <div>
                <p className="text-[15px] font-semibold tracking-tight text-slate-900 dark:text-slate-100" style={{ fontFamily: "Psionic" }}>
                  NutriWallet AI
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{pageLabel}</p>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2.5">
              <button
                type="button"
                aria-label="Đổi giao diện"
                onClick={toggleTheme}
                title={theme === "dark" ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-amber-500 shadow-sm transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-amber-400 dark:hover:bg-slate-800"
              >
                {theme === "dark" ? <Sun size={18} strokeWidth={1.9} /> : <Moon size={18} strokeWidth={1.9} />}
              </button>

              <button
                type="button"
                aria-label="Mở menu"
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-50 xl:hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Menu size={18} strokeWidth={1.9} />
              </button>
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}