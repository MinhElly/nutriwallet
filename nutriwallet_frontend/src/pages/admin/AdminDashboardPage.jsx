import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { fetchAllUsers } from "../../services/user.service";
import toast from "react-hot-toast";

// Import Custom Components
import Sidebar from "../../components/admin/Sidebar";
import OverviewTab from "../../components/admin/OverviewTab";
import AIConsoleTab from "../../components/admin/AIConsoleTab";
import AiErrorLogsTab from "../../components/admin/AiErrorLogsTab";
import ContentModerationTab from "../../components/admin/ContentModerationTab";
import AnalyticsTab from "../../components/admin/AnalyticsTab";
import SystemSettingsTab from "../../components/admin/SystemSettingsTab";
import UserTable from "../../components/admin/UserTable";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  
  // State variables for User Management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  // Navigation tab state: 'overview', 'users', or 'ai'
  const [currentTab, setCurrentTab] = useState("overview");

  // Fetch Users data
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
      console.error(err);
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

  // Filters & Search for Users Table
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === "ALL") return matchesSearch;
    return matchesSearch && u.status === statusFilter;
  });

  return (
    <div className="flex min-h-screen bg-[#0b091a] text-slate-100 font-sans antialiased">
      {/* Sidebar Admin */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#0b091a]">
        
        {/* Top Header */}
        <header className="flex h-20 items-center justify-between border-b border-[#1f1b40] bg-[#0c0a1e]/90 px-8 sticky top-0 z-30 backdrop-blur-md">
          {/* Search bar */}
          <div className="relative w-full max-w-md">
            <Search className="absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm người dùng, logs..."
              value={currentTab === "users" ? searchQuery : ""}
              onChange={(e) => {
                if (currentTab === "users") {
                  setSearchQuery(e.target.value);
                } else {
                  setCurrentTab("users");
                  setSearchQuery(e.target.value);
                }
              }}
              className="h-11 w-full rounded-2xl border border-[#25214d] bg-[#171530] pl-11 pr-4 text-sm text-white placeholder-slate-400 outline-none transition-all focus:border-purple-500 focus:bg-[#1a1836]"
            />
          </div>

          {/* User & Controls */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-[#171530] border border-[#25214d] text-slate-300 hover:text-white cursor-pointer transition-all"
            >
              <Bell size={18} />
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-[#0b091a]">
                5
              </span>
            </button>

            {/* Profile widget */}
            <div className="flex items-center gap-3 rounded-2xl bg-[#171530] border border-[#25214d] pl-3 pr-4 py-1.5">
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-purple-600/30"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white text-xs font-bold ring-2 ring-purple-600/30">
                  SA
                </div>
              )}
              <div className="hidden sm:block text-left">
                <h4 className="text-xs font-bold text-white leading-tight">
                  {currentUser?.fullName ?? "Super Admin"}
                </h4>
                <span className="text-[9px] uppercase tracking-wider text-purple-400 font-extrabold block">
                  Full Access
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content tabs */}
        <div className="flex-1 px-8 py-8 bg-[#0b091a]">
          
          {/* OVERVIEW TAB */}
          {currentTab === "overview" && <OverviewTab />}

          {/* AI CONSOLE TAB */}
          {currentTab === "ai" && <AIConsoleTab />}

          {/* AI ERROR LOGS TAB */}
          {currentTab === "ai-errors" && <AiErrorLogsTab />}

          {/* CONTENT MODERATION TAB */}
          {currentTab === "moderation" && <ContentModerationTab />}

          {/* REPORTS & ANALYTICS TAB */}
          {currentTab === "analytics" && <AnalyticsTab />}

          {/* SYSTEM SETTINGS TAB */}
          {currentTab === "settings" && <SystemSettingsTab />}

          {/* USER MANAGEMENT TAB */}
          {currentTab === "users" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-white">
                    Quản lý Người dùng
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Danh sách tài khoản đăng ký hệ thống NutriWallet AI
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1 rounded-2xl border border-[#25214d] bg-[#171530] p-1">
                    <button
                      type="button"
                      onClick={() => setStatusFilter("ALL")}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                        statusFilter === "ALL"
                          ? "bg-purple-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Tất cả
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter("ACTIVE")}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                        statusFilter === "ACTIVE"
                          ? "bg-purple-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Hoạt động
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter("BLOCKED")}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                        statusFilter === "BLOCKED"
                          ? "bg-purple-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Bị khóa
                    </button>
                  </div>
                </div>
              </div>

              {/* UserTable Component */}
              <UserTable
                users={filteredUsers}
                loading={loading}
                onPromote={handlePromoteUser}
                onToggleBlock={handleToggleBlock}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
