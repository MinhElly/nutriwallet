import { useEffect, useState } from "react";
import { AlertCircle, Brain, Loader2, Salad, Users } from "lucide-react";
import toast from "react-hot-toast";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  fetchAdminActivities,
  fetchAdminDashboardOverview,
} from "../../services/dashboard.service";
import RecentEvents from "./RecentEvents";
import SummaryCard from "./SummaryCard";

const emptyOverview = {
  totalUsers: 0,
  activeUsers: 0,
  totalMeals: 0,
  totalAiAnalyses: 0,
  aiRequestsToday: 0,
  aiErrorRateToday: 0,
  pendingAiReports: 0,
  sevenDayTrend: [],
};

const trendConfig = [
  { key: "newUsers", label: "User mới", color: "#8b5cf6" },
  { key: "meals", label: "Bữa ăn", color: "#10b981" },
  { key: "aiRequests", label: "AI requests", color: "#3b82f6" },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="min-w-44 rounded-2xl border border-white/10 bg-[#120f28]/95 px-4 py-3 shadow-2xl backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <div className="mt-3 space-y-2">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-200">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span>{entry.name}</span>
            </div>
            <span className="font-semibold text-white">
              {Number(entry.value || 0).toLocaleString("vi-VN")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OverviewTab() {
  const [overview, setOverview] = useState(emptyOverview);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchAdminDashboardOverview(),
      fetchAdminActivities({ size: 8 }),
    ]).then(([overviewResult, activityResult]) => {
      if (!active) return;
      if (overviewResult.error) toast.error(overviewResult.error);
      if (activityResult.error) toast.error(activityResult.error);
      setOverview(overviewResult.data || emptyOverview);
      setActivities(activityResult.data?.content || []);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const trend = overview.sevenDayTrend.map((item) => ({
    ...item,
    day: new Date(`${item.date}T00:00:00`).toLocaleDateString("vi-VN", {
      weekday: "short",
    }),
  }));

  const trendTotals = trend.reduce(
    (result, item) => ({
      newUsers: result.newUsers + (item.newUsers || 0),
      meals: result.meals + (item.meals || 0),
      aiRequests: result.aiRequests + (item.aiRequests || 0),
    }),
    { newUsers: 0, meals: 0, aiRequests: 0 },
  );

  if (loading) {
    return (
      <div className="flex h-80 items-center justify-center text-purple-400">
        <Loader2 className="animate-spin" size={34} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Tổng quan hệ thống</h2>
          <p className="mt-1 text-sm text-slate-400">
            Dữ liệu cập nhật từ NutriWallet API • {new Date().toLocaleDateString("vi-VN")}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-emerald-900/30 bg-emerald-950/30 px-3 py-1.5 text-xs font-semibold text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Hệ thống đang hoạt động
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="Tổng người dùng" value={overview.totalUsers.toLocaleString("vi-VN")} trend={`${overview.activeUsers} đang hoạt động`} isImprovement icon={Users} />
        <SummaryCard title="Bữa ăn đã ghi nhận" value={overview.totalMeals.toLocaleString("vi-VN")} trend="Toàn hệ thống" isImprovement icon={Salad} iconColor="text-emerald-400" />
        <SummaryCard title="Lượt phân tích AI" value={overview.totalAiAnalyses.toLocaleString("vi-VN")} trend={`${overview.aiRequestsToday} lượt hôm nay`} isImprovement icon={Brain} iconColor="text-blue-400" />
        <SummaryCard title="Tỷ lệ lỗi AI hôm nay" value={`${overview.aiErrorRateToday}%`} trend={`${overview.pendingAiReports} báo cáo đang chờ`} isImprovement={overview.aiErrorRateToday === 0} icon={AlertCircle} iconColor="text-amber-400" />
      </div>

      <div className="overflow-hidden rounded-[28px] border border-[#25214d] bg-[#171530] shadow-md">
        <div className="border-b border-white/6 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(139,92,246,0.22),_transparent_32%),linear-gradient(180deg,_rgba(23,21,48,1)_0%,_rgba(18,16,40,1)_100%)] p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300">
                7 ngày gần nhất
              </span>
              <h3 className="mt-4 text-xl font-bold text-white">Nhịp tăng trưởng hệ thống</h3>
              <p className="mt-1 text-sm text-slate-400">
                Theo dõi user mới, bữa ăn được ghi nhận và số lượt phân tích AI theo từng ngày.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {trendConfig.map((item) => (
                <div
                  key={item.key}
                  className="min-w-40 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3"
                >
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.label}
                  </div>
                  <div className="mt-2 text-2xl font-black tracking-tight text-white">
                    {trendTotals[item.key].toLocaleString("vi-VN")}
                  </div>
                  <div className="text-xs text-slate-500">Tổng trong 7 ngày</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-5 flex flex-wrap gap-3">
            {trendConfig.map((item) => (
              <div
                key={item.key}
                className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-[#100e24] px-3 py-1.5 text-xs text-slate-300"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </div>
            ))}
          </div>

          <div className="h-[22rem]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} barCategoryGap="22%" margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="rgba(148,163,184,0.14)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} content={<CustomTooltip />} />
                <Bar name="User mới" dataKey="newUsers" fill="#8b5cf6" radius={[8, 8, 0, 0]} maxBarSize={22} />
                <Bar name="Bữa ăn" dataKey="meals" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={22} />
                <Bar name="AI requests" dataKey="aiRequests" fill="#3b82f6" radius={[8, 8, 0, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <RecentEvents events={activities} />
    </div>
  );
}
