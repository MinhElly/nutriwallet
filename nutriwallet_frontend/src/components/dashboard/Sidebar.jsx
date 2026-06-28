import {
  CheckCircle,
  History,
  LayoutDashboard,
  Leaf,
  MessageCircle,
  ReceiptText,
  ScanLine,
  Settings,
  User,
  Wallet,
  X,
} from "lucide-react";
import { userInfo } from "../../data/dashboardData";

function SidebarItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full cursor-pointer items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left text-[15px] font-medium transition-all duration-200 ${
        active
          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      <Icon size={18} strokeWidth={1.9} />
      <span className="truncate">{label}</span>
    </button>
  );
}

export default function Sidebar({ mobile = false, onClose }) {
  const wrapperClass = mobile
    ? "relative flex h-full w-[248px] flex-col bg-[#111827] px-3 py-4 text-white"
    : "relative hidden min-h-screen w-[224px] shrink-0 flex-col border-r border-white/10 bg-[#111827] px-3 py-4 text-white xl:flex";

  return (
    <aside className={wrapperClass}>
      <div className="mb-7 flex items-start justify-between gap-3 px-1">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
            <Leaf size={19} strokeWidth={1.9} />
          </div>

          <div>
            <h1 className="text-[17px] font-semibold tracking-tight text-white">
              NutriWallet AI
            </h1>
            <p className="mt-0.5 text-xs leading-5 text-slate-400">
              Ứng dụng AI cho
              <br />
              sức khỏe và tài chính
            </p>
          </div>
        </div>

        {mobile && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-white/10 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <X size={16} strokeWidth={1.9} />
          </button>
        )}
      </div>

      <nav className="space-y-1.5">
        <SidebarItem
          icon={LayoutDashboard}
          label="Tổng quan"
          active
          onClick={onClose}
        />
        <SidebarItem icon={ScanLine} label="Quét bữa ăn" onClick={onClose} />
        <SidebarItem icon={History} label="Lịch sử bữa ăn" onClick={onClose} />
        <SidebarItem icon={Wallet} label="Ngân sách" onClick={onClose} />
        <SidebarItem
          icon={ReceiptText}
          label="Lịch sử chi tiêu"
          onClick={onClose}
        />
        <SidebarItem icon={User} label="Hồ sơ" onClick={onClose} />
        <SidebarItem icon={Settings} label="Cài đặt" onClick={onClose} />
      </nav>

      <div className="pointer-events-none absolute inset-x-4 bottom-24 h-24 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.08),transparent_70%)] blur-2xl" />

      <div className="relative mt-auto rounded-3xl border border-white/10 bg-white/5 p-3.5 shadow-sm">
        <div className="flex items-center gap-2.5">
          <img
            src={userInfo.avatar}
            alt={userInfo.name}
            className="h-10 w-10 rounded-full object-cover"
          />

          <div className="min-w-0">
            <h4 className="truncate text-[13px] font-semibold text-white">
              {userInfo.name}
            </h4>
            <p className="text-xs text-slate-400">{userInfo.role}</p>
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-400">
              <CheckCircle size={12} strokeWidth={2} />
              {userInfo.emailVerified
                ? "Email đã xác minh"
                : "Email chưa xác minh"}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-2.5 text-xs text-slate-400">
          <MessageCircle
            size={14}
            strokeWidth={1.9}
            className="text-blue-400"
          />
          <span>{userInfo.messengerPlatform} đã kết nối</span>
        </div>
      </div>
    </aside>
  );
}
