

import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section id="cta" className="py-20 bg-slate-900 text-white relative overflow-hidden text-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-10">Bắt đầu ngay hôm nay</h2>
        
        <div className="flex flex-wrap justify-center items-center gap-4 mb-4">
          <Link to="/register" className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 rounded-xl flex items-center gap-2 transition shadow-xl shadow-green-900/30">
            Tạo tài khoản
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>

        </div>
        <p className="text-xs text-gray-500">Tham gia cùng 50,000+ người dùng đang sử dụng NutriWallet AI</p>
      </div>
    </section>
  );
};

export default CTA;