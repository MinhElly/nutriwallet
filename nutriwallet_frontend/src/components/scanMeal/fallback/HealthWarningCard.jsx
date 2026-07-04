import React from "react";
import { AlertTriangle, ShieldAlert, Info } from "lucide-react";

const SEVERITY_CONFIG = {
  High: {
    icon: ShieldAlert,
    colors: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400",
    iconColors: "text-rose-600 dark:text-rose-500",
  },
  Medium: {
    icon: AlertTriangle,
    colors: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400",
    iconColors: "text-amber-600 dark:text-amber-500",
  },
  Low: {
    icon: Info,
    colors: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-400",
    iconColors: "text-sky-600 dark:text-sky-500",
  },
};

export default function HealthWarningCard({ warnings }) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="text-center">
        <h3 className="text-lg font-bold text-slate-950 dark:text-white">
          Lưu ý sức khỏe
        </h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          AI nhận thấy một số cảnh báo dựa trên hồ sơ của bạn.
        </p>
      </div>

      <div className="space-y-3">
        {warnings.map((warning, idx) => {
          const config = SEVERITY_CONFIG[warning.severity] || SEVERITY_CONFIG.Low;
          const Icon = config.icon;

          return (
            <div
              key={idx}
              className={`flex items-start gap-3 rounded-2xl border p-4 ${config.colors}`}
            >
              <div className="mt-0.5 shrink-0">
                <Icon className={config.iconColors} size={20} />
              </div>
              <div>
                <h4 className="font-bold">{warning.title}</h4>
                <p className="mt-1 text-sm font-medium opacity-90">
                  {warning.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs font-medium text-slate-400 dark:text-slate-500">
        * Thông tin này chỉ mang tính chất tham khảo và không phải là lời khuyên y tế.
      </p>
    </div>
  );
}
