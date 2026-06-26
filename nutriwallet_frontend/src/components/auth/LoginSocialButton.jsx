function LoginSocialButton({ icon, children }) {
  return (
    <button
      type="button"
      className="
        flex
        h-14
        w-full
        items-center
        justify-center
        gap-3
        rounded-2xl
        border
        border-[#E5E7EB]
        bg-white/80
        text-[15px]
        font-semibold
        text-[#0F172A]
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-[#22C55E]
        hover:shadow-lg
      "
    >
      {icon}
      {children}
    </button>
  );
}

export default LoginSocialButton;
