import {
  Users,
  DollarSign,
  Brain,
  AlertCircle
} from "lucide-react";

// Import Custom Components
import SummaryCard from "./SummaryCard";
import RecentEvents from "./RecentEvents";

// Import Recharts
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function OverviewTab() {
  // Recharts Data
  const revenueData = [
    { name: "T8", revenue: 85, activeUsers: 420 },
    { name: "T9", revenue: 98, activeUsers: 450 },
    { name: "T10", revenue: 110, activeUsers: 540 },
    { name: "T11", revenue: 102, activeUsers: 520 },
    { name: "T12", revenue: 124, activeUsers: 640 },
    { name: "T1", revenue: 138, activeUsers: 680 },
  ];

  const planData = [
    { name: "Free", value: 68, color: "#5b5975" },
    { name: "Pro", value: 27, color: "#8b5cf6" },
    { name: "Business", value: 5, color: "#f59e0b" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Overview Title and Banner Status */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            System Overview
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Tổng quan hệ thống NutriWallet AI • 15/01/2024
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-emerald-950/30 border border-emerald-900/30 px-3 py-1.5 text-xs text-emerald-400 font-semibold w-fit">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span>All Systems Operational</span>
        </div>
      </div>

      {/* Stats Grid of 4 Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Users"
          value="50,284"
          trend="↗ +1,247 tuần này"
          isImprovement={true}
          icon={Users}
          iconBg="bg-purple-950/50"
          iconColor="text-purple-400"
        />
        <SummaryCard
          title="Monthly Revenue"
          value="138M đ"
          trend="↗ +11.3% vs tháng trước"
          isImprovement={true}
          icon={DollarSign}
          iconBg="bg-emerald-950/50"
          iconColor="text-emerald-400"
        />
        <SummaryCard
          title="AI Requests Today"
          value="12,847"
          trend="↗ +8.2% vs hôm qua"
          isImprovement={true}
          icon={Brain}
          iconBg="bg-blue-950/50"
          iconColor="text-blue-400"
        />
        <SummaryCard
          title="Error Rate"
          value="0.32%"
          trend="↘ ↓ 0.08% cải thiện"
          isImprovement={true}
          icon={AlertCircle}
          iconBg="bg-amber-950/50"
          iconColor="text-amber-400"
        />
      </div>

      {/* Charts Dashboard Layout */}
      <div className="space-y-6">
        
        {/* Chart 1: Revenue Composed Chart (Full Width) */}
        <div className="rounded-[24px] border border-[#25214d] bg-[#171530] p-6 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">
                Revenue 6 tháng gần nhất
              </h3>
              <span className="text-xs text-slate-400 block mt-1">
                Triệu đồng
              </span>
            </div>
            <span className="rounded-full bg-emerald-950/60 border border-emerald-900/40 px-3 py-1 text-xs font-bold text-emerald-400">
              +15% MoM
            </span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={revenueData}
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
                  domain={[0, 140]}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
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
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  fill="#8b5cf6"
                  radius={[6, 6, 0, 0]}
                  barSize={50}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="activeUsers"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#10b981", strokeWidth: 0 }}
                  activeDot={{ r: 7 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grid for Plan Distribution & Recent System Events */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          
          {/* Plan Distribution (Donut Chart) */}
          <div className="rounded-[24px] border border-[#25214d] bg-[#171530] p-6 shadow-md lg:col-span-7 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                Plan Distribution
              </h3>
              <span className="text-xs text-slate-400 block mb-6">
                Tỷ lệ phân bổ gói dịch vụ
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
              {/* Donut Pie */}
              <div className="h-44 w-44 flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {planData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `${value}%`}
                      contentStyle={{
                        backgroundColor: "#171530",
                        borderColor: "#25214d",
                        borderRadius: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center label */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white">68%</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Free</span>
                </div>
              </div>

              {/* Legend detail list */}
              <div className="space-y-3.5 w-full sm:w-auto min-w-[150px]">
                {planData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-slate-300 font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold text-white">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent System Events */}
          <div className="lg:col-span-5">
            <RecentEvents />
          </div>
        </div>

      </div>

    </div>
  );
}
