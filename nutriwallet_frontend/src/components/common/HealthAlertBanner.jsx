import { useState } from "react";
import { AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const SEVERITY_CONFIG = {
  danger: {
    bg: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900/50",
    icon: AlertTriangle,
    iconColor: "text-red-600 dark:text-red-400",
    titleColor: "text-red-800 dark:text-red-300",
    detailColor: "text-red-700 dark:text-red-400",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300",
    label: "Nguy hiểm",
  },
  warning: {
    bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50",
    icon: AlertCircle,
    iconColor: "text-amber-600 dark:text-amber-400",
    titleColor: "text-amber-800 dark:text-amber-300",
    detailColor: "text-amber-700 dark:text-amber-400",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300",
    label: "Lưu ý",
  },
  info: {
    bg: "bg-sky-50 border-sky-200 dark:bg-sky-950/30 dark:border-sky-900/50",
    icon: Info,
    iconColor: "text-sky-600 dark:text-sky-400",
    titleColor: "text-sky-800 dark:text-sky-300",
    detailColor: "text-sky-700 dark:text-sky-400",
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300",
    label: "Thông tin",
  },
};

/**
 * HealthAlertBanner
 * Component cảnh báo sức khoẻ dùng chung cho Profile và Scan Meal.
 *
 * @param {Object} props
 * @param {Array} props.alerts - Mảng cảnh báo từ getHealthAlerts()
 * @param {"compact"|"full"} props.variant - compact = scan meal, full = profile
 * @param {string} [props.className]
 */
export default function HealthAlertBanner({ alerts = [], variant = "compact", className = "" }) {
  const [isExpanded, setIsExpanded] = useState(() =>
    variant === "full" || alerts.some((alert) => alert.severity === "danger"),
  );

  if (!alerts || alerts.length === 0) return null;

  const dangerCount = alerts.filter((a) => a.severity === "danger").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;

  // Sắp xếp: danger trước, warning sau, info cuối
  const sortedAlerts = [...alerts].sort((a, b) => {
    const order = { danger: 0, warning: 1, info: 2 };
    return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
  });

  // Header màu theo severity cao nhất
  const hasAnyDanger = dangerCount > 0;
  const headerBg = hasAnyDanger
    ? "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900/50"
    : "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50";
  const headerIconColor = hasAnyDanger
    ? "text-red-600 dark:text-red-400"
    : "text-amber-600 dark:text-amber-400";
  const headerTitleColor = hasAnyDanger
    ? "text-red-800 dark:text-red-300"
    : "text-amber-800 dark:text-amber-300";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`rounded-2xl border overflow-hidden ${headerBg} ${className}`}
      role="alert"
      aria-live="polite"
      aria-label={`${alerts.length} cảnh báo sức khoẻ cho món ăn này`}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 cursor-pointer text-left"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2.5">
          <ShieldAlert size={18} className={headerIconColor} aria-hidden="true" />
          <span className={`text-sm font-semibold ${headerTitleColor}`}>
            {alerts.length} cảnh báo sức khoẻ
          </span>
          {dangerCount > 0 && (
            <span className="rounded-full bg-red-100 dark:bg-red-900/60 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:text-red-300">
              {dangerCount} nguy hiểm
            </span>
          )}
          {warningCount > 0 && (
            <span className="rounded-full bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
              {warningCount} lưu ý
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp size={16} className={headerIconColor} aria-hidden="true" />
        ) : (
          <ChevronDown size={16} className={headerIconColor} aria-hidden="true" />
        )}
      </button>

      {/* Alert List */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="alert-list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2.5">
              {sortedAlerts.map((alert) => {
                const cfg = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.info;
                const AlertIcon = cfg.icon;
                return (
                  <div
                    key={alert.id}
                    className={`rounded-xl border p-3.5 ${cfg.bg}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg flex-shrink-0 mt-0.5" aria-hidden="true">
                        {alert.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-sm font-semibold ${cfg.titleColor}`}>
                            {alert.title}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 ${cfg.badge}`}>
                            {cfg.label}
                          </span>
                        </div>
                        <p className={`text-xs leading-relaxed ${cfg.detailColor}`}>
                          {alert.detail}
                        </p>
                      </div>
                      <AlertIcon size={14} className={`flex-shrink-0 mt-1 ${cfg.iconColor}`} aria-hidden="true" />
                    </div>
                  </div>
                );
              })}

              {/* Disclaimer */}
              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed pt-1">
                ⚠️ Cảnh báo dựa trên hồ sơ sức khoẻ cá nhân của bạn. Không thay thế tư vấn y tế chuyên nghiệp.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
