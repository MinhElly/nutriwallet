import { Link } from "react-router-dom";
import Reveal from "../common/Reveal";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-white pt-20 pb-24 lg:pt-28 lg:pb-32">
      {/* Subtle background grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.045) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />
      {/* Green glow – top right */}
      <div className="pointer-events-none absolute -top-40 right-0 w-[600px] h-[600px] bg-green-400/10 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — copy */}
          <div className="max-w-xl">
            {/* Eyebrow badge */}
            <Reveal delay={0}>
              <div className="inline-flex items-center gap-2 border border-green-200 bg-green-50 text-green-700 text-[10px] font-medium px-3 py-1.5 rounded-full mb-8 tracking-widest uppercase">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                AI-Powered · Nhận diện món ăn
              </div>
            </Reveal>

            {/* Headline */}
            <Reveal delay={0.1}>
              <h1 className="text-5xl sm:text-[64px] font-normal tracking-[-0.04em] leading-[0.95] text-gray-950 mb-6">
                <span className="whitespace-nowrap">Chụp ảnh.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-400">
                  Hiểu ngay
                </span></span>
                <br />
                sức khỏe & ví tiền.
              </h1>
            </Reveal>

            {/* Sub-copy */}
            <Reveal delay={0.2}>
              <p className="text-[17px] text-gray-500 leading-[1.7] mb-10 font-light">
                AI phân tích món ăn, calories và chi tiêu chỉ trong vài giây.
                Một ứng dụng duy nhất cho cả dinh dưỡng lẫn ngân sách.
              </p>
            </Reveal>

            {/* CTA row */}
            <Reveal delay={0.3}>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-5 py-3 rounded-xl transition-all duration-200 shadow-md shadow-green-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Bắt đầu ngay
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-green-600 transition-colors duration-150 px-1"
                >
                  Đăng nhập
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Right — Phone mockup */}
          <Reveal delay={0.4} className="flex justify-center lg:justify-end relative">
            {/* Glow behind phone */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-green-400/20 rounded-full blur-3xl" />

            {/* Phone shell */}
            <div className="relative w-[280px] bg-gray-950 p-2.5 rounded-[48px] shadow-2xl border-2 border-gray-800">
              {/* Screen */}
              <div
                className="rounded-[38px] overflow-hidden px-4 pt-4 pb-5"
                style={{
                  background: "linear-gradient(160deg, #f0fdf4 0%, #dcfce7 100%)",
                  fontFamily: '"Geist", sans-serif',
                }}
              >
                {/* Status bar */}
                <div className="flex justify-between items-center text-[11px] font-semibold text-gray-500 mb-4 px-1">
                  <span>9:41</span>
                  <span>••• 100%</span>
                </div>

                {/* AI SCAN RESULT header */}
                <div className="text-center text-[10px] font-medium tracking-widest text-green-500 uppercase mb-4">
                  AI SCAN RESULT
                </div>

                {/* Dish card */}
                <div className="bg-white rounded-2xl p-3 flex items-center gap-3 mb-3 shadow-sm">
                  {/* Circular food image */}
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-orange-100 flex items-center justify-center text-2xl border-2 border-white shadow-sm">
                    🍜
                  </div>
                  <div>
                    <div className="font-medium tracking-tight text-gray-900 text-[13px] leading-tight">Phở bò đặc biệt</div>
                    <div className="text-green-500 text-[11px] font-medium mt-0.5">✓ 99.2% confidence</div>
                  </div>
                </div>

                {/* 2×2 stat grid */}
                <div className="grid grid-cols-2 gap-2.5 mb-3">
                  {[
                    { icon: "🔥", val: "540 kcal", label: "Calories" },
                    { icon: "💪", val: "34g",      label: "Protein" },
                    { icon: "🌾", val: "48g",      label: "Carbs" },
                    { icon: "💰", val: "65,000đ",  label: "Chi phí" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white rounded-2xl p-3 text-center shadow-sm">
                      <div className="text-xl mb-1">{s.icon}</div>
                      <div className="font-medium tracking-tight text-gray-900 text-[13px] leading-none">{s.val}</div>
                      <div className="text-[10px] font-medium text-gray-400 mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Health Score */}
                <div className="bg-white rounded-2xl px-3.5 py-3 mb-2.5 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[12px] font-bold text-gray-800">Health Score</span>
                    <span className="text-[12px] font-bold text-green-500">78/100</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="w-[78%] h-full bg-green-500 rounded-full" />
                  </div>
                </div>

                {/* Budget Impact */}
                <div className="bg-white rounded-2xl px-3.5 py-3 shadow-sm">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[13px]">💰</span>
                    <span className="text-[12px] font-bold text-gray-800">Budget Impact</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                    <div className="w-[32.5%] h-full bg-orange-400 rounded-full" />
                  </div>
                  <div className="text-[10px] text-gray-400">32.5% ngân sách ngày</div>
                </div>
              </div>
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
};

export default Hero;