import { useEffect, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Eye,
  Search,
  Loader2,
  Calendar,
  User as UserIcon,
  BookOpen,
  MessageSquare,
  Sparkles
} from "lucide-react";
import toast from "react-hot-toast";
import {
  fetchAiFailedLogs,
  fetchAiErrorReports,
  updateAiErrorReportStatus
} from "../../services/aiLog.service";

export default function AiErrorLogsTab() {
  const [activeSubTab, setActiveSubTab] = useState("system-errors");
  const [failedLogs, setFailedLogs] = useState([]);
  const [errorReports, setErrorReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedError, setSelectedError] = useState(null); // for detail modal

  const loadData = async () => {
    setLoading(true);
    try {
      const [failedRes, reportsRes] = await Promise.all([
        fetchAiFailedLogs(),
        fetchAiErrorReports()
      ]);

      setFailedLogs(failedRes || []);
      setErrorReports(reportsRes || []);
    } catch (err) {
      toast.error(err.message || "Không thể tải dữ liệu lỗi AI");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (reportId, newStatus) => {
    const toastId = toast.loading("Đang cập nhật trạng thái...");
    try {
      const res = await updateAiErrorReportStatus(reportId, newStatus);
      toast.success(res.message || "Cập nhật trạng thái thành công!", { id: toastId });
      setErrorReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
      );
      if (selectedError && selectedError.id === reportId) {
        setSelectedError((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      toast.error(err.message || "Cập nhật thất bại", { id: toastId });
    }
  };

  // Filter Logic
  const filteredSystemErrors = failedLogs.filter((log) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (log.userEmail || "").toLowerCase().includes(searchLower) ||
      (log.inputText || "").toLowerCase().includes(searchLower) ||
      (log.errorMessage || "").toLowerCase().includes(searchLower) ||
      (log.modelName || "").toLowerCase().includes(searchLower)
    );
  });

  const filteredReports = errorReports.filter((report) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      (report.userEmail || "").toLowerCase().includes(searchLower) ||
      (report.reason || "").toLowerCase().includes(searchLower) ||
      (report.description || "").toLowerCase().includes(searchLower);

    if (statusFilter === "ALL") return matchesSearch;
    return matchesSearch && report.status === statusFilter;
  });

  // Date Formatting helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getReasonLabel = (reason) => {
    switch (reason) {
      case "SYSTEM_ERROR":
        return "Lỗi hệ thống AI";
      case "WRONG_FOOD_NAME":
        return "Sai tên món ăn";
      case "WRONG_NUTRITION":
        return "Sai lượng calo/dinh dưỡng";
      case "WRONG_PRICE":
        return "Sai giá ước lượng";
      case "CHATBOT_FEEDBACK_ERROR":
        return "Chatbot Messenger phản hồi lỗi";
      case "OTHER":
      default:
        return reason || "Lý do khác";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Nhật ký lỗi AI
          </h2>
          <p className="mt-1 text-sm text-slate-400 font-medium">
            Quản lý lỗi hệ thống AI và các báo cáo chất lượng từ người dùng
          </p>
        </div>

        {/* Sub-Tab Controls */}
        <div className="flex items-center gap-1 rounded-2xl border border-[#25214d] bg-[#171530] p-1">
          <button
            type="button"
            onClick={() => {
              setActiveSubTab("system-errors");
              setSearchQuery("");
            }}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "system-errors"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Lỗi hệ thống AI ({failedLogs.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveSubTab("error-reports");
              setSearchQuery("");
            }}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "error-reports"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Báo cáo từ người dùng ({errorReports.length})
          </button>
        </div>
      </div>

      {/* Search & Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#171530] border border-[#25214d] rounded-2xl p-4">
        {/* Search */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={
              activeSubTab === "system-errors"
                ? "Tìm lỗi hệ thống..."
                : "Tìm báo cáo lỗi..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-xl border border-[#25214d] bg-[#0c0a1e] pl-10 pr-4 text-xs text-white placeholder-slate-400 outline-none transition-all focus:border-purple-500"
          />
        </div>

        {/* Filters for Error Reports */}
        {activeSubTab === "error-reports" && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-bold shrink-0">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-[#25214d] bg-[#0c0a1e] px-3 text-xs text-white outline-none focus:border-purple-500 cursor-pointer w-full sm:w-auto"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ duyệt (PENDING)</option>
              <option value="REVIEWED">Đã xem (REVIEWED)</option>
              <option value="RESOLVED">Đã giải quyết (RESOLVED)</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#171530]/50 border border-[#25214d]/50 rounded-[24px]">
          <Loader2 className="h-10 w-10 text-purple-500 animate-spin mb-4" />
          <p className="text-sm text-slate-400 font-bold">Đang tải nhật ký lỗi AI...</p>
        </div>
      ) : activeSubTab === "system-errors" ? (
        /* System Errors Table View */
        <div className="rounded-[24px] border border-[#25214d] bg-[#171530] overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#25214d] bg-[#0c0a1e]/40 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Người dùng</th>
                  <th className="py-4 px-6">Loại Input</th>
                  <th className="py-4 px-6">Dữ liệu đầu vào / URL</th>
                  <th className="py-4 px-6">Nội dung lỗi</th>
                  <th className="py-4 px-6">Thời gian</th>
                  <th className="py-4 px-6 text-center">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#25214d]/50">
                {filteredSystemErrors.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400 text-sm font-semibold">
                      Không tìm thấy lỗi hệ thống nào.
                    </td>
                  </tr>
                ) : (
                  filteredSystemErrors.map((logItem) => (
                    <tr
                      key={logItem.id}
                      className="hover:bg-[#1f1c42]/20 text-slate-200 text-xs transition-colors"
                    >
                      <td className="py-4 px-6 font-bold text-slate-400">#{logItem.id}</td>
                      <td className="py-4 px-6 font-semibold">{logItem.userEmail}</td>
                      <td className="py-4 px-6">
                        <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[10px] font-extrabold uppercase">
                          {logItem.inputType}
                        </span>
                      </td>
                      <td className="py-4 px-6 max-w-xs truncate">
                        {logItem.inputType === "IMAGE" || logItem.inputType === "IMAGE_AND_TEXT" ? (
                          <div className="flex items-center gap-2">
                            {logItem.inputImageUrl && (
                              <img
                                src={logItem.inputImageUrl}
                                alt="AI input"
                                className="h-8 w-8 rounded object-cover border border-[#25214d] shrink-0"
                              />
                            )}
                            <span className="truncate">{logItem.inputText || "Ảnh quét thực phẩm"}</span>
                          </div>
                        ) : (
                          logItem.inputText
                        )}
                      </td>
                      <td className="py-4 px-6 max-w-sm truncate text-rose-400 font-mono">
                        {logItem.errorMessage}
                      </td>
                      <td className="py-4 px-6 text-slate-400">{formatDate(logItem.createdAt)}</td>
                      <td className="py-4 px-6 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedError({ ...logItem, isSystemError: true })}
                          className="p-2 rounded-xl bg-purple-950/40 hover:bg-purple-600 border border-purple-900/30 text-purple-400 hover:text-white transition-all cursor-pointer inline-flex items-center justify-center"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* User Error Reports Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReports.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-[#171530] border border-[#25214d] rounded-[24px] text-slate-400 text-sm font-semibold">
              Không tìm thấy báo cáo lỗi AI nào.
            </div>
          ) : (
            filteredReports.map((report) => {
              const isPending = report.status === "PENDING";
              const isReviewed = report.status === "REVIEWED";
              const isResolved = report.status === "RESOLVED";

              return (
                <div
                  key={report.id}
                  className="rounded-[24px] border border-[#25214d] bg-[#171530] p-6 space-y-4 hover:border-purple-500/50 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-black text-slate-400">#{report.id}</span>
                          <span className="rounded-full bg-purple-950/60 border border-purple-900/30 px-3 py-0.5 text-[10px] font-black text-purple-300">
                            {getReasonLabel(report.reason)}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-medium block">
                          Tạo bởi: {report.userEmail}
                        </span>
                      </div>

                      {/* Status Badges */}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-950/60 border border-amber-900/30 px-3 py-1 text-[10px] font-extrabold text-amber-400 uppercase">
                          <AlertTriangle size={10} /> Pending
                        </span>
                      )}
                      {isReviewed && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-950/60 border border-blue-900/30 px-3 py-1 text-[10px] font-extrabold text-blue-400 uppercase">
                          <AlertCircle size={10} /> Reviewed
                        </span>
                      )}
                      {isResolved && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/60 border border-emerald-900/30 px-3 py-1 text-[10px] font-extrabold text-emerald-400 uppercase">
                          <CheckCircle size={10} /> Resolved
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-200 line-clamp-3 bg-[#0c0a1e]/40 border border-[#25214d]/40 rounded-xl p-3 font-medium min-h-[4.5rem]">
                      {report.description || "Không có mô tả chi tiết lỗi."}
                    </p>

                    {/* Meta info */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-bold pt-2 border-t border-[#25214d]/50">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-500" />
                        <span>{formatDate(report.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 justify-end">
                        {report.mealRecordId && (
                          <span className="bg-indigo-950/40 border border-indigo-900/20 text-indigo-400 px-2 py-0.5 rounded">
                            Bữa ăn: #{report.mealRecordId}
                          </span>
                        )}
                        {report.aiAnalysisLogId && (
                          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                            Log: #{report.aiAnalysisLogId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 justify-end pt-4 border-t border-[#25214d]/50">
                    <button
                      type="button"
                      onClick={() => setSelectedError({ ...report, isSystemError: false })}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-600 border border-purple-900/30 px-3 py-1.5 text-[11px] font-bold text-purple-400 hover:text-white transition-all cursor-pointer"
                    >
                      <Eye size={12} /> Chi tiết
                    </button>

                    {!isResolved && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(report.id, "RESOLVED")}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-600 border border-emerald-900/30 px-3 py-1.5 text-[11px] font-bold text-emerald-400 hover:text-white transition-all cursor-pointer"
                      >
                        Giải quyết
                      </button>
                    )}
                    {isPending && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(report.id, "REVIEWED")}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-950/40 hover:bg-blue-600 border border-blue-900/30 px-3 py-1.5 text-[11px] font-bold text-blue-400 hover:text-white transition-all cursor-pointer"
                      >
                        Đã xem
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-[28px] border border-[#25214d] bg-[#120f26] p-6 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <AlertCircle className="text-purple-400" />
                  <span>
                    Chi tiết {selectedError.isSystemError ? "lỗi hệ thống" : "báo cáo lỗi"} #{selectedError.id}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-semibold">
                  Tạo lúc: {formatDate(selectedError.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedError(null)}
                className="h-8 w-8 rounded-full bg-[#1e1a3d] hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4">
              {/* User Email Info */}
              <div className="flex items-center gap-2 text-xs font-semibold bg-[#171530] border border-[#25214d] p-3 rounded-2xl">
                <UserIcon size={14} className="text-slate-400" />
                <span className="text-slate-400">Email:</span>
                <span className="text-slate-200">{selectedError.userEmail}</span>
              </div>

              {/* Specific for User Reports */}
              {!selectedError.isSystemError && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#171530] border border-[#25214d] rounded-2xl text-xs space-y-1">
                      <span className="text-slate-400 font-bold">Lý do báo cáo:</span>
                      <p className="font-extrabold text-purple-400">{getReasonLabel(selectedError.reason)}</p>
                    </div>
                    <div className="p-3 bg-[#171530] border border-[#25214d] rounded-2xl text-xs space-y-1">
                      <span className="text-slate-400 font-bold">Trạng thái:</span>
                      <p className="font-extrabold uppercase text-slate-200">{selectedError.status}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                      Mô tả chi tiết từ người dùng
                    </h4>
                    <p className="text-xs text-slate-200 bg-[#0c0a1e] border border-[#25214d] rounded-2xl p-4 font-medium leading-relaxed whitespace-pre-wrap">
                      {selectedError.description || "Không có mô tả chi tiết."}
                    </p>
                  </div>
                </>
              )}

              {/* Specific for System Errors */}
              {selectedError.isSystemError && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-[#171530] border border-[#25214d] rounded-2xl text-xs space-y-1">
                      <span className="text-slate-400 font-bold">Loại dữ liệu:</span>
                      <p className="font-extrabold text-purple-400">{selectedError.inputType}</p>
                    </div>
                    <div className="p-3 bg-[#171530] border border-[#25214d] rounded-2xl text-xs space-y-1">
                      <span className="text-slate-400 font-bold">Mô hình AI:</span>
                      <p className="font-extrabold text-slate-200">{selectedError.modelName || "N/A"}</p>
                    </div>
                    <div className="p-3 bg-[#171530] border border-[#25214d] rounded-2xl text-xs space-y-1">
                      <span className="text-slate-400 font-bold">Input Text:</span>
                      <p className="font-extrabold text-slate-200 truncate">{selectedError.inputText || "N/A"}</p>
                    </div>
                  </div>

                  {selectedError.inputImageUrl && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Ảnh quét AI đầu vào:</span>
                      <div className="relative rounded-2xl overflow-hidden border border-[#25214d] max-h-48 w-fit">
                        <img
                          src={selectedError.inputImageUrl}
                          alt="AI Input Image"
                          className="h-full max-h-48 object-contain"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                      Thông tin lỗi chi tiết (Stack Trace)
                    </h4>
                    <pre className="text-[10px] text-rose-300 font-mono bg-[#0c0a1e] border border-[#25214d] rounded-2xl p-4 overflow-x-auto whitespace-pre leading-normal max-h-60">
                      {selectedError.errorMessage}
                    </pre>
                  </div>
                </>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-[#25214d]/50">
              <button
                type="button"
                onClick={() => setSelectedError(null)}
                className="rounded-xl bg-[#1e1a3d] border border-[#25214d] px-4 py-2 text-xs font-bold text-slate-300 hover:text-white cursor-pointer transition-colors"
              >
                Đóng
              </button>
              {!selectedError.isSystemError && selectedError.status !== "RESOLVED" && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedError.id, "RESOLVED")}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  Đánh dấu đã giải quyết
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
