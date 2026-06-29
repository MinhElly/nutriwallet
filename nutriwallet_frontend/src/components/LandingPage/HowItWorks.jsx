

const HowItWorks = () => {
  const steps = [
    { step: 'Chụp ảnh', desc: 'Mở app, chụp bữa ăn', icon: '📷' },
    { step: 'AI Detect', desc: 'AI nhận diện tức thì', icon: '🤖' },
    { step: 'Nutrition', desc: 'Phân tích dinh dưỡng', icon: '🥗' },
    { step: 'Expense', desc: 'Ghi nhận chi phí tự động', icon: '💳' },
    { step: 'Insight', desc: 'Nhận gợi ý từ AI', icon: '🧠' }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">Cách hoạt động</h2>
        <p className="text-lg text-gray-500 mb-16">5 bước đơn giản, tự động hoàn toàn</p>

        <div className="relative max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6">
          {steps.map((item, index) => (
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
  );
};

export default HowItWorks;