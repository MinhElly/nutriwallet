const problems = [
  {
    num: "01",
    accent: "border-red-400",
    bgIcon: "bg-red-50 text-red-500",
    icon: "👛",
    title: "Cháy túi cuối tháng",
    desc: "Không kiểm soát được chi phí ăn uống. Trà sữa, ăn hàng vô tội vạ khiến ví tiền báo động.",
  },
  {
    num: "02",
    accent: "border-amber-400",
    bgIcon: "bg-amber-50 text-amber-500",
    icon: "💛",
    title: "Tăng cân không kiểm soát",
    desc: "Ăn không theo kế hoạch, calo nạp vào vượt mức mà không hề hay biết do lười tính toán thủ công.",
  },
  {
    num: "03",
    accent: "border-blue-400",
    bgIcon: "bg-blue-50 text-blue-500",
    icon: "🕒",
    title: "Quên ghi chép thủ công",
    desc: "Các ứng dụng khác yêu cầu nhập tay quá phức tạp, dễ gây chán nản và bỏ cuộc chỉ sau vài ngày.",
  },
];

const Problem = () => {
  return (
    <section className="py-24 bg-gray-50 border-t border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Section header */}
        <div className="mb-16 max-w-xl">
          <p className="text-xs font-semibold tracking-widest uppercase text-green-500 mb-4">
            Vấn đề
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-[-0.03em] text-gray-950 leading-[1.1] mb-5">
            Bạn đang gặp vấn đề này?
          </h2>
          <p className="text-gray-500 text-[16px] leading-relaxed">
            Hầu hết người trẻ đều gặp 3 vấn đề này mỗi tháng — và không tìm ra cách giải quyết.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {problems.map((p) => (
            <div
              key={p.num}
              className={`relative bg-white border border-gray-100 rounded-2xl p-7 overflow-hidden group hover:border-gray-200 hover:shadow-md transition-all duration-200`}
            >
              {/* Top accent bar */}
              <div className={`absolute top-0 left-6 right-6 h-px ${p.accent} opacity-60`} />
              
              <div className="flex items-start justify-between mb-5">
                <div className={`w-11 h-11 ${p.bgIcon} rounded-xl flex items-center justify-center text-xl`}>
                  {p.icon}
                </div>
                <span className="text-3xl font-bold text-gray-200 leading-none tracking-tight">{p.num}</span>
              </div>
              <h3 className="text-[16px] font-semibold text-gray-900 mb-2.5 leading-snug">{p.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Problem;