export default function SectionCard({
  title,
  icon: Icon,
  iconClass = "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
  compact = false,
  children,
}) {
  return (
    <section
      className={`group flex h-full min-h-0 flex-col rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900 ${
        compact ? "p-3.5" : "p-4"
      }`}
    >
      <div
        className={`flex items-center justify-between gap-3 ${
          compact ? "mb-2.5" : "mb-3"
        }`}
      >
        <div
          className={`flex min-w-0 items-center ${
            compact ? "gap-2" : "gap-2.5"
          }`}
        >
          {Icon && (
            <div
              className={`flex shrink-0 items-center justify-center rounded-xl ${iconClass} ${
                compact ? "h-6 w-6" : "h-7 w-7"
              }`}
            >
              <Icon size={compact ? 14 : 16} strokeWidth={1.9} />
            </div>
          )}

          <h3
            className={`truncate font-semibold text-slate-900 dark:text-slate-100 ${
              compact ? "text-[15px]" : "text-base"
            }`}
          >
            {title}
          </h3>
        </div>

        <button
          type="button"
          className={`shrink-0 cursor-pointer font-medium text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 ${
            compact ? "text-[10px]" : "text-[11px]"
          }`}
        >
          Xem tất cả
        </button>
      </div>

      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}
