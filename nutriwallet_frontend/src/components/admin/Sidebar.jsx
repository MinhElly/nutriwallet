import {
  LayoutGrid,
  Users,
  Brain,
  Flag,
  BarChart3,
  Settings,
  LogOut,
  Shield
} from "lucide-react";

export default function Sidebar({ currentTab, setCurrentTab, currentUser, onLogout }) {
  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "users", label: "User Management", icon: Users },
    { id: "ai", label: "AI Console", icon: Brain },
    { id: "moderation", label: "Content Moderation", icon: Flag },
    { id: "analytics", label: "Reports & Analytics", icon: BarChart3 },
    { id: "settings", label: "System Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen shrink-0 bg-[#0f0d23] border-r border-[#1f1b40] flex flex-col px-4 py-6 text-white sticky top-0 left-0">
      {/* Brand Header */}
      <div className="mb-6 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30">
          <Shield size={20} className="fill-white/10" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white leading-tight">
            NutriWallet
          </h1>
          <span className="text-[10px] tracking-wider font-extrabold text-[#d946ef] uppercase">
            Admin Console
          </span>
        </div>
      </div>

      {/* System Status */}
      <div className="mb-8 px-2">
        <div className="flex items-center gap-2 rounded-xl bg-emerald-950/30 border border-emerald-900/30 px-3 py-1.5 text-xs text-emerald-400 font-semibold w-fit">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>SYSTEM ONLINE</span>
        </div>
      </div>

      {/* Navigation menu */}
      <div className="flex-1 space-y-6">
        <div>
          <span className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3">
            Management
          </span>
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              
              if (item.disabled) {
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-500 cursor-not-allowed transition-all"
                    title="Tính năng đang được phát triển"
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                      : "text-slate-400 hover:bg-[#1a1738] hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Profile / Logout */}
      <div className="mt-auto pt-4 border-t border-[#1f1b40]">
        <div className="relative rounded-2xl bg-[#171530] border border-[#25214d] p-3.5 mb-3">
          <div className="flex items-center gap-3">
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-purple-500"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white ring-2 ring-purple-500 text-xs font-bold">
                SA
              </div>
            )}
            <div className="min-w-0">
              <h4 className="truncate text-xs font-bold text-white">
                {currentUser?.fullName ?? "Super Admin"}
              </h4>
              <p className="text-[10px] text-slate-400 truncate">
                {currentUser?.email ?? "admin@nutriwallet.ai"}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 py-2.5 text-xs font-semibold text-red-400 transition-all hover:bg-red-600 hover:text-white cursor-pointer"
        >
          <LogOut size={14} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
