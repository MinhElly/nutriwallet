import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import {
  fetchAdminUserDetail,
  fetchAllUsers,
  updateAdminUserStatus,
} from "../../services/user.service";
import toast from "react-hot-toast";

// Import Custom Components
import Sidebar from "../../components/admin/Sidebar";
import OverviewTab from "../../components/admin/OverviewTab";
import AIConsoleTab from "../../components/admin/AIConsoleTab";
import AiErrorLogsTab from "../../components/admin/AiErrorLogsTab";
import AuditLogTab from "../../components/admin/AuditLogTab";
import UserTable from "../../components/admin/UserTable";
import UserDetailModal from "../../components/admin/UserDetailModal";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  // State variables for User Management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Navigation tab state: 'overview', 'users', or 'ai'
  const [currentTab, setCurrentTab] = useState("overview");

  // Fetch users from the admin API. Debounce search to avoid a request per keystroke.
  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await fetchAllUsers({
        query: searchQuery,
        status: statusFilter,
      });
      if (!active) return;
      if (res.error) toast.error(res.error);
      setUsers(res.data || []);
      setLoading(false);
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchQuery, statusFilter]);

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

  const handleToggleBlock = async (userId, currentStatus) => {
    const nextStatus = currentStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    const result = await updateAdminUserStatus(userId, nextStatus);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setUsers((prev) =>
      prev.map((user) => (user.id === userId ? result.data : user)),
    );
    toast.success(nextStatus === "ACTIVE" ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản");
  };

  const handleViewDetail = async (userId) => {
    setDetailLoading(true);
    setSelectedUser(null);
    const result = await fetchAdminUserDetail(userId);
    setDetailLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setSelectedUser(result.data);
  };
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


        {/* Dashboard Content tabs */}
        <div className="flex-1 px-8 py-8 bg-[#0b091a]">

          {/* OVERVIEW TAB */}
          {currentTab === "overview" && <OverviewTab />}

          {/* AI CONSOLE TAB */}
          {currentTab === "ai" && <AIConsoleTab />}

          {/* AI ERROR LOGS TAB */}
          {currentTab === "ai-errors" && <AiErrorLogsTab />}

          {/* AUDIT LOG TAB */}
          {currentTab === "audit" && <AuditLogTab />}

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

                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="search"
                      placeholder="Tìm theo tên hoặc email..."
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className="h-10 w-full rounded-2xl border border-[#25214d] bg-[#171530] pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-purple-500"
                    />
                  </div>

                  <div className="flex items-center gap-1 rounded-2xl border border-[#25214d] bg-[#171530] p-1">
                    <button
                      type="button"
                      onClick={() => setStatusFilter("ALL")}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${statusFilter === "ALL"
                          ? "bg-purple-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-white"
                        }`}
                    >
                      Tất cả
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter("ACTIVE")}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${statusFilter === "ACTIVE"
                          ? "bg-purple-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-white"
                        }`}
                    >
                      Hoạt động
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusFilter("BLOCKED")}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${statusFilter === "BLOCKED"
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
                users={users}
                loading={loading}
                currentUserId={currentUser?.id}
                onToggleBlock={handleToggleBlock}
                onViewDetail={handleViewDetail}
              />
            </div>
          )}
        </div>
      </main>
      <UserDetailModal
        user={selectedUser}
        loading={detailLoading}
        onClose={() => {
          setSelectedUser(null);
          setDetailLoading(false);
        }}
      />
    </div>
  );
}
