import { Leaf, Menu } from "lucide-react";
import { useState } from "react";
import Sidebar from "../dashboard/Sidebar";

export default function AppShell({ pageLabel, children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                <p className="text-xs text-slate-500">{pageLabel}</p>
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

          {children}
        </main>
      </div>
    </div>
  );
}
