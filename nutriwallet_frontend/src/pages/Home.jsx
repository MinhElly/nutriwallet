
const Home = () => {
  return (
    <div className="font-sans text-gray-900 bg-white selection:bg-green-500 selection:text-white">
      {/* 1. NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">NW</div>
              <span className="font-bold text-xl tracking-tight text-gray-900">NutriWallet AI</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
              <a href="#features" className="hover:text-green-600 transition">Features</a>
              <a href="#how-it-works" className="hover:text-green-600 transition">How It Works</a>
              <a href="#community" className="hover:text-green-600 transition">Community</a>
              <a href="#pricing" className="hover:text-green-600 transition">Pricing</a>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-sm font-medium text-gray-700 hover:text-green-600 transition">Login</button>
              <button className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-full flex items-center gap-1 transition shadow-sm shadow-green-200">
                Sign Up Free 
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
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

            {/* MOCKUP ĐIỆN THOẠI */}
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

      {/* 3. PROBLEM SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">Bạn đang gặp vấn đề này?</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-14">Hầu hết người trẻ đều gặp 3 vấn đề này mỗi tháng</p>
          
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="p-8 rounded-3xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-xl mb-6">👛</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Cháy túi cuối tháng</h3>
              <p className="text-gray-500 leading-relaxed text-sm">Không kiểm soát được chi phí ăn uống. Trà sữa, ăn hàng vô tội vạ khiến ví tiền báo động.</p>
            </div>
            <div className="p-8 rounded-3xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-xl mb-6">💛</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Tăng cân không kiểm soát</h3>
              <p className="text-gray-500 leading-relaxed text-sm">Ăn không theo kế hoạch, calo nạp vào vượt mức mà không hề hay biết do lười tính toán thủ công.</p>
            </div>
            <div className="p-8 rounded-3xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-xl mb-6">🕒</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Quên ghi chép thủ công</h3>
              <p className="text-gray-500 leading-relaxed text-sm">Các ứng dụng khác yêu cầu nhập tay quá phức tạp, dễ gây chán nản và bỏ cuộc chỉ sau vài ngày.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">Cách hoạt động</h2>
          <p className="text-lg text-gray-500 mb-16">5 bước đơn giản, tự động hoàn toàn</p>

          <div className="relative max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { step: 'Chụp ảnh', desc: 'Mở app, chụp bữa ăn', icon: '📷' },
              { step: 'AI Detect', desc: 'AI nhận diện tức thì', icon: '🤖' },
              { step: 'Nutrition', desc: 'Phân tích dinh dưỡng', icon: '🥗' },
              { step: 'Expense', desc: 'Ghi nhận chi phí tự động', icon: '💳' },
              { step: 'Insight', desc: 'Nhận gợi ý từ AI', icon: '🧠' }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center group">
                <div className="w-16 h-16 bg-green-500 text-white text-2xl rounded-2xl flex items-center justify-center shadow-md shadow-green-100 mb-4 transform group-hover:scale-105 transition">
                  {item.icon}
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">{item.step}</h4>
                <p className="text-xs text-gray-400 max-w-[120px] leading-tight">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FEATURES SECTION */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">Tính năng nổi bật</h2>
          <p className="text-lg text-gray-500 mb-16">Mọi thứ bạn cần để sống khỏe và tiết kiệm</p>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            {[
              { title: 'AI Food Recognition', desc: 'Nhận diện chính xác hàng nghìn món ăn Việt Nam & quốc tế chỉ từ một bức ảnh.', icon: '📷' },
              { title: 'Nutrition Tracking', desc: 'Theo dõi calories, protein, carbs, fat theo thời gian thực với biểu đồ chi tiết.', icon: '🔥' },
              { title: 'Expense Tracking', desc: 'Ghi nhận chi phí bữa ăn tự động, phân tích xu hướng chi tiêu theo tuần và tháng.', icon: '💰' },
              { title: 'Budget Alert', desc: 'Cảnh báo thông minh khi sắp vượt ngân sách, gợi ý điều chỉnh phù hợp.', icon: '🚨' },
              { title: 'Smart Insights', desc: 'AI phân tích thói quen ăn uống và chi tiêu, đưa ra lời khuyên cá nhân hóa.', icon: '🧠' },
              { title: 'Social Sharing', desc: 'Chia sẻ bữa ăn, tham gia thử thách, cạnh tranh trên leaderboard cộng đồng.', icon: '👥' }
            ].map((feat, index) => (
              <div key={index} className="p-8 rounded-3xl border border-gray-100 hover:border-green-100 bg-white shadow-sm hover:shadow-md transition">
                <span className="text-2xl">{feat.icon}</span>
                <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2">{feat.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIALS SECTION */}
      <section id="community" className="py-20 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight mb-16">Người dùng nói gì?</h2>
          
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex text-amber-400 gap-1 mb-4">★★★★★</div>
              <p className="text-gray-600 text-sm italic leading-relaxed mb-6">
                "NutriWallet AI đã giúp tôi tiết kiệm 800k/tháng và giảm 3kg chỉ trong 6 tuần. AI nhận diện chính xác đến kinh ngạc!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">NM</div>
                <div>
                  <h4 className="font-bold text-sm text-gray-800">Nguyễn Minh Anh</h4>
                  <span className="text-xs text-gray-400">UX Designer, 26 tuổi</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex text-amber-400 gap-1 mb-4">★★★★★</div>
              <p className="text-gray-600 text-sm italic leading-relaxed mb-6">
                "AI nhận diện phở bò, bánh cuốn hay cơm tấm đều cực chuẩn. Không cần ghi chép thủ công nữa, tiết kiệm 15 phút mỗi ngày."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">TT</div>
                <div>
                  <h4 className="font-bold text-sm text-gray-800">Trần Tuấn Kiệt</h4>
                  <span className="text-xs text-gray-400">Software Engineer, 28 tuổi</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex text-amber-400 gap-1 mb-4">★★★★★</div>
              <p className="text-gray-600 text-sm italic leading-relaxed mb-6">
                "Dashboard budget insight giúp tôi phát hiện mình tiêu 30% budget cho trà sữa 🥰 Giờ đã cắt giảm và mua được iPhone mới!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-sm">LT</div>
                <div>
                  <h4 className="font-bold text-sm text-gray-800">Lê Thu Hằng</h4>
                  <span className="text-xs text-gray-400">Marketing Manager, 24 tuổi</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CTA SECTION */}
      <section id="pricing" className="py-20 bg-slate-900 text-white relative overflow-hidden text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">Bắt đầu miễn phí ngay hôm nay</h2>
          <p className="text-gray-400 text-base sm:text-lg mb-10">Không cần thẻ tín dụng. Dùng thử 14 ngày đầy đủ tính năng.</p>
          
          <div className="flex flex-wrap justify-center items-center gap-4 mb-4">
            <button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 rounded-xl flex items-center gap-2 transition shadow-xl shadow-green-900/30">
              Tạo tài khoản miễn phí
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
            <button className="border border-gray-700 hover:border-gray-500 bg-transparent text-white font-semibold px-8 py-4 rounded-xl transition">
              Xem Demo
            </button>
          </div>
          <p className="text-xs text-gray-500">Tham gia cùng 50,000+ người dùng đang sử dụng NutriWallet AI</p>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-slate-950 text-gray-400 text-xs py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8 text-left">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs">NW</div>
                <span className="font-bold text-sm text-white tracking-tight">NutriWallet AI</span>
              </div>
              <p className="max-w-xs leading-relaxed">
                AI-powered nutrition and expense tracking for a healthier, wealthier life. Made with ❤️ in Vietnam.
              </p>
            </div>
            <div>
              <h5 className="font-semibold text-white uppercase tracking-wider mb-3 text-[10px]">Product</h5>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Changelog</a></li>
                <li><a href="#" className="hover:text-white transition">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-white uppercase tracking-wider mb-3 text-[10px]">Company</h5>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-white uppercase tracking-wider mb-3 text-[10px]">Legal</h5>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;