import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import {
  ShieldCheck,
  HeartPulse,
  ChartColumnBig,
  Sprout,
  Leaf,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

function RegisterForm() {
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();
  const [healthScore, setHealthScore] = useState(0);
  const [growthScore, setGrowthScore] = useState(0);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const duration = 1200;
    const steps = 60;
    const healthTarget = 94.2;
    const growthTarget = 12.8;

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;

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

  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsSubmitting(true);
      setError("");
      try {
        await loginWithGoogle(tokenResponse.access_token);
        navigate("/dashboard", { replace: true });
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || "Lỗi đăng nhập Google.");
      } finally {
        setIsSubmitting(false);
      }
    },
    onError: () => {
      setError("Đăng ký bằng Google thất bại.");
    },
  });



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
      `}</style>

      <div className="flex h-full w-full overflow-hidden rounded-[26px] border border-[#E5E7EB] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] relative">
        <div className="absolute top-4 left-4 z-10">
          <h2 className="text-[14px] font-extrabold tracking-[-0.02em] text-[#16A34A] flex items-center gap-1.5" style={{ fontFamily: "Psionic" }}>
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#16A34A] text-white shadow-sm">
              <Leaf size={14} strokeWidth={2} />
            </div>
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
              <Link
                to="/login"
                className="cursor-pointer font-bold text-[#15803D]"
              >
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

            {error && (
              <p className="mt-5 text-[13px] text-red-500">{error}</p>
            )}

            <div className="mt-8 space-y-3">
              <button
                type="button"
                onClick={() => triggerGoogleLogin()}
                disabled={isSubmitting}
                className="flex h-[50px] w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white text-[14px] font-semibold text-[#0F172A] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#22C55E] hover:bg-[#F8FAFC] hover:shadow-lg disabled:opacity-50"
              >
                <GoogleIcon />
                Tiếp tục với Google
              </button>
            </div>

          </div>
        </section>
      </div>
    </main>
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

function GoogleIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}



export default RegisterForm;
