import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ScrollText, Search, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { fetchAdminActivities } from "../../services/dashboard.service";

const PAGE_SIZE = 20;

function formatAction(action) {
  if (action === "USER_STATUS_CHANGED") return "Thay đổi trạng thái người dùng";
  return action?.replaceAll("_", " ") || "Không xác định";
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "medium",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value));
}

export default function AuditLogTab() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [pageInfo, setPageInfo] = useState({ totalElements: 0, totalPages: 0 });
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchAdminActivities({ page, size: PAGE_SIZE }).then((result) => {
      if (!active) return;
      if (result.error) toast.error(result.error);
      const data = result.data || {};
      setLogs(data.content || []);
      setPageInfo({ totalElements: data.totalElements || 0, totalPages: data.totalPages || 0 });
      setLoading(false);
    });
    return () => { active = false; };
  }, [page]);

  const visibleLogs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return logs;
    return logs.filter((log) =>
      [log.actorEmail, log.targetEmail, log.action, log.details, log.id]
        .filter((value) => value !== null && value !== undefined)
        .some((value) => String(value).toLowerCase().includes(normalized)),
    );
  }, [logs, query]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="flex items-center gap-3 text-2xl font-extrabold text-white">
            <ScrollText className="text-purple-400" /> Nhật ký quản trị
          </h2>
          <p className="mt-1 text-sm text-slate-400">Lịch sử bất biến của các thao tác quản trị quan trọng.</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm trong trang hiện tại..." className="h-10 w-full rounded-xl border border-[#25214d] bg-[#171530] pl-10 pr-3 text-sm text-white outline-none focus:border-purple-500" />
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-[#25214d] bg-[#171530]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-[#25214d] bg-[#12102a] text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-4">Thời gian</th><th className="px-5 py-4">Người thực hiện</th><th className="px-5 py-4">Hành động</th><th className="px-5 py-4">Đối tượng</th><th className="px-5 py-4">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#25214d]/60">
              {loading ? (
                <tr><td colSpan="5" className="px-5 py-16 text-center text-slate-400">Đang tải nhật ký...</td></tr>
              ) : visibleLogs.length === 0 ? (
                <tr><td colSpan="5" className="px-5 py-16 text-center text-slate-500">Không có nhật ký phù hợp.</td></tr>
              ) : visibleLogs.map((log) => (
                <tr key={log.id} className="transition-colors hover:bg-[#1d193d]/50">
                  <td className="whitespace-nowrap px-5 py-4 text-slate-400">{formatDate(log.createdAt)}</td>
                  <td className="px-5 py-4"><span className="flex items-center gap-2 font-semibold text-slate-200"><ShieldCheck size={15} className="text-purple-400" />{log.actorEmail || `Admin #${log.actorUserId}`}</span></td>
                  <td className="px-5 py-4"><span className="rounded-full bg-purple-950/60 px-3 py-1 text-xs font-bold text-purple-300">{formatAction(log.action)}</span></td>
                  <td className="px-5 py-4 text-slate-300">{log.targetEmail || (log.targetUserId ? `User #${log.targetUserId}` : "—")}</td>
                  <td className="max-w-sm px-5 py-4 text-slate-400">{log.details || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#25214d] px-5 py-4 text-sm text-slate-400">
          <span>{pageInfo.totalElements} bản ghi · Trang {pageInfo.totalPages ? page + 1 : 0}/{pageInfo.totalPages}</span>
          <div className="flex gap-2">
            <button type="button" disabled={page === 0 || loading} onClick={() => { setLoading(true); setPage((value) => value - 1); }} className="rounded-xl border border-[#25214d] p-2 disabled:cursor-not-allowed disabled:opacity-40 hover:text-white"><ChevronLeft size={17} /></button>
            <button type="button" disabled={page + 1 >= pageInfo.totalPages || loading} onClick={() => { setLoading(true); setPage((value) => value + 1); }} className="rounded-xl border border-[#25214d] p-2 disabled:cursor-not-allowed disabled:opacity-40 hover:text-white"><ChevronRight size={17} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}