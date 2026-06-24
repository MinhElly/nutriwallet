import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Wallet, ArrowRight } from "lucide-react";

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState("");

  const focusColor = "#16A34A";
  const iconColor = "#A7B7A7";

  return (
    <main
      className="min-h-screen flex flex-col md:flex-row min-h-screen w-full bg-[#f7f9fb] text-[#191c1e] overflow-x-hidden"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .glass-panel { background: rgba(255, 255, 255, 0.4); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.3); }
        .btn-gradient { background: linear-gradient(135deg, #006e2f 0%, #22c55e 100%); transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .btn-gradient:hover { transform: scale(1.02); box-shadow: 0 10px 20px -5px rgba(0, 110, 47, 0.3); }
        .glass-btn { background: rgba(255, 255, 255, 0.7); border: 1px solid rgba(15, 23, 42, 0.1); backdrop-filter: blur(10px); transition: transform 0.2s ease, background 0.2s ease; }
        .glass-btn:hover { transform: scale(1.02); background: rgba(255, 255, 255, 0.9); }
        .input-focus:focus { outline: none; border-color: #16A34A; box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.08); }
        .animate-float { animation: float 5s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
      `}</style>

      <section className="hidden md:flex relative w-full md:w-1/2 p-8 lg:p-12 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#F6FBF8] to-[#EAF7F0]" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#006e2f]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#6ffbbe]/20 rounded-full blur-3xl" />

        <div className="relative z-10 w-full max-w-[580px] max-w-[80%] glass-panel rounded-[24px] flex flex-col items-center justify-center p-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
          <div className="mb-8 animate-float">
            <div className="relative h-56 w-56 lg:h-64 lg:w-64 rounded-full bg-white/40 border border-white/60 shadow-xl overflow-hidden flex items-center justify-center mx-auto">
              <img
                className="object-cover w-full h-full"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9AppvjATilmcMiuYEM2mvW26Fc8NrpdCJNqXJCUOimy1EWZWUs2sapk1CURkwp2bV2xgDutUexoEWJ4TMXUvD2ppVw-IkWK0jNiMRiq3XlagVttfKOft-gmgmtf15wx00VtHnyZfYK1yccBy9stNaCqbV_r5htP6nyRr7RHaUi05jGUbMT7pXRMIY63gPYw1iJPgOkp3_hZGLF0rLThFBEk70bo-R2a2Sh3HXOOjyOrKJ4PeNzhj692Qxp5QsIe46eyVjvhtWDGU"
                alt="A vibrant salad on a digital glass plate with a wealth chart"
              />
            </div>
          </div>

          <h2 className="text-[38px] font-bold text-[#006e2f] mb-4">
            Khỏe dáng - Khỏe ví
          </h2>
          <p className="text-[18px] leading-7 text-[#3d4a3d] max-w-sm mx-auto">
            Theo dõi dinh dưỡng, kiểm soát chi tiêu và phát triển tài chính cá
            nhân trên cùng một nền tảng thông minh.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 w-full">
            <div className="p-4 bg-white/50 rounded-[18px] border border-white/80 flex flex-col items-start shadow-sm">
              <span className="text-[12px] uppercase tracking-wider text-[#6d7b6c]">
                Chỉ số sức khỏe
              </span>
              <span className="mt-3 text-[32px] font-bold text-[#006e2f]">
                94.2%
              </span>
            </div>
            <div className="p-4 bg-white/50 rounded-[18px] border border-white/80 flex flex-col items-start shadow-sm">
              <span className="text-[12px] uppercase tracking-wider text-[#6d7b6c]">
                Tăng trưởng tài sản
              </span>
              <span className="mt-3 text-[32px] font-bold text-[#006c49]">
                +12.8%
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col w-full md:w-1/2 bg-[#f7f9fb] justify-center items-center p-6 md:p-10 relative">
        <div className="absolute top-4 left-8 md:fixed z-50">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-[#006e2f] flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12 flex-shrink-0">
              <Wallet className="text-white" size={18} />
            </div>
            <span className="text-xl font-bold text-[#006e2f] whitespace-nowrap">
              NutriWallet AI
            </span>
          </div>
        </div>

        <div className="w-full max-w-[440px] space-y-8 mt-10 md:mt-0">
          <div className="space-y-4">
            <h1 className="text-[52px] font-bold tracking-tight text-[#191c1e]">
              Chào mừng bạn trở lại 👋
            </h1>
            <p className="text-[18px] text-[#3d4a3d] leading-7">
              Đăng nhập để tiếp tục theo dõi sức khỏe và quản lý tài chính thông
              minh cùng NutriWallet AI.
            </p>
          </div>

          <button
            type="button"
            className="w-full h-[56px] rounded-[14px] border border-[#D9E3DA] bg-white text-[#191c1e] font-medium shadow-sm transition hover:bg-[#FAFAFA] flex items-center justify-center gap-3"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
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
            Tiếp tục bằng Google
          </button>

          <div className="relative flex items-center py-3">
            <div className="flex-1 border-t border-[#bccbb9]"></div>
            <span className="flex-shrink mx-4 text-[13px] uppercase tracking-[0.24em] text-[#6d7b6c]">
              hoặc email
            </span>
            <div className="flex-1 border-t border-[#bccbb9]"></div>
          </div>

          <form
            className="space-y-5"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="space-y-2">
              <label
                className="text-[14px] font-medium text-[#6d7b6c] block"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  color={focusedInput === "email" ? focusColor : iconColor}
                />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="email@example.com"
                  className="w-full h-[56px] rounded-[14px] border border-[#D9E3DA] bg-white px-4 pl-12 text-[#191c1e] transition focus:border-[#16A34A] focus:outline-none focus:ring-4 focus:ring-[#16A34A]/10"
                  onFocus={() => setFocusedInput("email")}
                  onBlur={() => setFocusedInput("")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                className="text-[14px] font-medium text-[#6d7b6c] block"
                htmlFor="password"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  color={focusedInput === "password" ? focusColor : iconColor}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full h-[56px] rounded-[14px] border border-[#D9E3DA] bg-white px-4 pl-12 pr-12 text-[#191c1e] transition focus:border-[#16A34A] focus:outline-none focus:ring-4 focus:ring-[#16A34A]/10"
                  onFocus={() => setFocusedInput("password")}
                  onBlur={() => setFocusedInput("")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6d7b6c] hover:text-[#006e2f] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-[#3d4a3d]">
                <input
                  className="h-4 w-4 rounded border-[#D9E3DA] text-[#16A34A] focus:ring-[#16A34A]"
                  type="checkbox"
                />
                Ghi nhớ mật khẩu
              </label>
              <a
                className="text-[#006e2f] font-semibold hover:text-[#004b1e] transition-colors"
                href="#"
              >
                Quên mật khẩu?
              </a>
            </div>

            <button
              type="submit"
              className="w-full h-[60px] rounded-[14px] btn-gradient text-white text-[18px] font-bold shadow-lg shadow-[#006e2f]/15 transition-transform duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Đăng nhập
              <ArrowRight size={20} />
            </button>
          </form>

          <footer className="text-center pt-4">
            <p className="text-sm text-[#6d7b6c]">
              Chưa có tài khoản?{" "}
              <a
                className="text-[#006e2f] font-bold hover:underline ml-1"
                href="#"
              >
                Đăng ký
              </a>
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}

export default LoginForm;
