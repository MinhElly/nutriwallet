import { MessageCircle, X } from "lucide-react";

function formatDate(value) {
  return value ? new Date(value).toLocaleString("vi-VN") : "Chưa có";
}

export default function UserDetailModal({ user, loading, onClose }) {
  if (!user && !loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-3xl border border-[#302b5e] bg-[#171530] p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">Chi tiết người dùng</h3>
            <p className="mt-1 text-xs text-slate-400">Thông tin tài khoản và liên kết dịch vụ</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <img src={user.avatarUrl} alt={user.fullName} className="h-16 w-16 rounded-2xl object-cover" />
              <div>
                <div className="text-lg font-bold text-white">{user.fullName}</div>
                <div className="text-sm text-slate-400">{user.email}</div>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-4 rounded-2xl bg-[#0f0d23] p-4 text-sm">
              <div><dt className="text-slate-500">ID</dt><dd className="mt-1 font-semibold text-white">{user.id}</dd></div>
              <div><dt className="text-slate-500">Vai trò</dt><dd className="mt-1 font-semibold text-white">{user.role}</dd></div>
              <div><dt className="text-slate-500">Trạng thái</dt><dd className="mt-1 font-semibold text-white">{user.status}</dd></div>
              <div><dt className="text-slate-500">Đăng nhập qua</dt><dd className="mt-1 font-semibold text-white">{user.provider || "LOCAL"}</dd></div>
              <div className="col-span-2"><dt className="text-slate-500">Ngày đăng ký</dt><dd className="mt-1 font-semibold text-white">{formatDate(user.createdAt)}</dd></div>
            </dl>

            <div className="rounded-2xl border border-blue-900/30 bg-blue-950/20 p-4">
              <div className="flex items-center gap-2 font-bold text-blue-300">
                <MessageCircle size={17} />
                Liên kết Messenger
              </div>
              <div className="mt-3 text-sm text-slate-300">
                {user.messengerLinked ? (
                  <>
                    <p>Trạng thái: <strong className="text-emerald-400">Đã liên kết</strong></p>
                    <p className="mt-1">Nền tảng: {user.messengerPlatform || "MESSENGER"}</p>
                    <p className="mt-1">Liên kết lúc: {formatDate(user.messengerLinkedAt)}</p>
                  </>
                ) : (
                  <p className="text-slate-500">Chưa liên kết tài khoản Messenger.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}