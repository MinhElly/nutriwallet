import {
  AlertTriangle,
  Ban,
  CheckCircle,
  Eye,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

export default function UserTable({
  users = [],
  loading,
  currentUserId,
  onToggleBlock,
  onViewDetail,
}) {
  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex h-60 flex-col items-center justify-center text-slate-400">
        <AlertTriangle size={32} className="mb-2 text-purple-400" />
        <span>Không tìm thấy người dùng nào</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#25214d] bg-[#171530] shadow-md">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#25214d] bg-[#1f1c42]/40 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <th className="px-6 py-4">Thành viên</th>
            <th className="px-6 py-4">Vai trò</th>
            <th className="px-6 py-4">Trạng thái</th>
            <th className="px-6 py-4">Messenger</th>
            <th className="px-6 py-4">Ngày đăng ký</th>
            <th className="px-6 py-4 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#25214d]/55 text-sm">
          {users.map((user) => {
            const isAdmin = user.rawRole === "ADMIN";
            const isActive = user.status === "ACTIVE";
            const isCurrentAdmin = String(user.id) === String(currentUserId);

            return (
              <tr key={user.id} className="transition-all hover:bg-[#1f1b40]/30">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-purple-600/30"
                    />
                    <div>
                      <div className="font-bold text-white">{user.fullName || "N/A"}</div>
                      <div className="text-xs text-slate-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 rounded-full border border-purple-800/30 bg-purple-950/60 px-2.5 py-0.5 text-xs font-bold text-purple-300">
                    {isAdmin && <ShieldCheck size={12} />}
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${
                    isActive
                      ? "border-emerald-800/30 bg-emerald-950/80 text-emerald-300"
                      : "border-rose-800/30 bg-rose-950/80 text-rose-300"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-rose-400"}`} />
                    {isActive ? "Hoạt động" : "Bị khóa"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                    user.messengerLinked ? "text-blue-400" : "text-slate-500"
                  }`}>
                    <MessageCircle size={14} />
                    {user.messengerLinked ? "Đã liên kết" : "Chưa liên kết"}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-300">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                    : "---"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onViewDetail(user.id)}
                      className="inline-flex items-center gap-1 rounded-xl border border-[#3c376d] bg-[#1e1c3a] px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-purple-500 hover:text-white"
                    >
                      <Eye size={12} />
                      Chi tiết
                    </button>
                    <button
                      type="button"
                      disabled={isCurrentAdmin}
                      title={isCurrentAdmin ? "Admin không thể tự khóa chính mình" : undefined}
                      onClick={() => onToggleBlock(user.id, user.status)}
                      className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                        isActive
                          ? "border border-rose-900/30 bg-rose-950/40 text-rose-400 hover:bg-rose-600 hover:text-white"
                          : "border border-emerald-900/30 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-600 hover:text-white"
                      }`}
                    >
                      {isActive ? <Ban size={12} /> : <CheckCircle size={12} />}
                      {isCurrentAdmin ? "Tài khoản hiện tại" : isActive ? "Khóa" : "Mở khóa"}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}