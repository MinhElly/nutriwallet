export default function SummaryCard({ title, value, trend, isImprovement, icon: Icon, iconBg = "bg-purple-950/40", iconColor = "text-purple-400" }) {
  return (
    <div className="rounded-[24px] border border-[#25214d] bg-[#171530] p-6 shadow-md transition-all hover:shadow-lg hover:border-purple-900/40">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${iconBg} ${iconColor}`}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-3xl font-black tracking-tight text-white">
          {value}
        </h3>
        <p className={`mt-2 flex items-center gap-1 text-xs font-semibold ${
          isImprovement ? "text-emerald-400" : "text-amber-500"
        }`}>
          <span>{trend}</span>
        </p>
      </div>
    </div>
  );
}
