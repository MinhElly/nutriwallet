import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChartColumnBig,
  CheckCircle2,
  Eye,
  EyeOff,
  HeartPulse,
  Lock,
  Mail,
  ShieldCheck,
  Sprout,
  User,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

function RegisterForm() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [healthScore, setHealthScore] = useState(0);
  const [growthScore, setGrowthScore] = useState(0);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const duration = 1200;
    const steps = 60;
    const healthTarget = 94.2;
    const growthTarget = 12.8;

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep += 1;

      const progress = currentStep / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setHealthScore(healthTarget * easeOut);
      setGrowthScore(growthTarget * easeOut);

      if (currentStep >= steps) {
        setHealthScore(healthTarget);
        setGrowthScore(growthTarget);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err?.message ?? "Lỗi đăng ký. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main
      className="h-screen w-full overflow-hidden bg-[#F8FAFC] px-2 py-2 text-[#0F172A]"
      style={{ fontFamily: "Inter, Manrope, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .intro-panel {
          background:
            radial-gradient(circle at 45% 18%, rgba(34, 197, 94, 0.13), transparent 28%),
            radial-gradient(circle at 72% 82%, rgba(34, 197, 94, 0.18), transparent 28%),
            linear-gradient(180deg, #F8FDF9 0%, #EFFAF4 100%);
        }

        @keyframes floating {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }

        .hero-image {
          animation: floating 5s ease-in-out infinite;
        }

        .btn-gradient {
          background: linear-gradient(135deg, #16A34A 0%, #22C55E 100%);
          transition: 0.25s ease;
        }

        .btn-gradient:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 36px -18px rgba(34, 197, 94, 0.6);
        }

        .input-transition {
          transition: 0.25s ease;
        }
      `}</style>

      <div className="relative flex h-full w-full overflow-hidden rounded-[26px] border border-[#E5E7EB] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="absolute left-4 top-4 z-10">
          <h2
            className="flex items-center gap-1.5 text-[14px] font-extrabold tracking-[-0.02em] text-[#16A34A]"
            style={{ fontFamily: "Psionic" }}
          >
            <Sprout size={18} strokeWidth={2.5} className="text-[#16A34A]" />
            NutriWallet AI
          </h2>
        </div>

        <section className="intro-panel hidden w-1/2 items-center justify-center lg:flex">
          <div className="flex w-full max-w-[420px] flex-col items-center text-center">
            <div className="hero-image h-[150px] w-[150px] overflow-hidden rounded-full bg-[#0C3B2B] shadow-[0_18px_42px_rgba(12,59,43,0.2)]">
              <img
                src="/salad-hero.png"
                alt="NutriWallet - Healthy Nutrition"
                className="h-full w-full object-cover"
              />
            </div>

            <h2 className="mt-4 text-[24px] font-extrabold tracking-[-0.03em] text-[#15803D]">
              Khỏe dáng - Khỏe ví
            </h2>

            <p className="mt-2 max-w-[390px] text-[12px] leading-5 text-[#475569]">
              Theo dõi dinh dưỡng, kiểm soát chi tiêu và phát triển tài chính cá
              nhân trên cùng một nền tảng thông minh.
            </p>

            <div className="mt-5 grid w-full grid-cols-2 gap-3">
              <MetricCard
                title="Chỉ số sức khỏe"
                value={`${healthScore.toFixed(1)}%`}
                desc="Tổng quan sức khỏe"
                variant="health"
              />

              <MetricCard
                title="Tăng trưởng tài sản"
                value={`+${growthScore.toFixed(1)}%`}
                desc="So với tháng trước"
                variant="growth"
              />
            </div>

            <div className="mt-5 grid w-full grid-cols-3 gap-3">
              <Feature
                icon={<ShieldCheck size={20} />}
                title="Bảo mật tuyệt đối"
                desc="Dữ liệu của bạn được mã hóa và bảo vệ."
              />
              <Feature
                icon={<ChartColumnBig size={20} />}
                title="Theo dõi thông minh"
                desc="Phân tích và gợi ý cá nhân hóa."
              />
              <Feature
                icon={<HeartPulse size={20} />}
                title="Sức khỏe toàn diện"
                desc="Chăm sóc sức khỏe và tài chính cùng nhau."
              />
            </div>
          </div>
        </section>

        <section className="flex w-full items-center justify-center bg-white px-8 py-8 lg:w-1/2">
          <div className="flex w-full max-w-[390px] flex-col justify-center py-2">
            <p className="mb-5 pt-1 text-right text-[12px] text-[#64748B]">
              Đã có tài khoản?{" "}
              <Link to="/login" className="cursor-pointer font-bold text-[#15803D]">
                Đăng nhập
              </Link>
            </p>

            <h1 className="flex items-center gap-2 text-[36px] font-extrabold tracking-[-0.04em] text-[#0F172A]">
              Đăng ký
              <Sprout size={26} strokeWidth={2.2} className="text-[#16A34A]" />
            </h1>

            <p className="mt-2 text-[13px] leading-5 text-[#64748B]">
              Tạo tài khoản để bắt đầu quản lý sức khỏe và tài chính của bạn
            </p>

            <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
              <Input
                label="Họ và tên"
                icon={<User size={18} />}
                placeholder="Nhập họ và tên"
                rightIcon={<CheckCircle2 size={18} />}
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                autoComplete="name"
              />

              <Input
                label="Email"
                icon={<Mail size={18} />}
                placeholder="Nhập email của bạn"
                type="email"
                rightIcon={<CheckCircle2 size={18} />}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />

              <div>
                <Input
                  label="Mật khẩu"
                  icon={<Lock size={18} />}
                  placeholder="Nhập mật khẩu"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="flex items-center justify-center text-[#64748B] hover:text-[#16A34A]"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                />

                <div className="mt-1.5 space-y-0.5 text-[11px] font-medium text-[#16A34A]">
                  <p>Ít nhất 8 ký tự</p>
                  <p>Bao gồm số hoặc ký hiệu</p>
                  <p>Bao gồm chữ hoa và chữ thường</p>
                </div>
              </div>

              <Input
                label="Nhập lại mật khẩu"
                icon={<Lock size={18} />}
                placeholder="Nhập lại mật khẩu"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                rightIcon={
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    className="flex items-center justify-center text-[#64748B] hover:text-[#16A34A]"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                }
              />

              {error && <p className="text-[12px] text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-gradient flex h-[42px] w-full items-center justify-center gap-2.5 rounded-[14px] text-[13px] font-bold text-white shadow-[0_16px_36px_-18px_rgba(34,197,94,0.7)] disabled:opacity-70"
              >
                Đăng ký
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

function Input({
  label,
  icon,
  placeholder,
  rightIcon,
  type = "text",
  value,
  onChange,
  autoComplete,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-semibold text-[#0F172A]">
        {label}
      </label>

      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]">
          {icon}
        </div>

        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className="input-transition h-[40px] w-full rounded-[14px] border border-[#E5E7EB] bg-white pl-11 pr-11 text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#16A34A] focus:outline-none focus:ring-4 focus:ring-[#DCFCE7]"
        />

        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#16A34A]">
          {rightIcon}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, desc, variant }) {
  return (
    <div className="rounded-[20px] bg-white/90 p-3.5 text-left shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
      <p className="text-[13px] font-bold tracking-wide text-slate-600">
        {title}
      </p>

      <p className="mt-2.5 text-[24px] font-extrabold leading-none text-[#16A34A]">
        {value}
      </p>

      <p className="mt-1.5 text-[12px] text-[#64748B]">{desc}</p>

      <svg
        className="mt-2 h-7 w-full text-[#16A34A]"
        viewBox="0 0 220 48"
        fill="none"
        aria-hidden="true"
      >
        <path
          d={
            variant === "health"
              ? "M2 38C18 40 22 25 36 28C50 31 58 18 72 21C86 24 94 14 106 18C120 22 126 40 138 11C148 -11 162 50 176 30C188 13 192 10 204 32"
              : "M2 36C18 38 26 30 38 31C50 32 58 25 72 26H102C116 26 124 22 134 10C142 1 150 23 160 18C170 14 172 5 182 8C194 12 206 1 218 0"
          }
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#DCFCE7] text-[#16A34A]">
        {icon}
      </div>
      <h3 className="text-[11px] font-bold text-[#166534]">{title}</h3>
      <p className="mt-1 text-[10px] leading-4 text-[#64748B]">{desc}</p>
    </div>
  );
}

export default RegisterForm;
