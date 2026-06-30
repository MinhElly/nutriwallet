import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  ArrowRight,
  HeartPulse,
  Wallet,
  PersonStanding,
  Sprout,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

import LoginFloatingCard from "./LoginFloatingCard";
import { requestPasswordReset } from "../../services/auth.service";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Vui lòng nhập địa chỉ email.");
      return;
    }

    setIsSubmitting(true);
    try {
      await requestPasswordReset(email.trim());
      setIsSuccess(true);
    } catch (err) {
      setError(err?.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main
      className="relative h-screen overflow-hidden bg-[#F0FDF4] text-[#0F172A]"
      style={{ fontFamily: "Inter, Manrope, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .page-bg {
          background:
            radial-gradient(circle at 50% 18%, rgba(34,197,94,.18), transparent 28%),
            radial-gradient(circle at 20% 75%, rgba(187,247,208,.75), transparent 32%),
            radial-gradient(circle at 80% 70%, rgba(187,247,208,.65), transparent 30%),
            linear-gradient(180deg, #F8FFFB 0%, #ECFDF5 52%, #F8FAFC 100%);
        }

        .cloud {
          position: absolute;
          width: 420px;
          height: 120px;
          background: rgba(255,255,255,.72);
          filter: blur(28px);
          border-radius: 999px;
        }

        .orbit {
          position: absolute;
          width: 760px;
          height: 760px;
          border: 1px solid rgba(34,197,94,.18);
          border-radius: 999px;
        }

        .orbit-2 {
          width: 580px;
          height: 580px;
          border-color: rgba(34,197,94,.12);
        }

        .login-card {
          background: rgba(255,255,255,.82);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
        }

        .btn-gradient {
          background: linear-gradient(135deg, #16A34A 0%, #22C55E 100%);
          transition: .25s ease;
        }

        .btn-gradient:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 35px -18px rgba(34,197,94,.75);
        }
      `}</style>

      <div className="page-bg absolute inset-0" />

      <div className="cloud left-[-80px] bottom-[120px]" />
      <div className="cloud right-[-120px] bottom-[150px]" />
      <div className="cloud left-[35%] bottom-[-40px] w-[620px]" />

      <div className="orbit left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
      <div className="orbit orbit-2 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />

      <header className="relative z-10 flex items-center gap-3 px-8 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#16A34A] text-xs font-extrabold text-white shadow-lg">
          NW
        </div>
        <span className="text-lg font-extrabold tracking-tight" style={{ fontFamily: "Psionic" }}>NutriWallet AI</span>
      </header>

      <section className="relative z-10 flex h-[calc(100vh-80px)] items-center justify-center px-4 pb-8">
        <LoginFloatingCard
          icon={<HeartPulse size={26} />}
          title="AI Score"
          value="94.2%"
          className="left-[14%] top-[35%] w-[160px]"
        />

        <LoginFloatingCard
          icon={<Wallet size={26} />}
          title="Budget"
          value="200.000đ"
          desc="/ ngày"
          className="left-[13%] bottom-[25%] w-[170px]"
        />

        <LoginFloatingCard
          icon={<HeartPulse size={26} />}
          title="Health Score"
          value="94.2%"
          className="right-[14%] top-[31%] w-[170px]"
        />

        <LoginFloatingCard
          icon={<PersonStanding size={26} />}
          title="Calories"
          value="1.500 kcal"
          desc="Hôm nay"
          className="right-[12%] bottom-[24%] w-[180px]"
        />

        <div className="absolute bottom-[7%] left-1/2 hidden h-[170px] w-[480px] -translate-x-1/2 rounded-[50%] bg-[#BBF7D0]/45 blur-2xl lg:block" />

        <div className="login-card relative w-full max-w-[420px] rounded-[30px] border border-white/80 px-9 py-8 shadow-[0_30px_100px_rgba(15,23,42,0.14)]">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/80 bg-white/80 text-[#16A34A] shadow-[0_16px_35px_rgba(15,23,42,0.12)]">
            <Sprout size={30} strokeWidth={2.4} />
          </div>

          <div className="text-center">
            <h1 className="text-[28px] font-extrabold tracking-[-0.03em] text-[#0F172A]">
              Khôi phục <span className="text-[#16A34A]">mật khẩu</span>
            </h1>
            <p className="mt-2 text-[15px] font-medium text-[#64748B]">
              Nhập email để nhận link đặt lại mật khẩu.
            </p>
          </div>

          {isSuccess ? (
            <div className="mt-8 text-center animate-in fade-in zoom-in duration-300">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Đã gửi link khôi phục</h3>
              <p className="text-sm text-gray-500 mb-6">
                Vui lòng kiểm tra hòm thư của <span className="font-semibold text-gray-700">{email}</span> để đặt lại mật khẩu của bạn.
              </p>
              <Link
                to="/login"
                className="btn-gradient flex h-[50px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl text-[15px] font-bold text-white transition-all hover:gap-3"
              >
                <ArrowLeft size={18} />
                Quay lại đăng nhập
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
              <div className="relative flex items-center">
                <Mail
                  className="absolute left-5 text-[#94A3B8]"
                  size={20}
                  strokeWidth={2}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Địa chỉ Email"
                  className="h-[56px] w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] pl-14 pr-5 text-[15px] font-semibold text-[#0F172A] outline-none transition-all placeholder:font-medium placeholder:text-[#94A3B8] focus:border-[#22C55E] focus:bg-white focus:ring-4 focus:ring-[#22C55E]/10"
                />
              </div>

              {error && (
                <p className="text-[13px] font-medium text-red-500 text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-gradient flex h-[50px] w-full mt-2 cursor-pointer items-center justify-center gap-3 rounded-2xl text-[15px] font-bold text-white disabled:opacity-70 transition-all hover:gap-4"
              >
                {isSubmitting ? "Đang xử lý..." : "Gửi link khôi phục"}
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          {!isSuccess && (
            <p className="mt-8 text-center text-[14px] text-[#64748B]">
              Nhớ mật khẩu rồi?{" "}
              <Link to="/login" className="font-bold text-[#16A34A] hover:underline">
                Đăng nhập
              </Link>
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
