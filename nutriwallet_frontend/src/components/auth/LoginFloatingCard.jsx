function LoginFloatingCard({ icon, title, value, desc, className = "" }) {
  return (
    <div
      className={`absolute hidden rounded-2xl border border-white/70 bg-white/80 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:block ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#DCFCE7] text-[#16A34A]">
          {icon}
        </div>

        <div>
          <p className="text-sm font-medium text-[#64748B]">{title}</p>
          <p className="text-xl font-extrabold text-[#16A34A]">{value}</p>
          {desc && <p className="text-sm text-[#64748B]">{desc}</p>}
        </div>
      </div>
    </div>
  );
}

export default LoginFloatingCard;
