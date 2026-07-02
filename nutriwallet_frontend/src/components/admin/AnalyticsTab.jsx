import { useState } from "react";
import {
  Download,
  FileText,
  Building,
  MapPin,
  Compass,
  Map
} from "lucide-react";
import toast from "react-hot-toast";

// Import Custom Components
import SummaryCard from "./SummaryCard";

// Import Recharts
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

export default function AnalyticsTab() {
  const [isExporting, setIsExporting] = useState(false);
  const [isPreparingReport, setIsPreparingReport] = useState(false);

  // User Growth Area Chart Data
  const userGrowthData = [
    { name: "T8", users: 380 },
    { name: "T9", users: 410 },
    { name: "T10", users: 510 },
    { name: "T11", users: 470 },
    { name: "T12", users: 580 },
    { name: "T1", users: 620 },
  ];

  // Action Triggers
  const handleExportPDF = () => {
    setIsExporting(true);
    const toastId = toast.loading("Đang kết xuất báo cáo và chuẩn bị định dạng PDF...");
    setTimeout(() => {
      toast.success("Báo cáo PDF đã được tải xuống thiết bị thành công!", {
        id: toastId,
        duration: 3000
      });
      setIsExporting(false);
    }, 2000);
  };

  const handleMonthlyReport = () => {
    setIsPreparingReport(true);
    const toastId = toast.loading("Đang tổng hợp dữ liệu doanh thu tháng...");
    setTimeout(() => {
      toast.success("Báo cáo phân tích tháng 01/2024 đã được tạo lập thành công!", {
        id: toastId,
        duration: 3000
      });
      setIsPreparingReport(false);
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Title & Top Right Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Reports & Analytics
          </h2>
          <p className="mt-1 text-sm text-slate-400 font-medium">
            Báo cáo tổng hợp hoạt động và doanh thu hệ thống
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="inline-flex items-center gap-2 rounded-xl border border-[#302b5e] hover:border-purple-500 bg-[#171530] px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
          >
            <Download size={14} />
            <span>Xuất PDF</span>
          </button>

          <button
            type="button"
            onClick={handleMonthlyReport}
            disabled={isPreparingReport}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:shadow-purple-600/40 transition-all cursor-pointer disabled:opacity-50"
          >
            <FileText size={14} />
            <span>Báo cáo tháng</span>
          </button>
        </div>
      </div>

      {/* 3 Stats Cards (Omit Icons to match design screenshots) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <SummaryCard
          title="MRR (Monthly Recurring Revenue)"
          value="138,400,000 đ"
          trend="+11.3% vs tháng trước"
          isImprovement={true}
        />
        <SummaryCard
          title="ARPU (Avg Revenue Per User)"
          value="74,800 đ"
          trend="+3.2% vs tháng trước"
          isImprovement={true}
        />
        <SummaryCard
          title="Churn Rate"
          value="2.1%"
          trend="-0.4% vs tháng trước"
          isImprovement={true} // decreasing Churn rate is good, hence isImprovement is true
        />
      </div>

      {/* User Growth Line/Area Chart */}
      <div className="rounded-[24px] border border-[#25214d] bg-[#171530] p-6 shadow-md">
        <h3 className="text-lg font-bold text-white mb-6">
          User Growth (6 tháng)
        </h3>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={userGrowthData}
              margin={{ top: 10, right: 20, bottom: 20, left: 10 }}
            >
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#25214d" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, 800]}
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
              <Area
                type="monotone"
                dataKey="users"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorUsers)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid for Revenue Breakdown & Region Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Revenue Breakdown Progress Panel */}
        <div className="rounded-[24px] border border-[#25214d] bg-[#171530] p-6 shadow-md lg:col-span-6 flex flex-col justify-between">
          <h3 className="text-lg font-bold text-white mb-6">
            Revenue Breakdown
          </h3>

          <div className="space-y-6">
            {/* Item 1 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-300">Pro Plan subscriptions</span>
                <span className="text-sm font-black text-white">89,200,000 đ</span>
              </div>
              <div className="w-full bg-[#201d41] rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: "65%" }} />
              </div>
              <span className="text-[10px] text-slate-400 font-medium block mt-1.5">65% tổng revenue</span>
            </div>

            {/* Item 2 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-300">Business Plan</span>
                <span className="text-sm font-black text-white">34,500,000 đ</span>
              </div>
              <div className="w-full bg-[#201d41] rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: "25%" }} />
              </div>
              <span className="text-[10px] text-slate-400 font-medium block mt-1.5">25% tổng revenue</span>
            </div>

            {/* Item 3 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-300">One-time purchases</span>
                <span className="text-sm font-black text-white">14,700,000 đ</span>
              </div>
              <div className="w-full bg-[#201d41] rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: "10%" }} />
              </div>
              <span className="text-[10px] text-slate-400 font-medium block mt-1.5">10% tổng revenue</span>
            </div>
          </div>
        </div>

        {/* Top Performing Regions Grid */}
        <div className="rounded-[24px] border border-[#25214d] bg-[#171530] p-6 shadow-md lg:col-span-6">
          <h3 className="text-lg font-bold text-white mb-6">
            Top Performing Regions
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Region 1: HCM */}
            <div className="rounded-2xl border border-[#2c2858]/60 bg-[#1f1b40]/25 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-950/40 text-purple-400">
                  <Building size={16} />
                </div>
                <span className="text-sm font-bold text-white">36.6%</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Hồ Chí Minh</h4>
                <div className="w-full bg-[#25214d] rounded-full h-1.5 mt-2">
                  <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: "36.6%" }} />
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">18,420 users</span>
              </div>
            </div>

            {/* Region 2: HN */}
            <div className="rounded-2xl border border-[#2c2858]/60 bg-[#1f1b40]/25 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-950/40 text-purple-400">
                  <Building size={16} />
                </div>
                <span className="text-sm font-bold text-white">28.4%</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Hà Nội</h4>
                <div className="w-full bg-[#25214d] rounded-full h-1.5 mt-2">
                  <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: "28.4%" }} />
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">14,280 users</span>
              </div>
            </div>

            {/* Region 3: DN */}
            <div className="rounded-2xl border border-[#2c2858]/60 bg-[#1f1b40]/25 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-950/40 text-purple-400">
                  <MapPin size={16} />
                </div>
                <span className="text-sm font-bold text-white">11.6%</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Đà Nẵng</h4>
                <div className="w-full bg-[#25214d] rounded-full h-1.5 mt-2">
                  <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: "11.6%" }} />
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">5,840 users</span>
              </div>
            </div>

            {/* Region 4: CT */}
            <div className="rounded-2xl border border-[#2c2858]/60 bg-[#1f1b40]/25 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-950/40 text-purple-400">
                  <Map size={16} />
                </div>
                <span className="text-sm font-bold text-white">6.4%</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Cần Thơ</h4>
                <div className="w-full bg-[#25214d] rounded-full h-1.5 mt-2">
                  <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: "6.4%" }} />
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">3,220 users</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
