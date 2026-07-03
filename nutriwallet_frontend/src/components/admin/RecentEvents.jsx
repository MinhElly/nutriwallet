function describeActivity(activity) {
  const target = activity.targetEmail || `user #${activity.targetUserId}`;
  if (activity.action === "USER_STATUS_CHANGED") {
    return `${activity.actorEmail || "Admin"} đã đổi trạng thái ${target}: ${activity.details}`;
  }
  return `${activity.actorEmail || "Admin"} thực hiện ${activity.action}`;
}

function relativeTime(value) {
  if (!value) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "Vừa xong";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  return new Date(value).toLocaleDateString("vi-VN");
}

export default function RecentEvents({ events = [], loading = false }) {
  return (
    <div className="h-full rounded-[24px] border border-[#25214d] bg-[#171530] p-6 shadow-md">
      <h3 className="mb-6 text-base font-bold text-white">Hoạt động quản trị gần đây</h3>
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
        </div>
      ) : events.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-500">Chưa có hoạt động quản trị.</p>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="flex items-start justify-between gap-4 border-b border-[#25214d]/50 pb-4 last:border-0">
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-purple-400" />
                <span className="text-sm text-slate-300">{describeActivity(event)}</span>
              </div>
              <span className="shrink-0 text-[11px] font-semibold text-slate-500">
                {relativeTime(event.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}