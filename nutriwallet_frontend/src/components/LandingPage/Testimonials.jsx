import Reveal from "../common/Reveal";

const reviews = [
  {
    name: "Nguyễn Minh Anh",
    role: "UX Designer, 26 tuổi",
    initials: "NM",
    color: "from-emerald-400 to-green-500",
    quote:
      "NutriWallet AI đã giúp tôi tiết kiệm 800k/tháng và giảm 3kg chỉ trong 6 tuần. AI nhận diện chính xác đến kinh ngạc!",
  },
  {
    name: "Trần Tuấn Kiệt",
    role: "Software Engineer, 28 tuổi",
    initials: "TT",
    color: "from-green-400 to-teal-500",
    quote:
      "AI nhận diện phở bò, bánh cuốn hay cơm tấm đều cực chuẩn. Không cần ghi chép thủ công nữa, tiết kiệm 15 phút mỗi ngày.",
  },
  {
    name: "Lê Thu Hằng",
    role: "Marketing Manager, 24 tuổi",
    initials: "LT",
    color: "from-teal-400 to-cyan-500",
    quote:
      "Dashboard budget insight giúp tôi phát hiện mình tiêu 30% budget cho trà sữa. Giờ đã cắt giảm và mua được iPhone mới!",
  },
];

const Testimonials = () => {
  return (
    <section id="community" className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Reveal delay={0}>
            <p className="text-[10px] font-medium tracking-widest uppercase text-green-500 mb-4">Cộng đồng</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-5xl sm:text-[56px] font-normal tracking-[-0.04em] text-gray-950 leading-[0.95] mb-4">
              Người dùng nói gì?
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-gray-500 font-light text-[16px]">
              Những câu chuyện thực từ những người dùng thực.
            </p>
          </Reveal>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {reviews.map((rev, idx) => (
            <Reveal key={idx} delay={0.3 + idx * 0.1}>
              <div
                className="h-full relative bg-gray-50 border border-gray-200 rounded-2xl p-7 flex flex-col hover:border-gray-300 transition-colors duration-200"
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-[14.5px] font-light text-gray-700 leading-relaxed flex-1 mb-6">
                  “{rev.quote}”
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-5 border-t border-gray-200">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${rev.color} flex items-center justify-center text-white text-xs font-medium flex-shrink-0`}>
                    {rev.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium tracking-[-0.02em] text-gray-900 leading-none mb-0.5">{rev.name}</p>
                    <p className="text-xs font-light text-gray-400">{rev.role}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Testimonials;