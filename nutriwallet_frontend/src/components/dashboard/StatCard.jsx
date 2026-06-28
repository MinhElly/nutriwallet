export default function StatCard({
  title,
  icon: Icon,
  iconClass = "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
  children,
}) {
  return (
    <div className="group h-full rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 xl:p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-3">
        {Icon && (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${iconClass}`}
          >
            <Icon size={21} strokeWidth={1.9} />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          {children}
        </div>
      </div>
    </div>
  );
}
