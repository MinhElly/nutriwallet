

const Testimonials = () => {
  const reviews = [
    { name: 'Nguyễn Minh Anh', role: 'UX Designer, 26 tuổi', bg: 'bg-emerald-500', initial: 'NM', text: '"NutriWallet AI đã giúp tôi tiết kiệm 800k/tháng và giảm 3kg chỉ trong 6 tuần. AI nhận diện chính xác đến kinh ngạc!"' },
    { name: 'Trần Tuấn Kiệt', role: 'Software Engineer, 28 tuổi', bg: 'bg-green-500', initial: 'TT', text: '"AI nhận diện phở bò, bánh cuốn hay cơm tấm đều cực chuẩn. Không cần ghi chép thủ công nữa, tiết kiệm 15 phút mỗi ngày."' },
    { name: 'Lê Thu Hằng', role: 'Marketing Manager, 24 tuổi', bg: 'bg-teal-500', initial: 'LT', text: '"Dashboard budget insight giúp tôi phát hiện mình tiêu 30% budget cho trà sữa 🥰 Giờ đã cắt giảm và mua được iPhone mới!"' }
  ];

  return (
    <section id="community" className="py-20 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight mb-16">Người dùng nói gì?</h2>
        
        <div className="grid md:grid-cols-3 gap-8 text-left">
          {reviews.map((rev, index) => (
            <div key={index} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex text-amber-400 gap-1 mb-4">★★★★★</div>
              <p className="text-gray-600 text-sm italic leading-relaxed mb-6">{rev.text}</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${rev.bg} flex items-center justify-center text-white font-bold text-sm`}>
                  {rev.initial}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-800">{rev.name}</h4>
                  <span className="text-xs text-gray-400">{rev.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;