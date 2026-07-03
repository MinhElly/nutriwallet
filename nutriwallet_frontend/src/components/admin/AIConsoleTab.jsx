  import { useState, useEffect } from "react";
import {
  Bot,
  CheckCircle,
  Zap,
  RefreshCw,
  AlertTriangle,
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";

// Import Custom Components
import SummaryCard from "./SummaryCard";

// Import Recharts
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

// Import API Services
import {
  fetchAiConsoleStats,
  fetchAiConsolePerformance,
  fetchAiConsoleLogs,
  updateAiLogEvaluation,
  triggerModelRetrain
} from "../../services/aiLog.service";

export default function AIConsoleTab() {
  // AI Console State Management
  const [stats, setStats] = useState({
    totalRequestsToday: 0,
    successRate: 100.0,
    avgResponseTime: 0.0,
    failedRequestsToday: 0
  });
  const [performanceData, setPerformanceData] = useState([]);
  const [recognitionLogs, setRecognitionLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic counts for status label counters
  const correctCount = recognitionLogs.filter((log) => log.evaluationStatus === "CORRECT").length;
  const wrongCount = recognitionLogs.filter((log) => log.evaluationStatus === "INCORRECT").length;
  const pendingCount = recognitionLogs.filter((log) => log.evaluationStatus === "PENDING").length;

  const loadStats = async () => {
    try {
      const data = await fetchAiConsoleStats();
      setStats(data || {
        totalRequestsToday: 0,
        successRate: 100.0,
        avgResponseTime: 0.0,
        failedRequestsToday: 0
      });
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải số liệu thống kê AI");
    }
  };

  const loadPerformance = async () => {
    try {
      const data = await fetchAiConsolePerformance();
      setPerformanceData(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải dữ liệu hiệu suất biểu đồ");
    }
  };

  const loadLogs = async () => {
    try {
      const data = await fetchAiConsoleLogs();
      setRecognitionLogs(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải nhật ký AI");
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([loadStats(), loadPerformance(), loadLogs()]);
    setLoading(false);
  };

  useEffect(() => {
    // Initial API hydration is intentionally performed once on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Log Actions
  const handleApproveLog = async (logId) => {
    try {
      await updateAiLogEvaluation(logId, "CORRECT");
      toast.success("Đã xác nhận kết quả nhận diện chính xác");
      setRecognitionLogs((prev) =>
        prev.map((log) => (log.id === logId ? { ...log, evaluationStatus: "CORRECT" } : log))
      );
      loadStats();
    } catch (err) {
      toast.error(err.message || "Đánh giá thất bại");
    }
  };

  const handleRejectLog = async (logId) => {
    try {
      await updateAiLogEvaluation(logId, "INCORRECT");
      toast.error("Đã từ chối và gắn nhãn kết quả nhận diện sai");
      setRecognitionLogs((prev) =>
        prev.map((log) => (log.id === logId ? { ...log, evaluationStatus: "INCORRECT" } : log))
      );
      loadStats();
    } catch (err) {
      toast.error(err.message || "Đánh giá thất bại");
    }
  };

  const handleRetrainLog = async (logId) => {
    try {
      await updateAiLogEvaluation(logId, "RETRAIN");
      toast.success("Đã đưa dữ liệu này vào hàng đợi huấn luyện lại");
      setRecognitionLogs((prev) =>
        prev.map((log) => (log.id === logId ? { ...log, evaluationStatus: "RETRAIN" } : log))
      );
      loadStats();
    } catch (err) {
      toast.error(err.message || "Đánh giá thất bại");
    }
  };

  const handleRetrainModel = async () => {
    const toastId = toast.loading("Đang kết nối tới máy chủ GPU...");
    try {
      await triggerModelRetrain();
      setTimeout(() => {
        toast.loading("Đang chuẩn bị dữ liệu huấn luyện bổ sung...", { id: toastId });
        setTimeout(() => {
          toast.loading("Đang huấn luyện lại mô hình (Epoch 1/5)...", { id: toastId });
          setTimeout(() => {
            toast.success("Huấn luyện hoàn tất! Phiên bản Model mới đang trực tuyến.", {
              id: toastId,
              duration: 4000
            });
            loadAllData();
          }, 2000);
        }, 1500);
      }, 1500);
    } catch (err) {
      toast.error(err.message || "Huấn luyện thất bại", { id: toastId });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[400px] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-purple-500 mb-2" />
        <span className="text-slate-400 font-medium text-sm">Đang tải dữ liệu AI Console...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Titles and Control Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            AI Console
          </h2>
          <p className="mt-1 text-sm text-slate-400 font-medium">
            Giám sát và quản lý hệ thống AI nhận diện thực phẩm
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-emerald-950/30 border border-emerald-900/30 px-3 py-1.5 text-xs text-emerald-400 font-semibold w-fit">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Model v2.4.1 Online</span>
          </div>

          <button
            type="button"
            onClick={handleRetrainModel}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:shadow-purple-600/40 transition-all cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Retrain Model</span>
          </button>
        </div>
      </div>

      {/* Stat Cards of 4 Columns */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="AI Requests Hôm Nay"
          value={stats.totalRequestsToday.toLocaleString()}
          trend="↗ Hoạt động ổn định"
          isImprovement={true}
          icon={Bot}
          iconBg="bg-purple-950/50"
          iconColor="text-purple-400"
        />
        <SummaryCard
          title="Success Rate"
          value={stats.successRate.toFixed(1) + "%"}
          trend={stats.successRate >= 90 ? "↗ Độ chính xác cao" : "↘ Cần cải thiện"}
          isImprovement={stats.successRate >= 90}
          icon={CheckCircle}
          iconBg="bg-emerald-950/50"
          iconColor="text-emerald-400"
        />
        <SummaryCard
          title="Avg Response"
          value={stats.avgResponseTime.toFixed(1) + "s"}
          trend="↗ Phản hồi nhanh chóng"
          isImprovement={true}
          icon={Zap}
          iconBg="bg-amber-950/50"
          iconColor="text-amber-400"
        />
        <SummaryCard
          title="Failed / Error Requests"
          value={stats.failedRequestsToday.toLocaleString()}
          trend={stats.failedRequestsToday > 0 ? "⚠️ Cần kiểm tra hệ thống" : "✓ Hoạt động ổn định"}
          isImprovement={stats.failedRequestsToday === 0}
          icon={AlertTriangle}
          iconBg="bg-rose-950/50"
          iconColor="text-rose-400"
        />
      </div>

      {/* Composed Chart: Hiệu suất AI (7 ngày) */}
      <div className="rounded-[24px] border border-[#25214d] bg-[#171530] p-6 shadow-md">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">
            Hiệu suất AI (7 ngày)
          </h3>
          <span className="text-xs text-slate-400 block mb-6">
            Accuracy % và volume requests
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={performanceData}
              margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
            >
              <CartesianGrid stroke="#25214d" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="left"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10, offset: -5 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, 'auto']}
                label={{ value: 'Requests', angle: 90, position: 'insideRight', fill: '#64748b', fontSize: 10, offset: 0 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#171530",
                  borderColor: "#25214d",
                  borderRadius: "16px",
                  color: "#fff",
                }}
                itemStyle={{ fontSize: 13 }}
                labelStyle={{ fontWeight: "bold", marginBottom: 4 }}
              />
              <Bar
                yAxisId="right"
                dataKey="volume"
                fill="#8b5cf6"
                radius={[6, 6, 0, 0]}
                barSize={40}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="accuracy"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 5, fill: "#10b981", strokeWidth: 0 }}
                activeDot={{ r: 7 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recognition Logs to Review list */}
      <div className="rounded-[24px] border border-[#25214d] bg-[#171530] p-6 shadow-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className="text-lg font-bold text-white">
            Recognition Logs cần review
          </h3>
          
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-full bg-emerald-950/80 border border-emerald-800/30 px-3 py-1 text-xs font-bold text-emerald-400">
              Đúng: {correctCount}
            </span>
            <span className="rounded-full bg-rose-950/80 border border-rose-800/30 px-3 py-1 text-xs font-bold text-rose-400">
              Sai: {wrongCount}
            </span>
            <span className="rounded-full bg-amber-950/80 border border-amber-800/30 px-3 py-1 text-xs font-bold text-amber-400">
              Pending: {pendingCount}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {recognitionLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Bot size={48} className="mb-3 text-slate-600 animate-pulse" />
              <p className="text-sm font-medium">Chưa có nhật ký AI nào được ghi nhận</p>
            </div>
          ) : (
            recognitionLogs.map((log) => {
              const isPending = log.evaluationStatus === "PENDING";
              const isCorrect = log.evaluationStatus === "CORRECT";
              const isWrong = log.evaluationStatus === "INCORRECT";
              const isRetrain = log.evaluationStatus === "RETRAIN";

              const isHighConfidence = parseFloat(log.confidence) >= 85;
              const imageUrl = log.inputImageUrl || "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=150&auto=format&fit=crop&q=60";

              return (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-[#25214d]/50 bg-[#1f1c42]/20 p-4 transition-all duration-150 hover:bg-[#1f1b40]/30"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={imageUrl}
                      alt={log.foodName}
                      className="h-12 w-12 rounded-2xl object-cover ring-2 ring-purple-600/30 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-bold text-white truncate">
                          {log.foodName}
                        </h4>
                        
                        {/* Confidence Badge */}
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          isHighConfidence
                            ? "bg-emerald-950/60 text-emerald-400"
                            : "bg-rose-950/60 text-rose-400"
                        }`}>
                          {log.confidence}
                        </span>

                        {/* Status Badge */}
                        {isCorrect && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 text-[10px] font-extrabold text-emerald-400">
                            ✓ Correct
                          </span>
                        )}
                        {isWrong && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-950/40 border border-rose-900/30 px-2 py-0.5 text-[10px] font-extrabold text-rose-400">
                            ✗ Wrong
                          </span>
                        )}
                        {isRetrain && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-950/40 border border-blue-900/30 px-2 py-0.5 text-[10px] font-extrabold text-blue-400">
                            ↻ In Queue
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-950/40 border border-amber-900/30 px-2 py-0.5 text-[10px] font-extrabold text-amber-400">
                            ? Pending
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-medium block mt-1">
                        Model: {log.modelName || "Gemini"} | User: {log.userEmail || "Anonymous"} | {new Date(log.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {isPending || isRetrain ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleApproveLog(log.id)}
                          className="inline-flex items-center rounded-xl bg-emerald-950/30 hover:bg-emerald-600 border border-emerald-900/30 px-4 py-2 text-xs font-bold text-emerald-400 hover:text-white transition-all cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectLog(log.id)}
                          className="inline-flex items-center rounded-xl bg-rose-950/30 hover:bg-rose-600 border border-rose-900/30 px-4 py-2 text-xs font-bold text-rose-400 hover:text-white transition-all cursor-pointer"
                        >
                          Reject
                        </button>
                        {!isRetrain && (
                          <button
                            type="button"
                            onClick={() => handleRetrainLog(log.id)}
                            className="inline-flex items-center rounded-xl bg-amber-950/30 hover:bg-amber-600 border border-amber-900/30 px-4 py-2 text-xs font-bold text-amber-400 hover:text-white transition-all cursor-pointer"
                            title="Add to Retrain Queue"
                          >
                            Retrain
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1f1c42]/20 border border-[#25214d]/50 text-emerald-400">
                        {isCorrect && <CheckCircle size={18} />}
                        {isWrong && <span className="text-rose-400 font-bold text-sm">✗</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
