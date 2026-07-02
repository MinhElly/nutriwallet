import { AlertTriangle, ShieldCheck, ShieldAlert, Ban, CheckCircle } from "lucide-react";

export default function UserTable({ users = [], loading, onPromote, onToggleBlock }) {
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
            <th className="px-6 py-4">Ngày đăng ký</th>
            <th className="px-6 py-4 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#25214d]/55 text-sm">
          {users.map((u) => {
            const isAdmin = u.rawRole === "ADMIN" || u.role === "Admin" || u.role === "ADMIN";
            const isActive = u.status === "ACTIVE";

            return (
              <tr
                key={u.id}
                className="transition-all duration-150 hover:bg-[#1f1b40]/30"
              >
                {/* User Info */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {u.avatarUrl ? (
                      <img
                        src={u.avatarUrl}
                        alt={u.fullName}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-purple-600/30"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-bold text-sm">
                        {u.fullName ? u.fullName.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-white">
                        {u.fullName || "N/A"}
                      </div>
                      <div className="text-xs text-slate-400">
                        {u.email}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Role */}
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      isAdmin
                        ? "bg-purple-950/80 text-purple-300 border border-purple-800/30"
                        : "bg-blue-950/80 text-blue-300 border border-blue-800/30"
                    }`}
                  >
                    {isAdmin ? (
                      <ShieldCheck size={12} className="text-purple-400" />
                    ) : null}
                    {u.role || (isAdmin ? "Admin" : "Người dùng")}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      isActive
                        ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/30"
                        : "bg-rose-950/80 text-rose-300 border border-rose-800/30"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-rose-400"}`} />
                    {isActive ? "Hoạt động" : "Bị khóa"}
                  </span>
                </td>

                {/* Date Created */}
                <td className="px-6 py-4 text-slate-300">
                  {u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString("vi-VN")
                    : "---"}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onPromote(u.id, u.role)}
                      className="inline-flex items-center gap-1 rounded-xl border border-[#3c376d] hover:border-purple-500 bg-[#1e1c3a] hover:bg-purple-600 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
                    >
                      {isAdmin ? "Hạ vai trò" : "Thăng Admin"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleBlock(u.id, u.status)}
                      className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? "bg-rose-950/40 border border-rose-900/30 text-rose-400 hover:bg-rose-600 hover:text-white"
                          : "bg-emerald-950/40 border border-emerald-900/30 text-emerald-400 hover:bg-emerald-600 hover:text-white"
                      }`}
                    >
                      {isActive ? <Ban size={12} /> : <CheckCircle size={12} />}
                      {isActive ? "Khóa" : "Mở khóa"}
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
