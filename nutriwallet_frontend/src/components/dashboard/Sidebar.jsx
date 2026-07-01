import {
  CheckCircle,
  History,
  LayoutDashboard,
  Leaf,
  LogOut,
  Pin,
  PinOff,
  ReceiptText,
  ScanLine,
  Settings,
  User,
  Wallet,
  X,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

function SidebarItem({ icon: Icon, label, to, active, onClick, isCollapsed, isLocked }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      title={isCollapsed || isLocked ? label : ""}
      className={`group/item flex w-full cursor-pointer items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left text-[15px] font-medium transition-all duration-200 ${
        isLocked 
          ? "justify-center px-0" 
          : isCollapsed 
            ? "justify-center xl:group-hover/sidebar:justify-start xl:group-hover/sidebar:px-3" 
            : ""
      } ${
        active
          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      <Icon
        size={18}
        strokeWidth={1.9}
        className="transition-transform duration-200 group-hover/item:translate-x-0.5 shrink-0"
      />
      <span className={`truncate ${isLocked ? "hidden" : isCollapsed ? "xl:hidden xl:group-hover/sidebar:inline" : ""}`}>
        {label}
      </span>
    </Link>
  );
}

export default function Sidebar({ mobile = false, onClose, isLocked, onToggleLock }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth(); // Lấy hàm logout từ useAuth

  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
        navigate("/login"); // Điều hướng về trang login sau khi đăng xuất thành công
      }
    } catch (error) {
      console.error("Đăng xuất thất bại:", error);
    }
  };

  const wrapperClass = mobile
    ? "relative flex h-full w-[248px] flex-col bg-[#111827] px-3 py-4 text-white"
    : `sticky top-0 bottom-0 left-0 z-40 flex h-screen w-20 shrink-0 flex-col border-r border-white/10 bg-[#111827] px-3 py-4 text-white hidden xl:flex transition-all duration-300 shadow-xl group/sidebar ${
        isLocked ? "w-20" : "xl:hover:w-56"
      }`;

  return (
    <aside className={wrapperClass}>
      {/* Header Logo */}
      <div className={`mb-7 flex items-start justify-between gap-3 px-1 xl:justify-center ${isLocked ? "" : "xl:group-hover/sidebar:justify-start"}`}>
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
            <Leaf size={19} strokeWidth={1.9} />
          </div>

          <div className={`min-w-0 xl:hidden ${isLocked ? "hidden" : "xl:group-hover/sidebar:block"} ${mobile ? "block" : ""}`}>
            <h1 className="text-[14px] font-semibold tracking-tight text-white whitespace-nowrap" style={{ fontFamily: "Psionic" }}>
              NutriWallet AI
            </h1>
            <p className="mt-0.5 text-xs leading-5 text-slate-400 whitespace-nowrap">
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

      {/* Danh sách Menu */}
      <nav className="space-y-1.5">
        <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Tổng quan" active={currentPath === "/dashboard"} onClick={onClose} isCollapsed={!mobile} isLocked={isLocked && !mobile} />
        <SidebarItem to="/scan-meal" icon={ScanLine} label="Quét bữa ăn" active={currentPath === "/scan-meal"} onClick={onClose} isCollapsed={!mobile} isLocked={isLocked && !mobile} />
        <SidebarItem to="/meal-history" icon={History} label="Lịch sử bữa ăn" active={currentPath === "/meal-history"} onClick={onClose} isCollapsed={!mobile} isLocked={isLocked && !mobile} />
        <SidebarItem to="/budget" icon={Wallet} label="Ngân sách" active={currentPath === "/budget"} onClick={onClose} isCollapsed={!mobile} isLocked={isLocked && !mobile} />
        <SidebarItem to="/expense-history" icon={ReceiptText} label="Lịch sử chi tiêu" active={currentPath === "/expense-history"} onClick={onClose} isCollapsed={!mobile} isLocked={isLocked && !mobile} />
        <SidebarItem to="/profile" icon={User} label="Hồ sơ" active={currentPath === "/profile"} onClick={onClose} isCollapsed={!mobile} isLocked={isLocked && !mobile} />
        <SidebarItem to="/settings" icon={Settings} label="Cài đặt" active={currentPath === "/settings"} onClick={onClose} isCollapsed={!mobile} isLocked={isLocked && !mobile} />
      </nav>

      {/* Nút ghim cố định */}
      {!mobile && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={onToggleLock}
            title={isLocked ? "Mở khóa rộng" : "Khóa thu nhỏ"}
            className={`flex w-full cursor-pointer items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left text-[14px] font-medium transition-all duration-200 ${
              isLocked ? "justify-center px-0 text-emerald-400 bg-emerald-500/10" : "text-slate-400 hover:bg-white/5 hover:text-white xl:justify-center xl:group-hover/sidebar:justify-start xl:group-hover/sidebar:px-3"
            }`}
          >
            {isLocked ? (
              <PinOff size={18} strokeWidth={1.9} className="shrink-0" />
            ) : (
              <>
                <Pin size={18} strokeWidth={1.9} className="shrink-0" />
                <span className="truncate xl:hidden xl:group-hover/sidebar:inline">Khóa thu nhỏ</span>
              </>
            )}
          </button>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-4 bottom-24 h-24 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.08),transparent_70%)] blur-2xl" />

      {/* Khung User Profile & Nút Log Out dưới đáy */}
      <div className={`relative mt-auto rounded-3xl border border-white/10 bg-white/5 shadow-sm transition-all duration-200 p-1.5 flex flex-col justify-center ${isLocked ? "" : "xl:group-hover/sidebar:p-3.5"}`}>
        <div className="flex items-center gap-2.5">
          {currentUser?.avatarUrl ? (
            <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="h-10 w-10 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
              <User size={18} />
            </div>
          )}

          <div className={`min-w-0 xl:hidden ${isLocked ? "hidden" : "xl:group-hover/sidebar:block"} ${mobile ? "block" : ""}`}>
            <h4 className="truncate text-[13px] font-semibold text-white">{currentUser?.fullName ?? ""}</h4>
            <p className="text-xs text-slate-400">{currentUser?.role ?? ""}</p>
            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-400">
              <CheckCircle size={12} strokeWidth={2} />
              Email đã xác minh
            </p>
          </div>
        </div>

        {/* NÚT ĐĂNG XUẤT ĐÃ THAY THẾ MESSENGER: Click để Log Out */}
        <button
          type="button"
          onClick={handleLogout}
          title="Đăng xuất tài khoản"
          className={`mt-3 flex w-full items-center gap-2 border-t border-white/10 pt-2.5 text-xs text-red-400 hover:text-red-300 transition-colors ${
            isLocked ? "justify-center" : "xl:justify-center xl:group-hover/sidebar:justify-start"
          } ${mobile ? "justify-start" : ""}`}
        >
          <LogOut size={14} strokeWidth={1.9} className="shrink-0" />
          <span className={`truncate ${isLocked ? "hidden" : "xl:hidden xl:group-hover/sidebar:inline"} ${mobile ? "inline" : ""}`}>
            Đăng xuất
          </span>
        </button>
      </div>
    </aside>
  );
}