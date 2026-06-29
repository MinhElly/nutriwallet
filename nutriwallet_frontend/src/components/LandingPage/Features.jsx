

const Features = () => {
  const featureList = [
    { title: 'AI Food Recognition', desc: 'Nhận diện chính xác hàng nghìn món ăn Việt Nam & quốc tế chỉ từ một bức ảnh.', icon: '📷' },
    { title: 'Nutrition Tracking', desc: 'Theo dõi calories, protein, carbs, fat theo thời gian thực với biểu đồ chi tiết.', icon: '🔥' },
    { title: 'Expense Tracking', desc: 'Ghi nhận chi phí bữa ăn tự động, phân tích xu hướng chi tiêu theo tuần và tháng.', icon: '💰' },
    { title: 'Budget Alert', desc: 'Cảnh báo thông minh khi sắp vượt ngân sách, gợi ý điều chỉnh phù hợp.', icon: '🚨' },
    { title: 'Smart Insights', desc: 'AI phân tích thói quen ăn uống và chi tiêu, đưa ra lời khuyên cá nhân hóa.', icon: '🧠' },
    { title: 'Social Sharing', desc: 'Chia sẻ bữa ăn, tham gia thử thách, cạnh tranh trên leaderboard cộng đồng.', icon: '👥' }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">Tính năng nổi bật</h2>
        <p className="text-lg text-gray-500 mb-16">Mọi thứ bạn cần để sống khỏe và tiết kiệm</p>

        <div className="grid md:grid-cols-3 gap-8 text-left">
          {featureList.map((feat, index) => (
            <div key={index} className="p-8 rounded-3xl border border-gray-100 hover:border-green-100 bg-white shadow-sm hover:shadow-md transition">
              <span className="text-2xl">{feat.icon}</span>
              <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2">{feat.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;