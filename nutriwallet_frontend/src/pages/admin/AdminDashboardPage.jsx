import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ShieldCheck,
  UserX,
  Database,
  Search,
  LogOut,
  Leaf,
  Settings,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { fetchAllUsers } from "../../services/user.service";
import toast from "react-hot-toast";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await fetchAllUsers();
      if (res.error) {
        toast.error(res.error);
      }
      setUsers(res.data || []);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      toast.success("Đã đăng xuất tài khoản admin");
    } catch (err) {
      toast.error("Đăng xuất thất bại");
    }
  };

  const handleToggleBlock = (userId, currentStatus) => {
    const nextStatus = currentStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
    );
    toast.success(
      `Đã ${nextStatus === "ACTIVE" ? "mở khóa" : "khóa"} tài khoản thành công`
    );
  };

  const handlePromoteUser = (userId, currentRole) => {
    const nextRole = currentRole === "Admin" ? "Người dùng" : "Admin";
    const nextRawRole = currentRole === "Admin" ? "USER" : "ADMIN";
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, role: nextRole, rawRole: nextRawRole }
          : u
      )
    );
    toast.success(`Đã cập nhật vai trò thành công`);
  };

  // Filters & Search
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === "ALL") return matchesSearch;
    return matchesSearch && u.status === statusFilter;
  });

  // Stats calculation
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "ACTIVE").length;
  const blockedUsers = users.filter((u) => u.status === "BLOCKED").length;
  const adminCount = users.filter((u) => u.rawRole === "ADMIN").length;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Sidebar Admin */}
      <aside className="sticky top-0 left-0 z-40 flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-[#111827] px-4 py-6 text-white dark:border-slate-800">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 animate-pulse">
            <Leaf size={22} strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white whitespace-nowrap" style={{ fontFamily: "Psionic" }}>
              NutriWallet Admin
            </h1>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400">
              Hệ thống Quản trị
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5">
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all">
            <Users size={18} />
            <span>Quản lý Người dùng</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all cursor-not-allowed">
            <Settings size={18} />
            <span>Cài đặt Hệ thống</span>
          </div>
        </nav>

        {/* Admin profile block */}
        <div className="relative mt-auto rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3">
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-emerald-500">
                <Users size={18} />
              </div>
            )}
            <div className="min-w-0">
              <h4 className="truncate text-sm font-bold text-white">
                {currentUser?.fullName ?? "Admin"}
              </h4>
              <p className="text-xs text-slate-400 truncate">
                {currentUser?.email ?? "admin@nutriwallet.com"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-2 text-xs font-semibold text-red-400 transition-all hover:bg-red-500 hover:text-white"
          >
            <LogOut size={14} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-8 py-8 overflow-y-auto">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              Tổng quan Hệ thống
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Theo dõi người dùng và cấu hình của hệ thống NutriWallet AI.
            </p>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1 */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                Tổng Người dùng
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                <Users size={20} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-slate-950 dark:text-white">
                {totalUsers}
              </span>
              <span className="ml-2 text-xs text-slate-400">tài khoản</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                Đang hoạt động
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <ShieldCheck size={20} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-slate-950 dark:text-white">
                {activeUsers}
              </span>
              <span className="ml-2 text-xs text-slate-400">đang hoạt động</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                Đã bị khóa
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                <UserX size={20} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-slate-950 dark:text-white">
                {blockedUsers}
              </span>
              <span className="ml-2 text-xs text-slate-400">bị hạn chế</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                Tổng số Admin
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                <Database size={20} />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-slate-950 dark:text-white">
                {adminCount}
              </span>
              <span className="ml-2 text-xs text-slate-400">quản trị viên</span>
            </div>
          </div>
        </div>

        {/* User Management Section */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {/* Table Controls */}
          <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">
              Danh sách Người dùng
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm tên, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-60 rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:bg-slate-900"
                />
              </div>

              {/* Filter */}
              <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setStatusFilter("ALL")}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                    statusFilter === "ALL"
                      ? "bg-white text-slate-950 shadow-sm dark:bg-slate-900 dark:text-white"
                      : "text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("ACTIVE")}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                    statusFilter === "ACTIVE"
                      ? "bg-white text-slate-950 shadow-sm dark:bg-slate-900 dark:text-white"
                      : "text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  Hoạt động
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("BLOCKED")}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                    statusFilter === "BLOCKED"
                      ? "bg-white text-slate-950 shadow-sm dark:bg-slate-900 dark:text-white"
                      : "text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  Bị khóa
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex h-60 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex h-60 flex-col items-center justify-center text-slate-400">
                <AlertTriangle size={32} className="mb-2" />
                <span>Không tìm thấy người dùng nào</span>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[13px] font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                    <th className="px-6 py-4">Thành viên</th>
                    <th className="px-6 py-4">Vai trò</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4">Ngày đăng ký</th>
                    <th className="px-6 py-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="text-sm transition-all hover:bg-slate-50/40 dark:hover:bg-slate-800/20"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatarUrl}
                            alt={u.fullName}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-bold text-slate-950 dark:text-white">
                              {u.fullName}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            u.rawRole === "ADMIN"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                              : "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            u.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                              : "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400"
                          }`}
                        >
                          {u.status === "ACTIVE" ? "Hoạt động" : "Bị khóa"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString("vi-VN")
                          : "---"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handlePromoteUser(u.id, u.role)}
                            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                          >
                            {u.rawRole === "ADMIN" ? "Hạ vai trò" : "Thăng Admin"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleBlock(u.id, u.status)}
                            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                              u.status === "ACTIVE"
                                ? "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white"
                                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/20 dark:text-emerald-400 dark:hover:bg-emerald-600 dark:hover:text-white"
                            }`}
                          >
                            {u.status === "ACTIVE" ? "Khóa" : "Mở khóa"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
