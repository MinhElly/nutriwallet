
const Hero = () => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-green-50/50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-6">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              AI-Powered · Miễn phí 14 ngày
            </span>
            <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tight leading-[1.15] mb-6">
              Chụp một bức ảnh. Hiểu cả <span className="text-green-500">sức khỏe</span> và <span className="text-green-500">ví tiền.</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              AI phân tích món ăn, calories và chi tiêu chỉ trong vài giây. Theo dõi dinh dưỡng và ngân sách trong một ứng dụng duy nhất.
            </p>
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3.5 rounded-xl flex items-center gap-2 transition shadow-lg shadow-green-200">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0110 5.653h4a2.31 2.31 0 013.173.522l.144.195a.3.3 0 00.417.065A4.122 4.122 0 0121.75 10.5v6A4.125 4.125 0 0117.625 20.75h-11.25A4.125 4.125 0 012.25 16.5v-6a4.122 4.122 0 013.361-4.062.3.3 0 00.417-.065l.144-.195z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
                Scan Meal ngay
              </button>
              <button className="group flex items-center gap-2 text-gray-700 hover:text-green-600 font-semibold px-5 py-3.5 transition">
                <span className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-green-200 group-hover:bg-green-50 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-4 h-4 text-gray-600 group-hover:text-green-600">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                Watch Demo
              </button>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">✓ Free 14-day trial</span>
              <span className="flex items-center gap-1">✓ Không cần thẻ tín dụng</span>
              <span className="flex items-center gap-1">✓ Hủy bất kỳ lúc nào</span>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center relative">
            <div className="w-[320px] bg-slate-950 p-3 rounded-[48px] shadow-2xl border-4 border-slate-900 relative z-10">
              <div className="bg-white rounded-[38px] overflow-hidden px-4 pt-6 pb-4 text-xs font-sans">
                <div className="flex justify-between font-bold text-[10px] mb-4 text-gray-400">
                  <span>9:41</span>
                  <span>••• 100%</span>
                </div>
                <div className="text-center font-bold text-green-500 tracking-wider text-[10px] mb-4">AI SCAN RESULT</div>
                <div className="bg-gray-50 p-3 rounded-2xl flex items-center gap-3 border border-gray-100 mb-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-lg">🍜</div>
                  <div>
                    <div className="font-bold text-gray-800 text-sm">Phở bò đặc biệt</div>
                    <div className="text-green-500 text-[10px] font-medium">✓ 99.2% confidence</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-gray-50 p-2.5 rounded-xl text-center border border-gray-100">
                    <span className="text-base">🔥</span>
                    <div className="font-bold text-gray-800 mt-1">540 kcal</div>
                    <span className="text-[10px] text-gray-400">Calories</span>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-xl text-center border border-gray-100">
                    <span className="text-base">💪</span>
                    <div className="font-bold text-gray-800 mt-1">34g</div>
                    <span className="text-[10px] text-gray-400">Protein</span>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-xl text-center border border-gray-100">
                    <span className="text-base">🌾</span>
                    <div className="font-bold text-gray-800 mt-1">48g</div>
                    <span className="text-[10px] text-gray-400">Carbs</span>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-xl text-center border border-gray-100">
                    <span className="text-base">💰</span>
                    <div className="font-bold text-gray-800 mt-1">65,000đ</div>
                    <span className="text-[10px] text-gray-400">Chi phí</span>
                  </div>
                </div>
                <div className="border border-gray-100 p-3 rounded-xl mb-2">
                  <div className="flex justify-between font-bold mb-1">
                    <span className="text-gray-700">Health Score</span>
                    <span className="text-green-600">78/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="w-[78%] h-full bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="border border-gray-100 p-3 rounded-xl bg-gray-50/50">
                  <div className="font-bold text-gray-700 mb-1 flex items-center gap-1">💰 Budget Impact</div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1">
                    <div className="w-[32.5%] h-full bg-orange-400 rounded-full"></div>
                  </div>
                  <div className="text-[10px] text-gray-500">32.5% ngân sách ngày</div>
                </div>
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-green-200/40 rounded-full blur-3xl -z-0"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;