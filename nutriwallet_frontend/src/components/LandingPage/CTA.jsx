import { Link } from "react-router-dom";
import Reveal from "../common/Reveal";

const CTA = () => {
  return (
    <section id="cta" className="py-24 relative overflow-hidden" style={{background: 'linear-gradient(160deg, #1a2744 0%, #1e3a5f 50%, #162032 100%)'}}>
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[300px] bg-green-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-5 sm:px-8 text-center">
        {/* Label */}
        <Reveal delay={0}>
          <div className="inline-flex items-center gap-2 border border-green-500/30 bg-green-500/10 text-green-400 text-[10px] font-medium px-3 py-1.5 rounded-full mb-8 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Sẵn sàng để bắt đầu
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="text-5xl sm:text-[56px] font-normal tracking-[-0.04em] text-white leading-[0.95] mb-5">
            Bắt đầu ngay{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
              hôm nay.
            </span>
          </h2>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="text-gray-400 font-light text-[16px] leading-relaxed mb-10 max-w-lg mx-auto">
            Tham gia cùng 50,000+ người dùng đang dùng NutriWallet AI để sống khỏe hơn và tiết kiệm hơn mỗi ngày.
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <Link
            to="/register"
            className="inline-flex items-center gap-2.5 bg-green-500 hover:bg-green-400 text-white font-medium text-[15px] px-7 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-green-500/25 hover:shadow-green-400/30"
          >
            Tạo tài khoản
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </Reveal>

        {/* Subtle trust line */}
        <Reveal delay={0.4}>
          <p className="mt-5 text-xs text-white/30">
            Không cần thẻ tín dụng · Cài đặt trong 60 giây
          </p>
        </Reveal>
      </div>
    </section>
  );
};

export default CTA;