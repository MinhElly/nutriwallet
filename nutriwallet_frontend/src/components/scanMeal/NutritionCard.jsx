export default function NutritionCard({
  icon: Icon,
  label,
  value,
  unit,
  color,
  className = "",
  compact = false,
}) {
  return (
    <div
      className={`min-w-0 rounded-2xl border border-slate-200 bg-white text-center shadow-sm shadow-slate-200/40 ${compact ? "p-3" : "p-4"} ${className}`}
    >
      <Icon
        className={`mx-auto ${compact ? "mb-2" : "mb-3"} ${color}`}
        size={compact ? 22 : 26}
        strokeWidth={2}
      />
      <p
        className={`break-words font-bold leading-tight text-slate-950 ${
          compact ? "text-[1.05rem] sm:text-[1.75rem]" : "text-xl sm:text-2xl"
        }`}
      >
        {value}
      </p>
      <p
        className={`font-semibold leading-tight text-slate-700 ${
          compact ? "mt-1 text-[11px] sm:text-xs" : "mt-1 text-sm"
        }`}
      >
        {unit}
      </p>
      <p
        className={`text-slate-500 ${compact ? "mt-1 text-[11px] leading-4 sm:text-xs" : "mt-1 text-xs leading-5"}`}
      >
        {label}
      </p>
    </div>
  );
}
