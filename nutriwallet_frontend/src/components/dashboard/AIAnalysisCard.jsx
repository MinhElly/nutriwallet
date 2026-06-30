import { Bot, TrendingUp } from "lucide-react";
import { aiAnalysis } from "../../data/dashboardData";
import SectionCard from "./SectionCard";

export default function AIAnalysisCard() {
  return (
    <SectionCard title="Phân tích AI mới nhất" icon={TrendingUp} compact>
      <div className="grid h-full gap-2.5 lg:grid-cols-[52px_1fr]">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <Bot size={22} strokeWidth={1.9} />
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[13px] sm:text-sm">
          <span className="text-slate-500">Món đã phân tích</span>
          <b className="font-medium text-slate-900">{aiAnalysis.mealAnalyzed}</b>

          <span className="text-slate-500">Trạng thái</span>
          <span className="w-fit rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 sm:text-[11px]">
            {aiAnalysis.status}
          </span>

          <span className="text-slate-500">Mô hình</span>
          <b className="font-medium text-slate-900">{aiAnalysis.model}</b>

          <span className="text-slate-500">Loại đầu vào</span>
          <b className="font-medium text-slate-900">{aiAnalysis.inputType}</b>

          <span className="text-slate-500">Thời gian tạo</span>
          <b className="font-medium text-slate-900">{aiAnalysis.createdAt}</b>
        </div>
      </div>
    </SectionCard>
  );
}
