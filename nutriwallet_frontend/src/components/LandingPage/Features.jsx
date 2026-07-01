import Reveal from "../common/Reveal";

const featureList = [
  {
    title: "Nhận diện món ăn bằng AI",
    desc: "Nhận diện chính xác hàng nghìn món ăn Việt Nam & quốc tế chỉ từ một bức ảnh. Nhanh, chuẩn, không cần gõ tay.",
    emoji: "📸",
    gradient: "from-pink-500 via-rose-500 to-orange-400",
    bg: "bg-gradient-to-br from-pink-50 to-rose-50",
    border: "border-pink-100",
    hover: "hover:shadow-pink-100",
    badge: "🔥 Nổi bật",
    badgeColor: "bg-rose-100 text-rose-600",
    wide: true,
  },
  {
    title: "Theo dõi dinh dưỡng",
    desc: "Calories, protein, carbs, fat theo thời gian thực với biểu đồ chi tiết.",
    emoji: "📊",
    gradient: "from-green-500 to-emerald-500",
    bg: "bg-gradient-to-br from-green-50 to-emerald-50",
    border: "border-green-100",
    hover: "hover:shadow-green-100",
    badge: null,
    wide: false,
  },
  {
    title: "Theo dõi chi tiêu",
    desc: "Ghi nhận chi phí bữa ăn tự động, phân tích xu hướng chi tiêu theo tuần và tháng.",
    emoji: "💰",
    gradient: "from-blue-500 to-cyan-500",
    bg: "bg-gradient-to-br from-blue-50 to-cyan-50",
    border: "border-blue-100",
    hover: "hover:shadow-blue-100",
    badge: null,
    wide: false,
  },
  {
    title: "Cảnh báo ngân sách",
    desc: "Cảnh báo thông minh khi sắp vượt ngân sách, gợi ý điều chỉnh phù hợp.",
    emoji: "🔔",
    gradient: "from-amber-500 to-yellow-400",
    bg: "bg-gradient-to-br from-amber-50 to-yellow-50",
    border: "border-amber-100",
    hover: "hover:shadow-amber-100",
    badge: null,
    wide: false,
  },
  {
    title: "Gợi ý thông minh từ AI",
    desc: "AI phân tích thói quen ăn uống và chi tiêu, đưa ra lời khuyên cá nhân hóa mỗi ngày.",
    emoji: "🧠",
    gradient: "from-violet-500 to-purple-600",
    bg: "bg-gradient-to-br from-violet-50 to-purple-50",
    border: "border-violet-100",
    hover: "hover:shadow-violet-100",
    badge: "✨ AI mới",
    badgeColor: "bg-violet-100 text-violet-600",
    wide: false,
  },
  {
    title: "Cộng đồng & Chia sẻ",
    desc: "Chia sẻ bữa ăn, tham gia thử thách, cạnh tranh trên leaderboard cộng đồng.",
    emoji: "👥",
    gradient: "from-teal-500 to-cyan-400",
    bg: "bg-gradient-to-br from-teal-50 to-cyan-50",
    border: "border-teal-100",
    hover: "hover:shadow-teal-100",
    badge: null,
    wide: false,
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-gray-50 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <Reveal delay={0}>
            <p className="text-xs font-semibold tracking-widest uppercase text-green-500 mb-4">Tính năng</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-[-0.03em] text-gray-950 leading-[1.1] mb-4">
              Mọi thứ bạn cần
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-gray-500 text-[16px] leading-relaxed max-w-md mx-auto">
              Được xây dựng cho người trẻ bận rộn — thông minh, nhanh và không cần ghi chép.
            </p>
          </Reveal>
        </div>

        {/* 3×2 grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {featureList.map((feat, idx) => (
            <Reveal key={idx} delay={0.3 + idx * 0.1}>
              <div
                className={`h-full relative ${feat.bg} border ${feat.border} rounded-3xl p-6 overflow-hidden group cursor-default transition-all duration-300 hover:shadow-lg ${feat.hover}`}
              >
                <div className={`absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br ${feat.gradient} opacity-10 rounded-full blur-xl group-hover:opacity-20 transition-opacity duration-500`} />

                <div className="relative z-10">
                  {feat.badge && (
                    <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${feat.badgeColor} mb-3`}>
                      {feat.badge}
                    </span>
                  )}
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center text-xl shadow-md mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {feat.emoji}
                  </div>
                  <h3 className="text-[15px] font-bold text-gray-900 mb-2">{feat.title}</h3>
                  <p className="text-[13px] text-gray-500 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Features;