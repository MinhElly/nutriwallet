import { useState } from "react";
import {
  Bot,
  CheckCircle,
  Zap,
  RefreshCw
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

export default function AIConsoleTab() {
  // AI Console State Management
  const [retrainQueue, setRetrainQueue] = useState(23);
  const [correctCount, setCorrectCount] = useState(156);
  const [wrongCount, setWrongCount] = useState(23);
  const [pendingCount, setPendingCount] = useState(12);

  // Recognition Logs Data
  const [recognitionLogs, setRecognitionLogs] = useState([
    {
      id: 1,
      name: "Phở bò",
      confidence: "99.2%",
      correctness: "correct",
      aiGuess: 'AI: "Beef Pho Noodle Soup"',
      avatarUrl: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=150&auto=format&fit=crop&q=60"
    },
    {
      id: 2,
      name: "Bánh mì",
      confidence: "97.8%",
      correctness: "correct",
      aiGuess: 'AI: "Vietnamese Banh Mi"',
      avatarUrl: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=150&auto=format&fit=crop&q=60"
    },
    {
      id: 3,
      name: "Gỏi cuốn",
      confidence: "72.3%",
      correctness: "pending",
      aiGuess: 'AI: "Egg Rolls (incorrect)"',
      avatarUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=150&auto=format&fit=crop&q=60"
    },
    {
      id: 4,
      name: "Bún bò Huế",
      confidence: "88.4%",
      correctness: "correct",
      aiGuess: 'AI: "Hue Beef Noodle Soup"',
      avatarUrl: "https://images.unsplash.com/photo-1625398407796-82650a8c135f?w=150&auto=format&fit=crop&q=60"
    }
  ]);

  // Log Actions
  const handleApproveLog = (logId) => {
    setRecognitionLogs((prev) =>
      prev.map((log) => {
        if (log.id === logId) {
          if (log.correctness === "pending") {
            setPendingCount((c) => Math.max(0, c - 1));
            setCorrectCount((c) => c + 1);
          } else if (log.correctness === "wrong") {
            setWrongCount((c) => Math.max(0, c - 1));
            setCorrectCount((c) => c + 1);
          }
          return { ...log, correctness: "correct" };
        }
        return log;
      })
    );
    toast.success("Đã xác nhận kết quả nhận diện chính xác");
  };

  const handleRejectLog = (logId) => {
    setRecognitionLogs((prev) =>
      prev.map((log) => {
        if (log.id === logId) {
          if (log.correctness === "pending") {
            setPendingCount((c) => Math.max(0, c - 1));
            setWrongCount((c) => c + 1);
          } else if (log.correctness === "correct") {
            setCorrectCount((c) => Math.max(0, c - 1));
            setWrongCount((c) => c + 1);
          }
          return { ...log, correctness: "wrong" };
        }
        return log;
      })
    );
    toast.error("Đã từ chối và gắn nhãn kết quả nhận diện sai");
  };

  const handleRetrainLog = (logId) => {
    setRecognitionLogs((prev) =>
      prev.map((log) => {
        if (log.id === logId) {
          if (log.correctness === "pending") {
            setPendingCount((c) => Math.max(0, c - 1));
          } else if (log.correctness === "correct") {
            setCorrectCount((c) => Math.max(0, c - 1));
          } else if (log.correctness === "wrong") {
            setWrongCount((c) => Math.max(0, c - 1));
          }
          setRetrainQueue((q) => q + 1);
          return { ...log, correctness: "retrain" };
        }
        return log;
      })
    );
    toast.success("Đã đưa dữ liệu này vào hàng đợi huấn luyện lại");
  };

  const handleRetrainModel = () => {
    const toastId = toast.loading("Đang khởi tạo phiên làm việc với máy chủ GPU...");
    setTimeout(() => {
      toast.loading("Đang trích xuất dữ liệu gắn nhãn mới...", { id: toastId });
      setTimeout(() => {
        toast.loading("Đang huấn luyện lại mô hình ResNet-50 (Epoch 1/5)...", { id: toastId });
        setTimeout(() => {
          toast.success("Huấn luyện thành công! Phiên bản Model v2.4.2 đang trực tuyến.", {
            id: toastId,
            duration: 4000
          });
          setRetrainQueue(0);
        }, 2000);
      }, 1500);
    }, 1500);
  };

  // Recharts Data
  const aiPerformanceData = [
    { name: "T6", volume: 380, accuracy: 95.8 },
    { name: "T7", volume: 440, accuracy: 96.2 },
    { name: "CN", volume: 320, accuracy: 95.4 },
    { name: "T2", volume: 490, accuracy: 96.5 },
    { name: "T3", volume: 530, accuracy: 96.8 },
    { name: "T4", volume: 420, accuracy: 96.0 },
    { name: "T5", volume: 480, accuracy: 96.2 },
  ];

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
          value="12,847"
          trend="↗ Hoạt động ổn định"
          isImprovement={true}
          icon={Bot}
          iconBg="bg-purple-950/50"
          iconColor="text-purple-400"
        />
        <SummaryCard
          title="Success Rate"
          value="96.8%"
          trend="↗ Độ chính xác cao"
          isImprovement={true}
          icon={CheckCircle}
          iconBg="bg-emerald-950/50"
          iconColor="text-emerald-400"
        />
        <SummaryCard
          title="Avg Response"
          value="1.2s"
          trend="↗ Phản hồi nhanh chóng"
          isImprovement={true}
          icon={Zap}
          iconBg="bg-amber-950/50"
          iconColor="text-amber-400"
        />
        <SummaryCard
          title="Retrain Queue"
          value={retrainQueue.toString()}
          trend="↗ Cần huấn luyện bổ sung"
          isImprovement={retrainQueue > 0 ? false : true}
          icon={RefreshCw}
          iconBg="bg-blue-950/50"
          iconColor="text-blue-400"
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
              data={aiPerformanceData}
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
                domain={[92, 100]}
                label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10, offset: 0 }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, 600]}
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
          {recognitionLogs.map((log) => {
            const isPending = log.correctness === "pending";
            const isCorrect = log.correctness === "correct";
            const isWrong = log.correctness === "wrong";
            const isRetrain = log.correctness === "retrain";

            const isHighConfidence = parseFloat(log.confidence) >= 85;

            return (
              <div
                key={log.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-[#25214d]/50 bg-[#1f1c42]/20 p-4 transition-all duration-150 hover:bg-[#1f1b40]/30"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={log.avatarUrl}
                    alt={log.name}
                    className="h-12 w-12 rounded-2xl object-cover ring-2 ring-purple-600/30 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-bold text-white truncate">
                        {log.name}
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
                      {log.aiGuess}
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
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-950/40 border border-emerald-900/30 text-emerald-400">
                      <CheckCircle size={18} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
