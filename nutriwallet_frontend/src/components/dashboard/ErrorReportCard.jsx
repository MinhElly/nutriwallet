import { AlertTriangle, Search } from "lucide-react";
import { aiErrorReport } from "../../data/dashboardData";
import SectionCard from "./SectionCard";

export default function ErrorReportCard() {
  return (
    <SectionCard
      title="Lỗi AI gần đây"
      icon={AlertTriangle}
      iconClass="bg-red-50 text-red-500"
    >
      <div className="grid h-full grid-cols-[1fr_64px] items-center gap-3">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
          <span className="text-slate-500">Loại lỗi</span>
          <b className="font-medium text-slate-900">{aiErrorReport.errorType}</b>

          <span className="text-slate-500">Loại đầu vào</span>
          <b className="font-medium text-slate-900">{aiErrorReport.inputType}</b>

          <span className="text-slate-500">Thời gian tạo</span>
          <b className="font-medium text-slate-900">{aiErrorReport.createdAt}</b>

          <span className="text-slate-500">Ghi chú</span>
          <b className="font-medium text-slate-900">{aiErrorReport.note}</b>
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <Search size={24} strokeWidth={1.9} />
        </div>
      </div>
    </SectionCard>
  );
}
