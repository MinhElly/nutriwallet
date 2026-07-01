import Reveal from "../common/Reveal";

const steps = [
  {
    title: "Chụp ảnh món ăn",
    desc: "Mở app, chụp nhanh bữa ăn. Không cần căn chỉnh, AI xử lý mọi góc độ.",
    emoji: "📷",
    gradient: "from-pink-500 to-rose-500",
    glow: "shadow-pink-200",
    light: "bg-pink-50",
    tag: "< 1 giây",
  },
  {
    title: "AI nhận diện tức thì",
    desc: "Model AI nhận diện chính xác tên món, nguyên liệu, khẩu phần chỉ trong 2–3 giây.",
    emoji: "🤖",
    gradient: "from-violet-500 to-purple-600",
    glow: "shadow-violet-200",
    light: "bg-violet-50",
    tag: "2–3 giây",
  },
  {
    title: "Phân tích dinh dưỡng",
    desc: "Calories, protein, carbs, fat — hiển thị chi tiết và lưu lịch sử ngay lập tức.",
    emoji: "🥗",
    gradient: "from-green-500 to-emerald-500",
    glow: "shadow-green-200",
    light: "bg-green-50",
    tag: "Real-time",
  },
  {
    title: "Ghi nhận chi tiêu",
    desc: "Chi phí bữa ăn được tự động ghi lại và phân loại — không cần nhập thủ công.",
    emoji: "💳",
    gradient: "from-blue-500 to-cyan-500",
    glow: "shadow-blue-200",
    light: "bg-blue-50",
    tag: "Tự động",
  },
  {
    title: "Nhận gợi ý từ AI",
    desc: "Dashboard cá nhân hóa phân tích xu hướng và đưa ra lời khuyên tối ưu cho bạn.",
    emoji: "🧠",
    gradient: "from-amber-500 to-orange-500",
    glow: "shadow-amber-200",
    light: "bg-amber-50",
    tag: "Mỗi ngày",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-white border-t border-gray-100 overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Reveal delay={0}>
            <p className="text-[10px] font-medium tracking-widest uppercase text-green-500 mb-4">Cách hoạt động</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-5xl sm:text-[56px] font-normal tracking-[-0.04em] text-gray-950 leading-[0.95] mb-4">
              5 bước, hoàn toàn tự động
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-gray-500 font-light text-[16px] max-w-lg mx-auto">
              Từ lúc chụp ảnh đến khi có báo cáo — tất cả xảy ra trong dưới 5 giây.
            </p>
          </Reveal>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {steps.map((step, idx) => (
            <Reveal
              key={idx}
              delay={0.3 + idx * 0.1}
              className="group relative flex flex-col items-center text-center"
            >
              {/* Arrow connector (desktop only, not on last) */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[calc(50%+28px)] right-[-50%] h-px border-t-2 border-dashed border-gray-200 z-0" />
              )}

              {/* Icon card */}
              <div
                className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-2xl shadow-lg ${step.glow} group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 mb-3 z-10`}
              >
                {step.emoji}
                {/* Step number badge */}
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-white border-2 border-gray-100 text-gray-700 text-[10px] font-medium rounded-full flex items-center justify-center shadow-sm">
                  {idx + 1}
                </span>
              </div>

              {/* Time tag */}
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${step.light} text-gray-500 mb-2`}>
                {step.tag}
              </span>

              <h4 className="text-[13px] font-medium tracking-[-0.02em] text-gray-900 mb-1.5 leading-tight">{step.title}</h4>
              <p className="text-[11.5px] font-light text-gray-400 leading-relaxed max-w-[130px]">{step.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;